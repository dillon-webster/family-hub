//! Reading subscribed ICS calendars.
//!
//! Feeds are pulled on an interval and mirrored into `calendar_events`, keyed by
//! the feed and the event's UID so a re-sync replaces rather than duplicates.
//! Recurring events are expanded to concrete occurrences inside a bounded
//! window — the hub only ever shows a week, so materialising a year is plenty
//! and keeps the read path a simple range query.

use anyhow::{Context, anyhow};
use chrono::{DateTime, Duration, Utc};
use icalendar::{Calendar, CalendarComponent, CalendarDateTime, Component, DatePerhapsTime};
use rrule::{RRuleSet, Tz as RruleTz};
use sqlx::PgPool;
use uuid::Uuid;

/// How far ahead recurring events are materialised.
const HORIZON_DAYS: i64 = 400;
/// Ceiling on occurrences from a single rule, so a malformed or infinite RRULE
/// cannot fill the table.
const MAX_OCCURRENCES: u16 = 750;

pub struct ParsedEvent {
    pub uid: String,
    pub title: String,
    pub starts_at: DateTime<Utc>,
    pub ends_at: Option<DateTime<Utc>>,
    pub all_day: bool,
}

fn to_utc(value: &DatePerhapsTime) -> Option<(DateTime<Utc>, bool)> {
    match value {
        // A "floating" time carries no zone — it means the same wall-clock time
        // wherever you are. `try_into_utc` declines to guess and returns None,
        // which would silently drop the event, so read it as UTC instead: for a
        // household calendar a slightly offset event beats a missing one.
        DatePerhapsTime::DateTime(CalendarDateTime::Floating(naive)) => {
            Some((naive.and_utc(), false))
        }
        DatePerhapsTime::DateTime(dt) => dt.try_into_utc().map(|d| (d, false)),
        // An all-day event has no instant; anchor it at midnight and let the
        // client render it as a day rather than a time.
        DatePerhapsTime::Date(date) => date
            .and_hms_opt(0, 0, 0)
            .map(|naive| (naive.and_utc(), true)),
    }
}

/// Parse an ICS document into concrete, dated occurrences.
pub fn parse(body: &str) -> anyhow::Result<Vec<ParsedEvent>> {
    let calendar: Calendar = body
        .parse::<Calendar>()
        .map_err(|e| anyhow!("could not read the calendar feed: {e}"))?;

    let now = Utc::now();
    let window_start = now - Duration::days(30);
    let window_end = now + Duration::days(HORIZON_DAYS);

    let mut out = Vec::new();

    for component in calendar.components.iter() {
        let CalendarComponent::Event(event) = component else {
            continue;
        };

        let Some((start, all_day)) = event.get_start().as_ref().and_then(to_utc) else {
            continue;
        };
        let end = event.get_end().as_ref().and_then(to_utc).map(|(d, _)| d);
        let duration = end.map(|e| e - start);

        let uid = event
            .get_uid()
            .map(str::to_string)
            .unwrap_or_else(|| format!("{}-{}", start.timestamp(), event.get_summary().unwrap_or("")));
        let title = event
            .get_summary()
            .map(str::to_string)
            .unwrap_or_else(|| "Untitled".into());

        // Non-recurring: take it as-is if it falls in the window.
        let Some(rrule_line) = event.property_value("RRULE") else {
            if start >= window_start && start <= window_end {
                out.push(ParsedEvent {
                    uid,
                    title,
                    starts_at: start,
                    ends_at: end,
                    all_day,
                });
            }
            continue;
        };

        // rrule wants the DTSTART and the rule together.
        let spec = format!(
            "DTSTART:{}\nRRULE:{}",
            start.format("%Y%m%dT%H%M%SZ"),
            rrule_line
        );

        let occurrences = match spec.parse::<RRuleSet>() {
            Ok(set) => {
                let set = set
                    .after(window_start.with_timezone(&RruleTz::UTC))
                    .before(window_end.with_timezone(&RruleTz::UTC));
                set.all(MAX_OCCURRENCES).dates
            }
            Err(err) => {
                // One unreadable rule should not cost the household the rest of
                // the feed; fall back to the single dated instance.
                tracing::warn!(%uid, error = %err, "skipping unreadable recurrence rule");
                vec![]
            }
        };

        if occurrences.is_empty() && start >= window_start && start <= window_end {
            out.push(ParsedEvent {
                uid,
                title,
                starts_at: start,
                ends_at: end,
                all_day,
            });
            continue;
        }

        for occurrence in occurrences {
            let occurrence_start = occurrence.with_timezone(&Utc);
            out.push(ParsedEvent {
                // Each occurrence needs its own key or they collide on the
                // feed+uid unique index and only one survives.
                uid: format!("{uid}::{}", occurrence_start.timestamp()),
                title: title.clone(),
                starts_at: occurrence_start,
                ends_at: duration.map(|d| occurrence_start + d),
                all_day,
            });
        }
    }

    Ok(out)
}

