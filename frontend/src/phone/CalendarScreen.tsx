import { useState } from 'react';
import { CalendarPlus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

import { api } from '../api/client';
import { useStore } from '../api/store';
import type { CalendarEvent } from '../api/types';
import {
  addDays,
  dayNumber,
  dayShort,
  eventTime,
  isSameDay,
  isoDate,
  mondayOf,
  weekDays,
  weekRange,
} from '../lib/week';
import { AddEventSheet } from './AddEventSheet';

/**
 * The family calendar, on the phone.
 *
 * The hub's version is seven columns side by side, which is right for a wall
 * and wrong for a hand. This is the same week as a vertical run of days, so the
 * answer to "what has this week got in it" is a scroll rather than a squint.
 */
export function CalendarScreen({ flash }: { flash: (message: string) => void }) {
  const { data, weekStart, setWeekStart } = useStore();
  const [adding, setAdding] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  if (!data) return null;

  const days = weekDays(weekStart);
  const today = new Date();
  const members = new Map(data.members.map((member) => [member.id, member]));
  const thisWeek = isoDate(weekStart) === isoDate(mondayOf(today));

  const eventsOn = (day: Date): CalendarEvent[] =>
    data.events
      .filter((event) => isSameDay(new Date(event.starts_at), day))
      .sort((a, b) => {
        // All-day first, then by time — which is the order the day happens in.
        if (a.all_day !== b.all_day) return a.all_day ? -1 : 1;
        return a.starts_at.localeCompare(b.starts_at);
      });

  const remove = async (event: CalendarEvent) => {
    if (confirming !== event.id) {
      setConfirming(event.id);
      window.setTimeout(() => setConfirming((id) => (id === event.id ? null : id)), 4000);
      return;
    }
    await api.deleteEvent(event.id);
    await api.syncFeeds().catch(() => undefined);
    setConfirming(null);
    flash('Removed from the calendar');
  };

  return (
    <>
      <div
        className="scroll-none"
        style={{
          position: 'absolute',
          inset: 0,
          overflowY: 'auto',
          padding: 'calc(14px + env(safe-area-inset-top)) 20px 170px',
        }}
      >
        <h1 className="display-title" style={{ fontSize: 32, margin: 0 }}>
          {thisWeek ? 'This week' : weekRange(weekStart)}
        </h1>
        <div style={{ fontSize: 15, color: '#6F6357', marginTop: 3 }}>
          {thisWeek ? `${weekRange(weekStart)} · ` : ''}
          {days.reduce((total, day) => total + eventsOn(day).length, 0)} on
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
          <RoundButton label="Previous week" onClick={() => setWeekStart(addDays(weekStart, -7))}>
            <ChevronLeft size={20} strokeWidth={2} />
          </RoundButton>

          <button
            type="button"
            className="pressable"
            onClick={() => setWeekStart(mondayOf(new Date()))}
            style={
              {
                height: 44,
                padding: '0 18px',
                borderRadius: 999,
                border: `1px solid ${thisWeek ? '#DBCBB1' : '#C8553D'}`,
                color: thisWeek ? '#9C8E7E' : '#C8553D',
                fontSize: 15,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                '--bg-press': '#F6EDDE',
              } as React.CSSProperties
            }
          >
            This week
          </button>

          <RoundButton label="Next week" onClick={() => setWeekStart(addDays(weekStart, 7))}>
            <ChevronRight size={20} strokeWidth={2} />
          </RoundButton>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
          {days.map((day) => {
            const events = eventsOn(day);
            const isToday = isSameDay(day, today);

            return (
              <section key={isoDate(day)} style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 46, flex: '0 0 46px', textAlign: 'center', paddingTop: 2 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.10em',
                      textTransform: 'uppercase',
                      color: isToday ? '#C8553D' : '#9C8E7E',
                    }}
                  >
                    {dayShort(day)}
                  </div>
                  <div
                    className="mono"
                    style={{ fontSize: 20, color: isToday ? '#C8553D' : '#6F6357', marginTop: 1 }}
                  >
                    {dayNumber(day)}
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {events.map((event) => {
                    const owner = event.member_id ? members.get(event.member_id) : undefined;
                    const color = owner?.color ?? '#9C8E7E';
                    // A feed event is replaced wholesale on the next sync, so
                    // deleting it here would only make it reappear.
                    const local = !event.feed_id;

                    return (
                      <div
                        key={event.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          background: '#FFFDF9',
                          border: '1px solid #E9DDCA',
                          borderLeft: `3px solid ${color}`,
                          borderRadius: 14,
                          padding: '10px 12px',
                          minHeight: 62,
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="mono" style={{ fontSize: 13, color }}>
                            {event.all_day ? 'All day' : eventTime(new Date(event.starts_at))}
                          </div>
                          <div
                            style={{
                              fontSize: 16,
                              fontWeight: 600,
                              color: '#2B2521',
                              lineHeight: 1.3,
                              marginTop: 2,
                              textWrap: 'pretty',
                            }}
                          >
                            {event.title}
                          </div>
                        </div>

                        {owner && (
                          <span
                            style={{
                              width: 26,
                              height: 26,
                              flex: '0 0 26px',
                              borderRadius: 999,
                              background: color,
                              color: '#FFF8F2',
                              fontSize: 12,
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {owner.initial}
                          </span>
                        )}

                        {local && (
                          <button
                            type="button"
                            className="pressable"
                            aria-label={`Remove ${event.title}`}
                            onClick={() => remove(event)}
                            style={
                              {
                                height: 38,
                                padding: confirming === event.id ? '0 12px' : 0,
                                width: confirming === event.id ? 'auto' : 38,
                                borderRadius: 999,
                                flex: '0 0 auto',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 6,
                                fontSize: 13,
                                fontWeight: 600,
                                color: confirming === event.id ? '#C8553D' : '#9C8E7E',
                                '--bg-press': '#F6EDDE',
                              } as React.CSSProperties
                            }
                          >
                            <Trash2 size={16} strokeWidth={2} />
                            {confirming === event.id && 'Sure?'}
                          </button>
                        )}
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    className="pressable"
                    onClick={() => setAdding(isoDate(day))}
                    style={
                      {
                        minHeight: 44,
                        borderRadius: 14,
                        border: '1px dashed #DBCBB1',
                        color: '#9C8E7E',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        '--bg-press': '#F6EDDE',
                      } as React.CSSProperties
                    }
                  >
                    <CalendarPlus size={16} strokeWidth={2} />
                    {events.length === 0 ? 'Nothing on — add something' : 'Add'}
                  </button>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {adding && (
        <AddEventSheet
          day={adding}
          onClose={() => setAdding(null)}
          onAdded={() => {
            setAdding(null);
            flash('Added to the calendar');
          }}
        />
      )}
    </>
  );
}

function RoundButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="pressable"
      aria-label={label}
      onClick={onClick}
      style={
        {
          width: 44,
          height: 44,
          borderRadius: 999,
          border: '1px solid #DBCBB1',
          color: '#6F6357',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '--bg-press': '#F6EDDE',
        } as React.CSSProperties
      }
    >
      {children}
    </button>
  );
}
