import { useState } from 'react';
import { Check, ChevronRight, Refrigerator, Utensils, X } from 'lucide-react';

import { api } from '../../api/client';
import { useStore } from '../../api/store';
import { LEFTOVERS_FIELD, OUT_FIELD } from '../../design/category';
import { parseMealKey } from '../../lib/meal';
import { assignLabel } from '../../lib/week';
import { HubKeyboard } from './HubKeyboard';
import { Sheet } from './Sheet';

/**
 * Choosing what happens at one meal. Four outcomes, in the order a household
 * actually decides them: nobody's cooking, the fridge is dinner, we're going
 * somewhere specific, or here's what we're making.
 */

export function AssignPanel({
  day: mealKey,
  onClose,
  onOpenRecipe,
}: {
  day: string;
  onClose: () => void;
  onOpenRecipe?: (id: string, batch?: number) => void;
}) {
  const { data, refresh, entryFor, recipeById } = useStore();
  const [busy, setBusy] = useState(false);
  const [typingPlace, setTypingPlace] = useState(false);

  const { day, slot } = parseMealKey(mealKey);
  const date = new Date(`${day}T12:00:00`);
  const current = entryFor(date, slot);
  const planned = recipeById(current?.recipe_id);
  const isLunch = slot === 'lunch';

  /**
   * Double batch, which is two different controls wearing one checkbox.
   *
   * On an empty night it arms the next pick. On a night that already has a
   * recipe it edits that recipe's batch directly — which is what it has to do,
   * because the alternative was the bug this fixes: the box started unticked
   * even on a doubled night, and ticking it did nothing until you went back and
   * tapped the same recipe again in the library. It read, correctly, as not
   * saving.
   */
  const [armed, setArmed] = useState(false);
  const double = planned ? (current?.batch ?? 1) > 1 : armed;

  if (!data) return null;

  const run = async (action: () => Promise<unknown>) => {
    if (busy) return;
    setBusy(true);
    try {
      await action();
      await refresh();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  /** Change the batch on the night as it stands, without closing the panel. */
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
    <Sheet width={430} onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div className="overline">{isLunch ? 'Lunch & prep' : 'Assign dinner'}</div>
          <div className="serif" style={{ fontSize: 30, color: '#FAF3E9', marginTop: 6 }}>
            {assignLabel(date)}
          </div>
        </div>
        <CloseButton onClose={onClose} />
      </div>

      {/* The way back to the recipe. The tile on the plan used to open it
          directly; now that every night opens this panel instead, the recipe
          needs a door here or it has none. */}
      {planned && (
        <>
          <div className="overline">Planned</div>
          <button
            type="button"
            className="pressable"
            onClick={() => {
              onOpenRecipe?.(planned.id, current?.batch ?? 1);
              onClose();
            }}
            style={
              {
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                border: '1px solid rgba(252,247,239,0.10)',
                borderRadius: 16,
                padding: '12px 14px',
                minHeight: 72,
                textAlign: 'left',
                '--bg': '#2E2823',
                '--bg-press': '#3A322C',
              } as React.CSSProperties
            }
          >
            <RecipeField category={planned.category} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="serif" style={{ fontSize: 20, color: '#FAF3E9', lineHeight: 1.2 }}>
                {planned.title}
              </div>
              <div className="mono" style={{ fontSize: 13, color: '#8E8073', marginTop: 3 }}>
                {[
                  planned.time_label,
                  planned.category,
                  (current?.batch ?? 1) > 1 ? `×${current?.batch} batch` : '',
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </div>
            </div>
            <ChevronRight size={20} color="#8E8073" />
          </button>
        </>
      )}

      {/* Lunch is a prep cook: there is no eating out at it, and leftovers at
          lunch is just… lunch. Offering either would be noise. */}
      {!isLunch && (
        <>
          <div className="overline">Not cooking</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              type="button"
              className="pressable"
              onClick={() => run(() => api.leftovers(day))}
              style={
                {
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  border: '1px solid rgba(252,247,239,0.10)',
                  borderRadius: 16,
                  padding: '12px 14px',
                  minHeight: 72,
                  '--bg': '#2E2823',
                  '--bg-press': '#3A322C',
                } as React.CSSProperties
              }
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  flex: '0 0 56px',
                  borderRadius: 12,
                  background: LEFTOVERS_FIELD,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFF8F2',
                }}
              >
                <Refrigerator size={24} strokeWidth={2} />
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div className="serif" style={{ fontSize: 20, color: '#FAF3E9', lineHeight: 1.2 }}>
                  Leftovers
                </div>
                <div style={{ fontSize: 14, color: '#8E8073', marginTop: 3 }}>
                  Counts as planned, adds nothing to the list
                </div>
              </div>
            </button>

            <button
              type="button"
              className="pressable"
              onClick={() => run(() => api.eatOut(day))}
              style={
                {
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  border: '1px solid rgba(252,247,239,0.10)',
                  borderRadius: 16,
                  padding: '12px 14px',
                  minHeight: 72,
                  '--bg': '#2E2823',
                  '--bg-press': '#3A322C',
                } as React.CSSProperties
              }
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  flex: '0 0 56px',
                  borderRadius: 12,
                  background: OUT_FIELD,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFF8F2',
                }}
              >
                <Utensils size={24} strokeWidth={2} />
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div className="serif" style={{ fontSize: 20, color: '#FAF3E9', lineHeight: 1.2 }}>
                  Going out to eat
                </div>
                <div style={{ fontSize: 14, color: '#8E8073', marginTop: 3 }}>
                  Nothing is added to the shopping list
                </div>
              </div>
            </button>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {data.out_spots.map((spot) => (
                <button
                  key={spot.id}
                  type="button"
                  className="pressable"
                  onClick={() => run(() => api.eatOut(day, spot.name))}
                  style={
                    {
                      height: 40,
                      padding: '0 16px',
                      borderRadius: 999,
                      border: '1px solid rgba(252,247,239,0.16)',
                      color: '#BFB0A0',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: 14,
                      fontWeight: 600,
                      '--bg-press': '#3A322C',
                    } as React.CSSProperties
                  }
                >
                  {spot.name}
                </button>
              ))}

              {/* Somewhere new. The chips are the regulars; this is the rest of
                  the world, and without it a one-off dinner out has to be
                  recorded as the generic "Eating out" and loses its name. */}
              <button
                type="button"
                className="pressable"
                onClick={() => setTypingPlace(true)}
                style={
                  {
                    height: 40,
                    padding: '0 16px',
                    borderRadius: 999,
                    border: '1px dashed rgba(252,247,239,0.24)',
                    color: '#BFB0A0',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: 14,
                    fontWeight: 600,
                    '--bg-press': '#3A322C',
                  } as React.CSSProperties
                }
              >
                Somewhere else…
              </button>
            </div>
          </div>
        </>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginTop: 2,
        }}
      >
        <div className="overline">From your library</div>

        {/* Armed before the pick, because the recipe rows are the commit. */}
        <button
          type="button"
          className="pressable"
          aria-pressed={double}
          onClick={() => {
            // A planned night saves the change on the spot and stays open, so
            // you can see the ×2 land. An empty one just arms the next pick.
            if (planned) {
              const batch = double ? 1 : 2;
              void saveBatch(planned.id, batch);
            } else {
              setArmed((on) => !on);
            }
          }}
          style={
            {
              height: 40,
              padding: '0 14px 0 10px',
              borderRadius: 999,
              border: `1px solid ${double ? 'transparent' : 'rgba(252,247,239,0.16)'}`,
              color: double ? '#FFF8F2' : '#BFB0A0',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
              fontWeight: 600,
              flex: '0 0 auto',
              '--bg': double ? '#C8553D' : 'transparent',
              '--bg-press': double ? '#A23F29' : '#3A322C',
            } as React.CSSProperties
          }
        >
          <span
            style={{
              width: 20,
              height: 20,
              borderRadius: 6,
              border: `2px solid ${double ? '#FFF8F2' : 'rgba(252,247,239,0.34)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: double ? '#FFF8F2' : 'transparent',
            }}
          >
            <Check size={13} strokeWidth={3.2} />
          </span>
          Double batch
        </button>
      </div>

      {double && (
        <div style={{ fontSize: 14, color: '#8E8073', lineHeight: 1.45, marginTop: -6 }}>
          {planned
            ? `The shopping list is buying twice the ingredients for ${planned.title}.`
            : 'The shopping list doubles the amounts for whichever recipe you pick.'}
        </div>
      )}

      <div
        className="scroll-none"
        style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}
      >
        {data.recipes.length === 0 && (
          <div style={{ fontSize: 16, color: '#8E8073', lineHeight: 1.5, padding: '4px 2px' }}>
            The library is empty. Add a recipe from the Recipes screen and it will show up here.
          </div>
        )}
        {data.recipes.map((recipe) => (
          <button
            key={recipe.id}
            type="button"
            className="pressable"
            onClick={() =>
              run(() => api.cook(day, recipe.id, { batch: armed ? 2 : 1, slot }))
            }
            style={
              {
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                borderRadius: 16,
                padding: '12px 14px',
                minHeight: 72,
                flex: '0 0 auto',
                '--bg': '#2E2823',
                '--bg-press': '#3A322C',
              } as React.CSSProperties
            }
          >
            <RecipeField category={recipe.category} />
            <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
              <div className="serif" style={{ fontSize: 20, color: '#FAF3E9', lineHeight: 1.2 }}>
                {recipe.title}
              </div>
              <div className="mono" style={{ fontSize: 13, color: '#8E8073', marginTop: 3 }}>
                {[recipe.time_label, recipe.category].filter(Boolean).join(' · ')}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Only offered once there is something to clear — an empty night has no
          "clear" to perform. */}
      {current && (
        <button
          type="button"
          className="pressable"
          onClick={() => run(() => api.clearDay(day, slot))}
          style={
            {
              height: 52,
              borderRadius: 16,
              border: '1px solid rgba(252,247,239,0.18)',
              color: '#BFB0A0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 600,
              flex: '0 0 auto',
              '--bg-press': 'rgba(252,247,239,0.06)',
            } as React.CSSProperties
          }
        >
          {isLunch ? 'Clear this lunch' : 'Clear this night'}
        </button>
      )}

      {/* The keyboard positions and scrims itself over the whole content area,
          so it needs no wrapper of its own — only a stopped click, or dismissing
          it would fall through to the sheet's scrim and close the panel too. */}
      {typingPlace && (
        <div style={{ display: 'contents' }} onClick={(event) => event.stopPropagation()}>
          <HubKeyboard
            hint="This is saved as the night's plan, not to your regular spots"
            placeholder="Type where you're going"
            submitLabel="Save"
            onCancel={() => setTypingPlace(false)}
            onSubmit={(place) => {
              setTypingPlace(false);
              void run(() => api.eatOut(day, place));
            }}
          />
        </div>
      )}
    </Sheet>
  );
}

function RecipeField({ category }: { category: string }) {
  const { categoryField } = useStore();
  return (
    <div
      style={{
        width: 56,
        height: 56,
        flex: '0 0 56px',
        borderRadius: 12,
        background: categoryField(category),
      }}
    />
  );
}

export function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      className="pressable"
      aria-label="Close"
      onClick={onClose}
      style={
        {
          width: 52,
          height: 52,
          flex: '0 0 52px',
          borderRadius: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#BFB0A0',
          '--bg': '#332C27',
          '--bg-press': '#443A33',
        } as React.CSSProperties
      }
    >
      <X size={22} strokeWidth={2} />
    </button>
  );
}