/// Fetch one feed and replace its mirrored events.
pub async fn sync_feed(
    db: &PgPool,
    http: &reqwest::Client,
    feed_id: Uuid,
) -> anyhow::Result<usize> {
    let (url, member_id): (String, Option<Uuid>) =
        sqlx::query_as("select url, member_id from calendar_feeds where id = $1")
            .bind(feed_id)
            .fetch_optional(db)
            .await?
            .context("no such feed")?;

    // webcal:// is the same document over https; providers hand it out for
    // one-click subscription and it is a common thing to paste in.
    let url = url.replace("webcal://", "https://");

    let result: anyhow::Result<Vec<ParsedEvent>> = async {
        let response = http.get(&url).send().await?;
        if !response.status().is_success() {
            return Err(anyhow!("the calendar returned {}", response.status()));
        }
        parse(&response.text().await?)
    }
    .await;

    let events = match result {
        Ok(events) => events,
        Err(err) => {
            // Record the failure and keep the previously synced events on
            // screen; a stale calendar beats an empty one.
            sqlx::query(
                "update calendar_feeds set last_error = $2, last_synced_at = now() where id = $1",
            )
            .bind(feed_id)
            .bind(err.to_string())
            .execute(db)
            .await?;
            return Err(err);
        }
    };

    let mut tx = db.begin().await?;

    sqlx::query("delete from calendar_events where feed_id = $1")
        .bind(feed_id)
        .execute(&mut *tx)
        .await?;

    for event in &events {
        sqlx::query(
            "insert into calendar_events
                (title, starts_at, ends_at, all_day, member_id, feed_id, external_uid)
             values ($1, $2, $3, $4, $5, $6, $7)
             on conflict do nothing",
        )
        .bind(&event.title)
        .bind(event.starts_at)
        .bind(event.ends_at)
        .bind(event.all_day)
        .bind(member_id)
        .bind(feed_id)
        .bind(&event.uid)
        .execute(&mut *tx)
        .await?;
    }

    sqlx::query(
        "update calendar_feeds set last_synced_at = now(), last_error = null where id = $1",
    )
    .bind(feed_id)
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;

    Ok(events.len())
}

/// Sync every enabled feed; returns how many events landed in total.
pub async fn sync_all(db: &PgPool, http: &reqwest::Client) -> anyhow::Result<usize> {
    let feeds: Vec<Uuid> =
        sqlx::query_scalar("select id from calendar_feeds where enabled order by created_at")
            .fetch_all(db)
            .await?;

    let mut total = 0;
    for feed_id in feeds {
        match sync_feed(db, http, feed_id).await {
            Ok(count) => total += count,
            Err(err) => tracing::warn!(%feed_id, error = %err, "calendar feed sync failed"),
        }
    }
    Ok(total)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reads_a_plain_timed_event() {
        let now = Utc::now().format("%Y%m%dT%H%M%SZ").to_string();
        let ics = format!(
            "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//test//EN\r\n\
             BEGIN:VEVENT\r\nUID:abc-123\r\nDTSTAMP:{now}\r\nDTSTART:{now}\r\n\
             SUMMARY:Soccer practice\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n"
        );

        let events = parse(&ics).unwrap();
        assert_eq!(events.len(), 1);
        assert_eq!(events[0].title, "Soccer practice");
        assert_eq!(events[0].uid, "abc-123");
        assert!(!events[0].all_day);
    }

    #[test]
    fn expands_a_weekly_recurrence_into_distinct_occurrences() {
        let start = (Utc::now() + Duration::days(1))
            .format("%Y%m%dT%H%M%SZ")
            .to_string();
        let ics = format!(
            "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//test//EN\r\n\
             BEGIN:VEVENT\r\nUID:weekly-1\r\nDTSTAMP:{start}\r\nDTSTART:{start}\r\n\
             RRULE:FREQ=WEEKLY;COUNT=5\r\nSUMMARY:Piano\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n"
        );

        let events = parse(&ics).unwrap();
        assert_eq!(events.len(), 5);

        // Every occurrence needs its own uid or the unique index collapses them.
        let mut uids: Vec<&str> = events.iter().map(|e| e.uid.as_str()).collect();
        uids.sort_unstable();
        uids.dedup();
        assert_eq!(uids.len(), 5);
    }

    #[test]
    fn an_all_day_event_is_flagged_rather_than_given_a_time() {
        let day = (Utc::now() + Duration::days(2)).format("%Y%m%d").to_string();
        let ics = format!(
            "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//test//EN\r\n\
             BEGIN:VEVENT\r\nUID:allday-1\r\nDTSTAMP:20260101T000000Z\r\n\
             DTSTART;VALUE=DATE:{day}\r\nSUMMARY:Half day\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n"
        );

        let events = parse(&ics).unwrap();
        assert_eq!(events.len(), 1);
        assert!(events[0].all_day);
    }
}
