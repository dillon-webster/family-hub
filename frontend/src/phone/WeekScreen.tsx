import { useState } from 'react';
import { ChevronLeft, ChevronRight, History } from 'lucide-react';

import { useStore } from '../api/store';
import { LEFTOVERS_FIELD, OUT_FIELD } from '../design/category';
import {
  addDays,
  dayNumber,
  dayShort,
  isSameDay,
  isoDate,
  mondayOf,
  weekDays,
  weekRange,
} from '../lib/week';
import { mealKey } from '../lib/meal';
import { AssignSheet } from './AssignSheet';
import { HistorySheet } from './HistorySheet';

export function WeekScreen({ flash }: { flash: (message: string) => void }) {
  const { data, weekStart, setWeekStart, entryFor, recipeFor, categoryField } = useStore();
  const [assignDay, setAssignDay] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  if (!data) return null;

  const days = weekDays(weekStart);
  const today = new Date();
  const planned = data.plan.filter(
    (entry) => entry.slot === 'dinner' && days.some((day) => isoDate(day) === entry.day),
  ).length;

  const thisWeek = isoDate(weekStart) === isoDate(mondayOf(today));

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
          {planned} of 7 planned
        </div>

        {/*
          The phone was stuck on the current Monday–Sunday with no way to move,
          which was not only a missing feature: the shopping list is built for
          one week, so a dinner planned on the hub for next Monday contributed
          nothing to any list the phone could reach. These three controls are
          what make the rest of the week visible at the shop.
        */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
          <WeekButton
            label="Previous week"
            onClick={() => setWeekStart(addDays(weekStart, -7))}
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </WeekButton>

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
                transition: 'color .2s, border-color .2s',
                '--bg-press': '#F6EDDE',
              } as React.CSSProperties
            }
          >
            This week
          </button>

          <WeekButton label="Next week" onClick={() => setWeekStart(addDays(weekStart, 7))}>
            <ChevronRight size={20} strokeWidth={2} />
          </WeekButton>

          <div style={{ flex: 1 }} />

          <button
            type="button"
            className="pressable"
            aria-label="Past weeks"
            onClick={() => setHistoryOpen(true)}
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
            <History size={18} strokeWidth={2} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
          {days.map((day) => {
            const key = isoDate(day);
            const entry = entryFor(day);
            const recipe = recipeFor(day);
            const lunch = recipeFor(day, 'lunch');
            const out = entry?.kind === 'out';
            const over = entry?.kind === 'leftovers';
            const isToday = isSameDay(day, today);
            const batch = entry?.batch ?? 1;
            const something = Boolean(recipe || out || over);

            return (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button
                type="button"
                className="pressable"
                onClick={() => setAssignDay(key)}
                style={
                  {
                    display: 'flex',
                    gap: 14,
                    alignItems: 'center',
                    border: something ? '1px solid #E9DDCA' : '2px dashed #DBCBB1',
                    borderRadius: 18,
                    padding: '12px 14px',
                    minHeight: 80,
                    '--bg': something ? '#FFFDF9' : 'transparent',
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
                      ? categoryField(recipe.category)
                      : out
                        ? OUT_FIELD
                        : over
                          ? LEFTOVERS_FIELD
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
                      color: something ? '#2B2521' : '#9C8E7E',
                    }}
                  >
                    {recipe
                      ? recipe.title
                      : out
                        ? (entry?.out_place ?? 'Eating out')
                        : over
                          ? 'Leftovers'
                          : 'Add a dinner'}
                  </span>
                  <span
                    className="mono"
                    style={{ display: 'block', fontSize: 13, color: '#9C8E7E', marginTop: 3 }}
                  >
                    {recipe
                      ? [recipe.time_label, recipe.category, batch > 1 ? `×${batch}` : '']
                          .filter(Boolean)
                          .join(' · ')
                      : out
                        ? 'Eating out · no cooking'
                        : over
                          ? 'From the fridge · no cooking'
                          : 'Tap to pick from the library'}
                  </span>
                </span>

                <span style={{ color: '#9C8E7E', fontSize: 20 }}>›</span>
              </button>

              {/* Lunch prep, as its own tap target. It used to be a line of
                  text inside the dinner button, which showed you the prep cook
                  but gave you no way to change it — and no way at all to add
                  one from the phone. */}
              {lunch ? (
                <button
                  type="button"
                  className="pressable"
                  onClick={() => setAssignDay(mealKey(key, 'lunch'))}
                  style={
                    {
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      marginTop: -4,
                      marginLeft: 66,
                      padding: '8px 12px',
                      borderRadius: 12,
                      border: '1px solid #E9DDCA',
                      '--bg': '#FFFDF9',
                      '--bg-press': '#F6EDDE',
                    } as React.CSSProperties
                  }
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      flex: '0 0 22px',
                      borderRadius: 7,
                      background: categoryField(lunch.category),
                    }}
                  />
                  <span style={{ fontSize: 13, color: '#6F6357', textAlign: 'left' }}>
                    <span style={{ fontWeight: 700, color: '#6E8B57' }}>Lunch</span> ·{' '}
                    {lunch.title}
                    {(entryFor(day, 'lunch')?.batch ?? 1) > 1 && (
                      <span className="mono" style={{ color: '#9C8E7E' }}>
                        {' '}
                        ×{entryFor(day, 'lunch')?.batch}
                      </span>
                    )}
                  </span>
                </button>
              ) : (
                something && (
                  <button
                    type="button"
                    className="pressable"
                    onClick={() => setAssignDay(mealKey(key, 'lunch'))}
                    style={
                      {
                        alignSelf: 'flex-start',
                        marginTop: -4,
                        marginLeft: 66,
                        padding: '7px 12px',
                        borderRadius: 12,
                        border: '1px dashed #DBCBB1',
                        color: '#9C8E7E',
                        fontSize: 13,
                        fontWeight: 600,
                        '--bg-press': '#F6EDDE',
                      } as React.CSSProperties
                    }
                  >
                    + Lunch prep
                  </button>
                )
              )}
              </div>
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

function WeekButton({
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
