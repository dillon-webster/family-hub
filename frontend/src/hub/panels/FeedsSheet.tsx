import { useEffect, useState } from 'react';
import { RefreshCw, Trash2 } from 'lucide-react';

import { api } from '../../api/client';
import { useStore } from '../../api/store';
import type { CalendarFeed } from '../../api/types';
import { CloseButton } from './AssignPanel';
import { Pulse } from './AddRecipeSheet';
import { Sheet } from './Sheet';

/**
 * Subscribed calendars.
 *
 * The address of a shared calendar is a bearer token in disguise — anyone with
 * the link can read the calendar — so it is write-only here: you can add one
 * and remove one, but the hub never shows it again, and the API never sends it
 * back to the browser.
 */
export function FeedsSheet({ onClose }: { onClose: () => void }) {
  const { data, refresh } = useStore();
  const [feeds, setFeeds] = useState<CalendarFeed[] | null>(null);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [memberId, setMemberId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = () => api.feeds().then(setFeeds).catch(() => setFeeds([]));

  useEffect(() => {
    void reload();
  }, []);

  const field: React.CSSProperties = {
    background: '#1C1815',
    border: '1px solid rgba(252,247,239,0.14)',
    borderRadius: 14,
    padding: '14px 16px',
    fontSize: 16,
    color: '#FAF3E9',
    outline: 'none',
    width: '100%',
  };

  const add = async () => {
    if (!url.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await api.addFeed({
        name: name.trim() || 'Calendar',
        url: url.trim(),
        member_id: memberId,
      });
      setName('');
      setUrl('');
      await reload();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add that calendar.');
    } finally {
      setBusy(false);
    }
  };

  const sync = async () => {
    setBusy(true);
    try {
      await api.syncFeeds();
      await reload();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    await api.deleteFeed(id);
    await reload();
    await refresh();
  };

  return (
    <Sheet width={470} onClose={onClose}>
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div className="overline">Calendars</div>
          <div className="serif" style={{ fontSize: 30, color: '#FAF3E9', marginTop: 6 }}>
            Subscribed feeds
          </div>
          <div style={{ fontSize: 15, color: '#8E8073', marginTop: 4, lineHeight: 1.45 }}>
            Read-only. Paste the secret address from Google Calendar or iCloud.
          </div>
        </div>
        <CloseButton onClose={onClose} />
      </header>

      <div className="scroll-none" style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
        {feeds === null && <Pulse label="Loading calendars…" />}
        {feeds?.length === 0 && (
          <div style={{ fontSize: 16, color: '#8E8073', lineHeight: 1.5 }}>
            Nothing subscribed yet. Events added on the hub still show up on their own.
          </div>
        )}
        {feeds?.map((feed) => (
          <div
            key={feed.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: '#2E2823',
              borderRadius: 16,
              padding: '12px 14px',
              minHeight: 64,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 600, color: '#FAF3E9' }}>{feed.name}</div>
              <div style={{ fontSize: 13, color: feed.last_error ? '#E37A57' : '#8E8073', marginTop: 3 }}>
                {feed.last_error
                  ? feed.last_error
                  : feed.last_synced_at
                    ? `Synced ${new Date(feed.last_synced_at).toLocaleString()}`
                    : 'Not synced yet'}
              </div>
            </div>
            <button
              type="button"
              className="pressable"
              aria-label={`Remove ${feed.name}`}
              onClick={() => remove(feed.id)}
              style={
                {
                  width: 44,
                  height: 44,
                  flex: '0 0 44px',
                  borderRadius: 999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#8E8073',
                  '--bg-press': '#3A322C',
                } as React.CSSProperties
              }
            >
              <Trash2 size={18} strokeWidth={2} />
            </button>
          </div>
        ))}
      </div>

      <div style={{ height: 1, background: 'rgba(252,247,239,0.10)' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="overline">Add a calendar</div>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Name it — Dan's work, School"
          style={field}
        />
        <input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://calendar.google.com/…/basic.ics"
          inputMode="url"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          className="mono"
          style={{ ...field, fontSize: 14 }}
        />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {data?.members.map((member) => {
            const active = memberId === member.id;
            return (
              <button
                key={member.id}
                type="button"
                className="pressable"
                onClick={() => setMemberId(active ? null : member.id)}
                style={
                  {
                    height: 44,
                    padding: '0 16px',
                    borderRadius: 999,
                    border: active ? '1px solid transparent' : '1px solid rgba(252,247,239,0.16)',
                    color: active ? '#FFF8F2' : '#BFB0A0',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: 15,
                    fontWeight: 600,
                    '--bg': active ? member.color : 'transparent',
                    '--bg-press': active ? member.color : '#2E2823',
                  } as React.CSSProperties
                }
              >
                {member.name}
              </button>
            );
          })}
        </div>

        {error && <div style={{ fontSize: 15, color: '#E37A57', lineHeight: 1.5 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            className="pressable"
            onClick={sync}
            style={
              {
                width: 56,
                height: 56,
                flex: '0 0 56px',
                borderRadius: 16,
                border: '1px solid rgba(252,247,239,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#BFB0A0',
                '--bg-press': 'rgba(252,247,239,0.06)',
              } as React.CSSProperties
            }
            aria-label="Sync now"
          >
            <RefreshCw size={20} strokeWidth={2} />
          </button>
          <button
            type="button"
            className="pressable"
            onClick={add}
            style={
              {
                flex: 1,
                height: 56,
                borderRadius: 16,
                color: '#FFF8F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 17,
                fontWeight: 600,
                opacity: url.trim() ? 1 : 0.5,
                '--bg': '#C8553D',
                '--bg-press': '#A23F29',
              } as React.CSSProperties
            }
          >
            {busy ? 'Working…' : 'Subscribe'}
          </button>
        </div>
      </div>
    </Sheet>
  );
}
