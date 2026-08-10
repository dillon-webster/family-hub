import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';

import { useStore } from '../../api/store';
import { CATEGORY_FIELD, OUT_FIELD } from '../../design/category';
import { loadHistory, type Week } from '../../lib/history';
import { dayNumber, dayShort, isoDate, weekRange } from '../../lib/week';
import { CloseButton } from './AssignPanel';
import { Sheet } from './Sheet';

/**
 * What the household actually ate, week by week, most recent first.
 *
 * Only nights with something on them appear: this is a record of decisions
 * taken, not a grid of blanks. The range and the grouping live in
 * lib/history.ts, shared with the phone.
 */

export function HistorySheet({
  onClose,
  onOpenRecipe,
}: {
  onClose: () => void;
  onOpenRecipe?: (id: string) => void;
}) {
  const { recipeById } = useStore();
  const [weeks, setWeeks] = useState<Week[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;

    loadHistory()
      .then((found) => {
        if (live) setWeeks(found);
      })
      .catch((cause: unknown) => {
        if (live) setError(cause instanceof Error ? cause.message : 'Could not load past weeks.');
      });

    return () => {
      live = false;
    };
  }, []);

  return (
    <Sheet width={460} onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div className="overline">Past weeks</div>
          <div className="serif" style={{ fontSize: 30, color: '#FAF3E9', marginTop: 6 }}>
            What you've cooked
          </div>
        </div>
        <CloseButton onClose={onClose} />
      </div>

      <div
        className="scroll-none"
        style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 22 }}
      >
        {error && (
          <div style={{ fontSize: 16, color: '#BFB0A0', lineHeight: 1.5, padding: '4px 2px' }}>{error}</div>
        )}

        {!error && weeks === null && (
          <div style={{ fontSize: 16, color: '#8E8073', lineHeight: 1.5, padding: '4px 2px' }}>
            Looking back through the plan…
          </div>
        )}

        {weeks?.length === 0 && (
          <div style={{ fontSize: 16, color: '#8E8073', lineHeight: 1.5, padding: '4px 2px' }}>
            Nothing planned in the last eight weeks. Dinners show up here once they have been
            assigned to a night.
          </div>
        )}

        {weeks?.map((week) => (
          <div key={isoDate(week.monday)} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="overline">{weekRange(week.monday)}</div>

            {week.entries.map((entry) => {
              const recipe = recipeById(entry.recipe_id);
              const date = new Date(`${entry.day}T12:00:00`);
              const openable = recipe && onOpenRecipe;

              return (
                <button
                  key={entry.day}
                  type="button"
                  className={openable ? 'pressable' : undefined}
                  disabled={!openable}
                  onClick={() => {
                    if (!recipe || !onOpenRecipe) return;
                    onOpenRecipe(recipe.id);
                    onClose();
                  }}
                  style={
                    {
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      border: '1px solid rgba(252,247,239,0.10)',
                      borderRadius: 16,
                      padding: '10px 14px',
                      minHeight: 64,
                      textAlign: 'left',
                      '--bg': '#2E2823',
                      '--bg-press': '#3A322C',
                      background: openable ? undefined : '#2E2823',
                    } as React.CSSProperties
                  }
                >
                  <div style={{ width: 46, flex: '0 0 46px' }}>
                    <div className="mono" style={{ fontSize: 12, color: '#8E8073', letterSpacing: '0.06em' }}>
                      {dayShort(date).toUpperCase()}
                    </div>
                    <div className="mono" style={{ fontSize: 20, color: '#BFB0A0', lineHeight: 1.1 }}>
                      {dayNumber(date)}
                    </div>
                  </div>

                  <div
                    style={{
                      width: 44,
                      height: 44,
                      flex: '0 0 44px',
                      borderRadius: 10,
                      background: recipe ? CATEGORY_FIELD[recipe.category] : OUT_FIELD,
                    }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="serif" style={{ fontSize: 19, color: '#FAF3E9', lineHeight: 1.2 }}>
                      {entry.kind === 'out'
                        ? (entry.out_place ?? 'Eating out')
                        : (recipe?.title ?? 'A recipe no longer in the library')}
                    </div>
                    {entry.kind === 'out' && (
                      <div className="mono" style={{ fontSize: 13, color: '#8E8073', marginTop: 3 }}>
                        Eating out
                      </div>
                    )}
                  </div>

                  {openable && <ChevronRight size={18} color="#8E8073" />}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </Sheet>
  );
}
