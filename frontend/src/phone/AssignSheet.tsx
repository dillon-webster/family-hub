import { useState } from 'react';
import { Check, Refrigerator, Utensils, X } from 'lucide-react';

import { api } from '../api/client';
import { useStore } from '../api/store';
import { LEFTOVERS_FIELD, OUT_FIELD } from '../design/category';
import { parseMealKey } from '../lib/meal';
import { assignLabel } from '../lib/week';

export function AssignSheet({
  day: mealKey,
  onClose,
  onPicked,
}: {
  /** A bare date is dinner; `2026-08-16:lunch` opens on the prep slot. */
  day: string;
  onClose: () => void;
  onPicked: () => void;
}) {
  const { data, refresh, entryFor, recipeById, categoryField } = useStore();
  const [busy, setBusy] = useState(false);
  const [place, setPlace] = useState('');

  const { day, slot: openedOn } = parseMealKey(mealKey);
  // The slot is switchable inside the sheet rather than fixed by how you got
  // here: on a phone the day row is one tap, and making lunch a separate
  // destination would mean two rows per day for a meal most days do not have.
  const [slot, setSlot] = useState(openedOn);
  const isLunch = slot === 'lunch';

  const date = new Date(`${day}T12:00:00`);
  const current = entryFor(date, slot);
  const planned = recipeById(current?.recipe_id);

  /** Arms the next pick on an empty night; edits the night that already has a
   *  recipe. See the note in the hub's AssignPanel. */
  const [armed, setArmed] = useState(false);
  const double = planned ? (current?.batch ?? 1) > 1 : armed;

  if (!data) return null;

  const run = async (action: () => Promise<unknown>) => {
    if (busy) return;
    setBusy(true);
    try {
      await action();
      await refresh();
      onPicked();
    } finally {
      setBusy(false);
    }
  };

  /** Change the batch on the night as it stands, without closing the sheet. */
  const saveBatch = async (recipeId: string, batch: number) => {
    if (busy) return;
    setBusy(true);
    try {
      await api.cook(day, recipeId, { batch, slot });
      await refresh();
    } finally {
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
          maxHeight: '82dvh',
          zIndex: 21,
          background: '#FCF7EF',
          borderRadius: '28px 28px 0 0',
          padding: '16px 20px calc(30px + env(safe-area-inset-bottom))',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          boxShadow: '0 -12px 28px rgba(67,47,28,0.18)',
          animation: 'fh-sheet-up .24s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        <div
          style={{ width: 44, height: 5, borderRadius: 999, background: '#DBCBB1', alignSelf: 'center' }}
        />

        <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div className="overline">{isLunch ? 'Lunch & prep' : 'Assign dinner'}</div>
            <div className="serif" style={{ fontSize: 26, marginTop: 4 }}>
              {assignLabel(date)}
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

        <div
          style={{
            display: 'flex',
            gap: 6,
            padding: 4,
            background: '#F6EDDE',
            borderRadius: 999,
            flex: '0 0 auto',
          }}
        >
          {(['dinner', 'lunch'] as const).map((option) => {
            const active = slot === option;
            const on = entryFor(date, option);
            const label = option === 'dinner' ? 'Dinner' : 'Lunch & prep';
            return (
              <button
                key={option}
                type="button"
                className="pressable"
                aria-pressed={active}
                onClick={() => {
                  setSlot(option);
                  // The double-batch arming belongs to the slot you armed it
                  // on; carrying it across would silently double the other meal.
                  setArmed(false);
                }}
                style={
                  {
                    flex: 1,
                    height: 44,
                    borderRadius: 999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 7,
                    fontSize: 15,
                    fontWeight: 600,
                    color: active ? '#2B2521' : '#9C8E7E',
                    boxShadow: active ? '0 1px 3px rgba(67,47,28,0.16)' : 'none',
                    '--bg': active ? '#FFFDF9' : 'transparent',
                    '--bg-press': active ? '#FFFDF9' : '#EFE3D0',
                  } as React.CSSProperties
                }
              >
                {label}
                {on && (
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 999,
                      background: active ? '#C8553D' : '#C4B49B',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div
          className="scroll-none"
          style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          {/* Lunch is a prep cook: there is no eating out at it, and
              leftovers at lunch is just lunch. Same rule as the hub. */}
          {!isLunch && (
            <>
            <button
              type="button"
              className="pressable"
              onClick={() => run(() => api.leftovers(day))}
              style={
                {
                  display: 'flex',
                  gap: 14,
                  alignItems: 'center',
                  border: '1px solid #E9DDCA',
                  borderRadius: 16,
                  padding: '12px 14px',
                  minHeight: 72,
                  flex: '0 0 auto',
                  '--bg': '#FFFDF9',
                  '--bg-press': '#F6EDDE',
                } as React.CSSProperties
              }
            >
              <span
                style={{
                  width: 50,
                  height: 50,
                  flex: '0 0 50px',
                  borderRadius: 12,
                  background: LEFTOVERS_FIELD,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFF8F2',
                }}
              >
                <Refrigerator size={22} strokeWidth={2} />
              </span>
              <span style={{ flex: 1, textAlign: 'left' }}>
                <span className="serif" style={{ display: 'block', fontSize: 19, lineHeight: 1.2 }}>
                  Leftovers
                </span>
                <span style={{ display: 'block', fontSize: 13, color: '#9C8E7E', marginTop: 3 }}>
                  Counts as planned, adds nothing to the list
                </span>
              </span>
            </button>

            <button
              type="button"
              className="pressable"
              onClick={() => run(() => api.eatOut(day))}
              style={
                {
                  display: 'flex',
                  gap: 14,
                  alignItems: 'center',
                  border: '1px solid #E9DDCA',
                  borderRadius: 16,
                  padding: '12px 14px',
                  minHeight: 72,
                  flex: '0 0 auto',
                  '--bg': '#FFFDF9',
                  '--bg-press': '#F6EDDE',
                } as React.CSSProperties
              }
            >
              <span
                style={{
                  width: 50,
                  height: 50,
                  flex: '0 0 50px',
                  borderRadius: 12,
                  background: OUT_FIELD,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFF8F2',
                }}
              >
                <Utensils size={22} strokeWidth={2} />
              </span>
              <span style={{ flex: 1, textAlign: 'left' }}>
                <span className="serif" style={{ display: 'block', fontSize: 19, lineHeight: 1.2 }}>
                  Going out to eat
                </span>
                <span style={{ display: 'block', fontSize: 13, color: '#9C8E7E', marginTop: 3 }}>
                  Nothing added to the shopping list
                </span>
              </span>
            </button>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '0 2px 4px' }}>
              {data.out_spots.map((spot) => (
                <button
                  key={spot.id}
                  type="button"
                  className="pressable"
                  onClick={() => run(() => api.eatOut(day, spot.name))}
                  style={
                    {
                      height: 38,
                      padding: '0 14px',
                      borderRadius: 999,
                      border: '1px solid #DBCBB1',
                      color: '#6F6357',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: 14,
                      fontWeight: 600,
                      '--bg-press': '#F6EDDE',
                    } as React.CSSProperties
                  }
                >
                  {spot.name}
                </button>
              ))}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                const trimmed = place.trim();
                if (trimmed) void run(() => api.eatOut(day, trimmed));
              }}
              style={{ display: 'flex', gap: 8, padding: '0 2px' }}
            >
              <input
                value={place}
                onChange={(event) => setPlace(event.target.value)}
                placeholder="Somewhere else…"
                enterKeyHint="done"
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: 46,
                  background: '#FFFDF9',
                  border: '1px solid #DBCBB1',
                  borderRadius: 999,
                  padding: '0 16px',
                  fontSize: 15,
                  color: '#2B2521',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              {place.trim() && (
                <button
                  type="submit"
                  className="pressable"
                  style={
                    {
                      height: 46,
                      padding: '0 18px',
                      borderRadius: 999,
                      color: '#FFF8F2',
                      fontSize: 15,
                      fontWeight: 600,
                      flex: '0 0 auto',
                      '--bg': '#C8553D',
                      '--bg-press': '#A23F29',
                    } as React.CSSProperties
                  }
                >
                  Save
                </button>
              )}
            </form>
            </>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              padding: '6px 2px 0',
            }}
          >
            <div className="overline">From your library</div>
            <button
              type="button"
              className="pressable"
              aria-pressed={double}
              onClick={() => {
                if (planned) void saveBatch(planned.id, double ? 1 : 2);
                else setArmed((on) => !on);
              }}
              style={
                {
                  height: 38,
                  padding: '0 14px 0 10px',
                  borderRadius: 999,
                  border: `1px solid ${double ? 'transparent' : '#DBCBB1'}`,
                  color: double ? '#FFF8F2' : '#6F6357',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  fontSize: 14,
                  fontWeight: 600,
                  flex: '0 0 auto',
                  '--bg': double ? '#C8553D' : 'transparent',
                  '--bg-press': double ? '#A23F29' : '#F6EDDE',
                } as React.CSSProperties
              }
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 5,
                  border: `2px solid ${double ? '#FFF8F2' : '#C4B49B'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: double ? '#FFF8F2' : 'transparent',
                }}
              >
                <Check size={11} strokeWidth={3.4} />
              </span>
              Double batch
            </button>
          </div>

          {data.recipes.map((recipe) => (
            <button
              key={recipe.id}
              type="button"
              className="pressable"
              onClick={() => run(() => api.cook(day, recipe.id, { batch: armed ? 2 : 1, slot }))}
              style={
                {
                  display: 'flex',
                  gap: 14,
                  alignItems: 'center',
                  border: '1px solid #E9DDCA',
                  borderRadius: 16,
                  padding: '12px 14px',
                  minHeight: 72,
                  flex: '0 0 auto',
                  '--bg': '#FFFDF9',
                  '--bg-press': '#F6EDDE',
                } as React.CSSProperties
              }
            >
              <span
                style={{
                  width: 50,
                  height: 50,
                  flex: '0 0 50px',
                  borderRadius: 12,
                  background: categoryField(recipe.category),
                }}
              />
              <span style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                <span className="serif" style={{ display: 'block', fontSize: 19, lineHeight: 1.2 }}>
                  {recipe.title}
                </span>
                <span
                  className="mono"
                  style={{ display: 'block', fontSize: 13, color: '#9C8E7E', marginTop: 3 }}
                >
                  {[recipe.time_label, recipe.category].filter(Boolean).join(' · ')}
                </span>
              </span>
            </button>
          ))}

          {current && (
            <button
              type="button"
              className="pressable"
              onClick={() => run(() => api.clearDay(day, slot))}
              style={
                {
                  height: 52,
                  borderRadius: 16,
                  border: '1px solid #DBCBB1',
                  color: '#6F6357',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  fontWeight: 600,
                  marginTop: 4,
                  flex: '0 0 auto',
                  '--bg-press': '#F6EDDE',
                } as React.CSSProperties
              }
            >
              {isLunch ? 'Clear this lunch' : 'Clear this night'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
