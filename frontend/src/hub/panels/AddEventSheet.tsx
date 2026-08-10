import { useState } from 'react';

import { api } from '../../api/client';
import { useStore } from '../../api/store';
import { assignLabel } from '../../lib/week';
import { CloseButton } from './AssignPanel';
import { Sheet } from './Sheet';

export function AddEventSheet({ day, onClose }: { day: string; onClose: () => void }) {
  const { data, refresh } = useStore();
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('18:00');
  const [allDay, setAllDay] = useState(false);
  const [memberId, setMemberId] = useState<string | null>(data?.members[0]?.id ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const field: React.CSSProperties = {
    background: '#1C1815',
    border: '1px solid rgba(252,247,239,0.14)',
    borderRadius: 14,
    padding: '14px 16px',
    fontSize: 17,
    color: '#FAF3E9',
    outline: 'none',
    width: '100%',
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
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add that event.');
      setBusy(false);
    }
  };

  return (
    <Sheet width={430} onClose={onClose}>
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div className="overline">New event</div>
          <div className="serif" style={{ fontSize: 30, color: '#FAF3E9', marginTop: 6 }}>
            {assignLabel(new Date(`${day}T12:00:00`))}
          </div>
        </div>
        <CloseButton onClose={onClose} />
      </header>

      <div>
        <div className="overline" style={{ marginBottom: 8 }}>
          What
        </div>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && save()}
          placeholder="Soccer practice"
          style={field}
          autoFocus
        />
      </div>

      <div>
        <div className="overline" style={{ marginBottom: 8 }}>
          When
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            type="time"
            value={time}
            disabled={allDay}
            onChange={(event) => setTime(event.target.value)}
            className="mono"
            style={{ ...field, flex: 1, opacity: allDay ? 0.4 : 1 }}
          />
          <button
            type="button"
            className="pressable"
            onClick={() => setAllDay((value) => !value)}
            style={
              {
                height: 52,
                padding: '0 18px',
                borderRadius: 14,
                border: allDay ? '1px solid transparent' : '1px solid rgba(252,247,239,0.16)',
                color: allDay ? '#FFF8F2' : '#BFB0A0',
                display: 'flex',
                alignItems: 'center',
                fontSize: 15,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                '--bg': allDay ? '#C8553D' : 'transparent',
                '--bg-press': allDay ? '#A23F29' : '#2E2823',
              } as React.CSSProperties
            }
          >
            All day
          </button>
        </div>
      </div>

      <div>
        <div className="overline" style={{ marginBottom: 8 }}>
          Whose
        </div>
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
                    height: 48,
                    padding: '0 18px',
                    borderRadius: 999,
                    border: active ? '1px solid transparent' : '1px solid rgba(252,247,239,0.16)',
                    color: active ? '#FFF8F2' : '#BFB0A0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 16,
                    fontWeight: 600,
                    '--bg': active ? member.color : 'transparent',
                    '--bg-press': active ? member.color : '#2E2823',
                  } as React.CSSProperties
                }
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: active ? '#FFF8F2' : member.color,
                  }}
                />
                {member.name}
              </button>
            );
          })}
        </div>
      </div>

      {error && <div style={{ fontSize: 15, color: '#E37A57', lineHeight: 1.5 }}>{error}</div>}

      <div style={{ flex: 1 }} />

      <button
        type="button"
        className="pressable"
        onClick={save}
        style={
          {
            height: 60,
            borderRadius: 16,
            color: '#FFF8F2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            fontWeight: 600,
            opacity: title.trim() ? 1 : 0.5,
            '--bg': '#C8553D',
            '--bg-press': '#A23F29',
          } as React.CSSProperties
        }
      >
        {busy ? 'Adding…' : 'Add to the calendar'}
      </button>
    </Sheet>
  );
}
