import { useState } from 'react';
import { CalendarPlus, Rss } from 'lucide-react';

import { useStore } from '../../api/store';
import { dayNumber, dayShort, isSameDay, isoDate, weekDays, weekRange } from '../../lib/week';
import { AddEventSheet } from '../panels/AddEventSheet';
import { FeedsSheet } from '../panels/FeedsSheet';

export function CalendarScreen() {
  const { data, weekStart } = useStore();
  const [adding, setAdding] = useState<string | null>(null);
  const [feedsOpen, setFeedsOpen] = useState(false);
  if (!data) return null;

  const days = weekDays(weekStart);
  const today = new Date();
  const members = new Map(data.members.map((member) => [member.id, member]));

  return (
    <div style={{ padding: '30px 34px', height: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20 }}>
        <div>
          <h1 className="display-title" style={{ fontSize: 36, color: '#FAF3E9', margin: 0 }}>
            This week
          </h1>
          <div style={{ fontSize: 16, color: '#8E8073', marginTop: 4 }}>
            {weekRange(weekStart)}, {weekStart.getFullYear()}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 22, alignItems: 'center' }}>
          {data.members.map((member) => (
            <div key={member.id} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ width: 14, height: 14, borderRadius: 999, background: member.color }} />
              <span style={{ fontSize: 17, color: '#BFB0A0' }}>{member.name}</span>
            </div>
          ))}

          <div style={{ width: 1, height: 32, background: 'rgba(252,247,239,0.14)' }} />

          <button
            type="button"
            className="pressable"
            aria-label="Subscribed calendars"
            onClick={() => setFeedsOpen(true)}
            style={
              {
                width: 48,
                height: 48,
                borderRadius: 14,
                border: '1px solid rgba(252,247,239,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#BFB0A0',
                '--bg-press': 'rgba(252,247,239,0.08)',
              } as React.CSSProperties
            }
          >
            <Rss size={20} strokeWidth={2} />
          </button>
          <button
            type="button"
            className="pressable"
            onClick={() => setAdding(isoDate(today))}
            style={
              {
                height: 48,
                padding: '0 20px 0 16px',
                borderRadius: 999,
                color: '#FFF8F2',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 16,
                fontWeight: 600,
                '--bg': '#C8553D',
                '--bg-press': '#A23F29',
              } as React.CSSProperties
            }
          >
            <CalendarPlus size={20} strokeWidth={2} />
            Add event
          </button>
        </div>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gap: 10,
          flex: 1,
          minHeight: 0,
        }}
      >
        {days.map((day) => {
          const isToday = isSameDay(day, today);
          const events = data.events
            .filter((event) => isSameDay(new Date(event.starts_at), day))
            .sort((a, b) => a.starts_at.localeCompare(b.starts_at));

          return (
            <button
              key={isoDate(day)}
              type="button"
              className="pressable"
              onClick={() => setAdding(isoDate(day))}
              style={
                {
                  border: isToday
                    ? '1px solid rgba(200,85,61,0.45)'
                    : '1px solid rgba(252,247,239,0.07)',
                  borderRadius: 18,
                  padding: '14px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  minHeight: 0,
                  alignItems: 'stretch',
                  '--bg': isToday ? '#2A2420' : 'rgba(252,247,239,0.025)',
                  '--bg-press': '#2A2420',
                } as React.CSSProperties
              }
            >
              <div style={{ textAlign: 'center' }}>
                <div className="overline" style={{ color: isToday ? '#E37A57' : '#8E8073' }}>
                  {dayShort(day)}
                </div>
                <div
                  className="mono"
                  style={{ fontSize: 24, color: isToday ? '#FAF3E9' : '#BFB0A0', marginTop: 2 }}
                >
                  {dayNumber(day)}
                </div>
              </div>

              <div style={{ height: 1, background: 'rgba(252,247,239,0.08)' }} />

              <div
                className="scroll-none"
                style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', minHeight: 0 }}
              >
                {events.map((event) => {
                  const owner = event.member_id ? members.get(event.member_id) : undefined;
                  // Lift the owner's colour for the dark surface; the raw brand
                  // hues read as muddy against #2A2420 at 13px.
                  const color = owner ? lift(owner.color) : '#BFB0A0';
                  return (
                    <div
                      key={event.id}
                      style={{
                        background: tint(color),
                        borderLeft: `3px solid ${color}`,
                        borderRadius: 10,
                        padding: 10,
                        textAlign: 'left',
                      }}
                    >
                      <div className="mono" style={{ fontSize: 13, color }}>
                        {event.all_day ? 'All day' : shortTime(new Date(event.starts_at))}
                      </div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: '#FAF3E9',
                          lineHeight: 1.28,
                          marginTop: 3,
                        }}
                      >
                        {event.title}
                      </div>
                    </div>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>

      {adding && <AddEventSheet day={adding} onClose={() => setAdding(null)} />}
      {feedsOpen && <FeedsSheet onClose={() => setFeedsOpen(false)} />}
    </div>
  );
}

function shortTime(date: Date) {
  const hour = date.getHours() % 12 || 12;
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  return `${hour}:${minutes} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
}

/** Nudge a brand hue toward the accent value the dark surface uses. */
function lift(hex: string) {
  const map: Record<string, string> = {
    '#C8553D': '#E37A57',
    '#4F7CA0': '#7FA9C7',
    '#6E8B57': '#93B278',
    '#D9962B': '#E3A85C',
  };
  return map[hex.toUpperCase()] ?? hex;
}

function tint(hex: string) {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, 0.14)`;
}
