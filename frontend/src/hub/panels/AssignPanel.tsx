import { useState } from 'react';
import { ChevronRight, Utensils, X } from 'lucide-react';

import { api } from '../../api/client';
import { useStore } from '../../api/store';
import { CATEGORY_FIELD, OUT_FIELD } from '../../design/category';
import { assignLabel } from '../../lib/week';
import { Sheet } from './Sheet';

/**
 * Choosing what happens on one night. Three outcomes, in the order a household
 * actually decides them: nobody's cooking, we're going somewhere specific, or
 * here's what we're making.
 */
export function AssignPanel({
  day,
  onClose,
  onOpenRecipe,
}: {
  day: string;
  onClose: () => void;
  onOpenRecipe?: (id: string) => void;
}) {
  const { data, refresh, entryFor, recipeById } = useStore();
  const [busy, setBusy] = useState(false);
  if (!data) return null;

  const date = new Date(`${day}T12:00:00`);
  const current = entryFor(date);
  const planned = recipeById(current?.recipe_id);

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

  return (
    <Sheet width={430} onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div className="overline">Assign dinner</div>
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
              onOpenRecipe?.(planned.id);
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
            <div
              style={{
                width: 56,
                height: 56,
                flex: '0 0 56px',
                borderRadius: 12,
                background: CATEGORY_FIELD[planned.category],
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="serif" style={{ fontSize: 20, color: '#FAF3E9', lineHeight: 1.2 }}>
                {planned.title}
              </div>
              <div className="mono" style={{ fontSize: 13, color: '#8E8073', marginTop: 3 }}>
                {[planned.time_label, planned.category].filter(Boolean).join(' · ')}
              </div>
            </div>
            <ChevronRight size={20} color="#8E8073" />
          </button>
        </>
      )}

      <div className="overline">Not cooking</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
        </div>
      </div>

      <div className="overline">From your library</div>

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
            onClick={() => run(() => api.cook(day, recipe.id))}
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
            <div
              style={{
                width: 56,
                height: 56,
                flex: '0 0 56px',
                borderRadius: 12,
                background: CATEGORY_FIELD[recipe.category],
              }}
            />
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
          onClick={() => run(() => api.clearDay(day))}
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
          Clear this night
        </button>
      )}
    </Sheet>
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
