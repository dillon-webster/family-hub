import { useState } from 'react';
import { Plus, Sandwich, X } from 'lucide-react';

import { api } from '../../api/client';
import { useStore } from '../../api/store';
import { dayShort, isoDate } from '../../lib/week';
import { HubKeyboard } from './HubKeyboard';
import { BatchBadge } from '../screens/MealsScreen';

/**
 * Lunches and the Sunday prep cook, under the dinner strip.
 *
 * Deliberately small. Dinner is the decision a household actually makes seven
 * times a week and the plan above is sized for it; lunch prep is one or two
 * things cooked in a batch, plus the bits that are not a recipe at all — wraps,
 * a bag of apples. Both need to reach the same shopping list, and nothing more
 * than that.
 *
 * The two halves are genuinely different: the left is the *plan* (a recipe in a
 * lunch slot, whose ingredients merge into the list the way a dinner's do), the
 * right is the *list* (an item typed straight onto it, belonging to no recipe).
 */
export function LunchStrip({
  week,
  onAssign,
}: {
  week: Date[];
  onAssign: (day: string) => void;
}) {
  const { data, weekStart, refresh, entryFor, recipeFor, categoryField } = useStore();
  const [picking, setPicking] = useState(false);
  const [typing, setTyping] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!data) return null;

  const lunches = week
    .map((day) => ({ day, entry: entryFor(day, 'lunch'), recipe: recipeFor(day, 'lunch') }))
    .filter((slot) => slot.entry);

  const addItem = async (name: string) => {
    if (busy) return;
    setBusy(true);
    try {
      // Straight onto the list, no review step — the same path the phone uses
      // at the shop. Someone typing "wraps" here has already decided.
      await api.addExtra({ week_start: isoDate(weekStart), name, aisle: 'Bathroom / misc' });
      await refresh();
      setTyping(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <section
        style={{
          margin: '0 34px',
          background: 'rgba(252,247,239,0.028)',
          border: '1px solid rgba(252,247,239,0.08)',
          borderRadius: 20,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flex: '0 0 auto',
          minHeight: 74,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '0 0 auto' }}>
          <span style={{ color: '#8E8073', display: 'flex' }}>
            <Sandwich size={20} strokeWidth={2} />
          </span>
          <span className="overline" style={{ whiteSpace: 'nowrap' }}>
            Lunches &amp; prep
          </span>
        </div>

        <div
          className="scroll-none"
          style={{ display: 'flex', gap: 8, alignItems: 'center', overflowX: 'auto', flex: 1, minWidth: 0 }}
        >
          {lunches.length === 0 && !picking && (
            <span style={{ fontSize: 15, color: '#8E8073', whiteSpace: 'nowrap' }}>
              Nothing prepped this week.
            </span>
          )}

          {lunches.map(({ day, entry, recipe }) => (
            <button
              key={isoDate(day)}
              type="button"
              className="pressable"
              onClick={() => onAssign(isoDate(day))}
              style={
                {
                  height: 48,
                  padding: '0 14px 0 8px',
                  borderRadius: 999,
                  border: '1px solid rgba(252,247,239,0.10)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  flex: '0 0 auto',
                  '--bg': '#2E2823',
                  '--bg-press': '#3A322C',
                } as React.CSSProperties
              }
            >
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  flex: '0 0 32px',
                  background: recipe ? categoryField(recipe.category) : 'rgba(252,247,239,0.10)',
                }}
              />
              <span className="overline" style={{ color: '#8E8073' }}>
                {dayShort(day)}
              </span>
              <span style={{ fontSize: 15, color: '#FAF3E9', whiteSpace: 'nowrap' }}>
                {recipe ? recipe.title : 'Lunch'}
              </span>
              {(entry?.batch ?? 1) > 1 && <BatchBadge batch={entry!.batch} dark />}
            </button>
          ))}

          {picking ? (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flex: '0 0 auto' }}>
              {week.map((day) => (
                <button
                  key={isoDate(day)}
                  type="button"
                  className="pressable"
                  onClick={() => {
                    setPicking(false);
                    onAssign(isoDate(day));
                  }}
                  style={
                    {
                      width: 52,
                      height: 48,
                      borderRadius: 12,
                      border: '1px solid rgba(252,247,239,0.16)',
                      color: '#BFB0A0',
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      '--bg-press': '#3A322C',
                    } as React.CSSProperties
                  }
                >
                  {dayShort(day)}
                </button>
              ))}
              <button
                type="button"
                className="pressable"
                aria-label="Cancel"
                onClick={() => setPicking(false)}
                style={
                  {
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#8E8073',
                    '--bg-press': '#3A322C',
                  } as React.CSSProperties
                }
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="pressable"
              onClick={() => setPicking(true)}
              style={
                {
                  height: 48,
                  padding: '0 16px 0 12px',
                  borderRadius: 999,
                  border: '1px dashed rgba(252,247,239,0.22)',
                  color: '#BFB0A0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 15,
                  fontWeight: 600,
                  flex: '0 0 auto',
                  '--bg-press': 'rgba(252,247,239,0.06)',
                } as React.CSSProperties
              }
            >
              <Plus size={18} strokeWidth={2.2} />
              Prep a recipe
            </button>
          )}
        </div>

        <button
          type="button"
          className="pressable"
          onClick={() => setTyping(true)}
          style={
            {
              height: 48,
              padding: '0 18px 0 14px',
              borderRadius: 999,
              border: '1px solid rgba(252,247,239,0.18)',
              color: '#BFB0A0',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 15,
              fontWeight: 600,
              flex: '0 0 auto',
              whiteSpace: 'nowrap',
              '--bg-press': 'rgba(252,247,239,0.08)',
            } as React.CSSProperties
          }
        >
          <Plus size={18} strokeWidth={2.2} />
          Add to the list
        </button>
      </section>

      {typing && (
        <HubKeyboard
          hint="Goes straight onto this week's list, with no review step"
          onCancel={() => setTyping(false)}
          onSubmit={addItem}
        />
      )}
    </>
  );
}
