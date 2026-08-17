import { useState } from 'react';
import { X } from 'lucide-react';

import { api } from '../api/client';
import { useStore } from '../api/store';
import { assignLabel } from '../lib/week';

/**
 * Adding an event from the phone.
 *
 * The system keyboard is allowed here, unlike the shopping sheet: this is a
 * form you fill in and dismiss, not a list you type into while reading it, so
 * the viewport resizing under it costs nothing. The date and time controls are
 * the native ones for the same reason — a hand-rolled time picker on a phone is
 * strictly worse than the one built into it.
 */
export function AddEventSheet({
  day,
  onClose,
  onAdded,
}: {
  day: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const { data, refresh } = useStore();
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('18:00');
  const [allDay, setAllDay] = useState(false);
  const [memberId, setMemberId] = useState<string | null>(data?.members[0]?.id ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const field: React.CSSProperties = {
    background: '#FFFDF9',
    border: '1px solid #DBCBB1',
    borderRadius: 14,
    padding: '14px 16px',
    fontSize: 17,
    color: '#2B2521',
    outline: 'none',
    width: '100%',
    fontFamily: 'inherit',
  };

  const save = async () => {
    if (!title.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      // Built from local parts, so the instant sent to the server is the one
      // the person standing here meant.
      const startsAt = new Date(`${day}T${allDay ? '00:00' : time}:00`);
      await api.addEvent({
        title: title.trim(),
        starts_at: startsAt.toISOString(),
        all_day: allDay,
        member_id: memberId,
      });
      await refresh();
      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add that event.');
      setBusy(false);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(43,37,33,0.45)', zIndex: 20 }}
      />
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight: '86dvh',
          zIndex: 21,
          background: '#FCF7EF',
          borderRadius: '28px 28px 0 0',
          padding: '16px 20px calc(30px + env(safe-area-inset-bottom))',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          overflowY: 'auto',
          boxShadow: '0 -12px 28px rgba(67,47,28,0.18)',
          animation: 'fh-sheet-up .24s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        <div
          style={{ width: 44, height: 5, borderRadius: 999, background: '#DBCBB1', alignSelf: 'center' }}
        />

        <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div className="overline">New event</div>
            <div className="serif" style={{ fontSize: 26, marginTop: 4 }}>
              {assignLabel(new Date(`${day}T12:00:00`))}
            </div>
          </div>
          <button
            type="button"
            className="pressable"
            aria-label="Close"
            onClick={onClose}
            style={
              {
                width: 48,
                height: 48,
                flex: '0 0 48px',
                borderRadius: 999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6F6357',
                '--bg': '#F6EDDE',
                '--bg-press': '#EFE3D0',
              } as React.CSSProperties
            }
          >
            <X size={20} strokeWidth={2} />
          </button>
        </header>

        <div>
          <div className="overline" style={{ marginBottom: 8 }}>
            What
          </div>
          <input
            autoFocus
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && save()}
            placeholder="Soccer practice"
            enterKeyHint="done"
            style={field}
          />
        </div>

        <div>
          <div className="overline" style={{ marginBottom: 8 }}>
            When
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type="time"
              value={time}
              disabled={allDay}
              onChange={(event) => setTime(event.target.value)}
              className="mono"
              style={{ ...field, flex: 1, opacity: allDay ? 0.45 : 1 }}
            />
            <button
              type="button"
              className="pressable"
              aria-pressed={allDay}
              onClick={() => setAllDay((on) => !on)}
              style={
                {
                  height: 52,
                  padding: '0 18px',
                  borderRadius: 999,
                  border: allDay ? '1px solid transparent' : '1px solid #DBCBB1',
                  color: allDay ? '#FFF8F2' : '#6F6357',
                  fontSize: 15,
                  fontWeight: 600,
                  flex: '0 0 auto',
                  '--bg': allDay ? '#C8553D' : 'transparent',
                  '--bg-press': allDay ? '#A23F29' : '#F6EDDE',
                } as React.CSSProperties
              }
            >
              All day
            </button>
          </div>
        </div>

        {data && data.members.length > 0 && (
          <div>
            <div className="overline" style={{ marginBottom: 8 }}>
              Whose
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {data.members.map((member) => {
                const active = memberId === member.id;
                return (
                  <button
                    key={member.id}
                    type="button"
                    className="pressable"
                    onClick={() => setMemberId(active ? null : member.id)}
                    style={
                      {
                        height: 46,
                        padding: '0 16px 0 10px',
                        borderRadius: 999,
                        border: active ? '1px solid transparent' : '1px solid #DBCBB1',
                        color: active ? '#FFF8F2' : '#6F6357',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 9,
                        fontSize: 15,
                        fontWeight: 600,
                        '--bg': active ? member.color : 'transparent',
                        '--bg-press': active ? member.color : '#F6EDDE',
                      } as React.CSSProperties
                    }
                  >
                    <span
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 999,
                        background: active ? 'rgba(255,248,242,0.28)' : member.color,
                        color: '#FFF8F2',
                        fontSize: 12,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {member.initial}
                    </span>
                    {member.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {error && <div style={{ fontSize: 15, color: '#C8553D', lineHeight: 1.5 }}>{error}</div>}

        <button
          type="button"
          className="pressable"
          onClick={save}
          style={
            {
              height: 58,
              borderRadius: 16,
              color: '#FFF8F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 17,
              fontWeight: 600,
              opacity: title.trim() ? 1 : 0.5,
              flex: '0 0 auto',
              '--bg': '#C8553D',
              '--bg-press': '#A23F29',
            } as React.CSSProperties
          }
        >
          {busy ? 'Adding…' : 'Add to the calendar'}
        </button>
      </div>
    </>
  );
}
