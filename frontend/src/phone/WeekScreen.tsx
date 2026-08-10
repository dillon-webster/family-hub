import { useState } from 'react';
import { History } from 'lucide-react';

import { useStore } from '../api/store';
import { CATEGORY_FIELD, OUT_FIELD } from '../design/category';
import { dayNumber, dayShort, isSameDay, isoDate, weekDays, weekRange } from '../lib/week';
import { AssignSheet } from './AssignSheet';
import { HistorySheet } from './HistorySheet';

export function WeekScreen({ flash }: { flash: (message: string) => void }) {
  const { data, weekStart, entryFor, recipeFor } = useStore();
  const [assignDay, setAssignDay] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  if (!data) return null;

  const days = weekDays(weekStart);
  const today = new Date();
  const planned = data.plan.filter((entry) => days.some((day) => isoDate(day) === entry.day)).length;

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
          This week
        </h1>
        <div style={{ fontSize: 15, color: '#6F6357', marginTop: 3 }}>
          {weekRange(weekStart)} · {planned} of 7 planned
        </div>

        <button
          type="button"
          className="pressable"
          onClick={() => setHistoryOpen(true)}
          style={
            {
              marginTop: 12,
              height: 44,
              padding: '0 16px',
              borderRadius: 999,
              border: '1px solid #DBCBB1',
              color: '#6F6357',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 15,
              fontWeight: 600,
              '--bg-press': '#F6EDDE',
            } as React.CSSProperties
          }
        >
          <History size={18} strokeWidth={2} />
          Past weeks
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
          {days.map((day) => {
            const key = isoDate(day);
            const entry = entryFor(day);
            const recipe = recipeFor(day);
            const out = entry?.kind === 'out';
            const isToday = isSameDay(day, today);

            return (
              <button
                key={key}
                type="button"
                className="pressable"
                onClick={() => setAssignDay(key)}
                style={
                  {
                    display: 'flex',
                    gap: 14,
                    alignItems: 'center',
                    border: recipe || out ? '1px solid #E9DDCA' : '2px dashed #DBCBB1',
                    borderRadius: 18,
                    padding: '12px 14px',
                    minHeight: 80,
                    '--bg': recipe || out ? '#FFFDF9' : 'transparent',
                    '--bg-press': '#F6EDDE',
                  } as React.CSSProperties
                }
              >
                <span style={{ width: 52, flex: '0 0 52px', textAlign: 'center' }}>
                  <span
                    style={{
                      display: 'block',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.10em',
                      textTransform: 'uppercase',
                      color: isToday ? '#C8553D' : '#9C8E7E',
                    }}
                  >
                    {dayShort(day)}
                  </span>
                  <span
                    className="mono"
                    style={{
                      display: 'block',
                      fontSize: 20,
                      color: isToday ? '#C8553D' : '#6F6357',
                      marginTop: 1,
                    }}
                  >
                    {dayNumber(day)}
                  </span>
                </span>

                <span
                  style={{
                    width: 48,
                    height: 48,
                    flex: '0 0 48px',
                    borderRadius: 14,
                    background: recipe
                      ? CATEGORY_FIELD[recipe.category]
                      : out
                        ? OUT_FIELD
                        : '#EFE3D0',
                  }}
                />

                <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                  <span
                    className="serif"
                    style={{
                      display: 'block',
                      fontSize: 20,
                      lineHeight: 1.2,
                      color: recipe || out ? '#2B2521' : '#9C8E7E',
                    }}
                  >
                    {recipe ? recipe.title : out ? (entry?.out_place ?? 'Eating out') : 'Add a dinner'}
                  </span>
                  <span
                    className="mono"
                    style={{ display: 'block', fontSize: 13, color: '#9C8E7E', marginTop: 3 }}
                  >
                    {recipe
                      ? [recipe.time_label, recipe.category].filter(Boolean).join(' · ')
                      : out
                        ? 'Eating out · no cooking'
                        : 'Tap to pick from the library'}
                  </span>
                </span>

                <span style={{ color: '#9C8E7E', fontSize: 20 }}>›</span>
              </button>
            );
          })}
        </div>
      </div>

      {historyOpen && <HistorySheet onClose={() => setHistoryOpen(false)} />}

      {assignDay && (
        <AssignSheet
          day={assignDay}
          onClose={() => setAssignDay(null)}
          onPicked={() => {
            setAssignDay(null);
            flash('Sent to the kitchen hub');
          }}
        />
      )}
    </>
  );
}
