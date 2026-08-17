import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

import { useStore } from '../api/store';
import { LEFTOVERS_FIELD, OUT_FIELD } from '../design/category';
import { loadHistory, type Week } from '../lib/history';
import { dayNumber, dayShort, isoDate, weekRange } from '../lib/week';

/**
 * The same look back as the kitchen display, as a bottom sheet.
 *
 * Read standing in a shop aisle rather than across a room, so it is a plain
 * list: no recipe to open from here, because the phone's job in this moment is
 * remembering what you ate, not cooking it.
 */
export function HistorySheet({ onClose }: { onClose: () => void }) {
  const { recipeById, categoryField } = useStore();
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
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div className="overline" style={{ color: '#9C8E7E' }}>
              Past weeks
            </div>
            <div className="serif" style={{ fontSize: 26, marginTop: 4 }}>
              What you've cooked
            </div>
          </div>
          <button
            type="button"
            className="pressable"
            aria-label="Close"
            onClick={onClose}
            style={
              {
                width: 44,
                height: 44,
                borderRadius: 999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6F6357',
                flex: '0 0 auto',
                '--bg': '#F6EDDE',
                '--bg-press': '#EFE3D0',
              } as React.CSSProperties
            }
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <div
          className="scroll-none"
          style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}
        >
          {error && <div style={{ fontSize: 15, color: '#BE3A2E', lineHeight: 1.5 }}>{error}</div>}

          {!error && weeks === null && (
            <div style={{ fontSize: 15, color: '#6F6357', lineHeight: 1.5 }}>
              Looking back through the plan…
            </div>
          )}

          {weeks?.length === 0 && (
            <div style={{ fontSize: 15, color: '#6F6357', lineHeight: 1.5 }}>
              Nothing planned in the last eight weeks. Dinners show up here once they have been
              assigned to a night.
            </div>
          )}

          {weeks?.map((week) => (
            <div key={isoDate(week.monday)} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="overline" style={{ color: '#9C8E7E' }}>
                {weekRange(week.monday)}
              </div>

              {week.entries.map((entry) => {
                const recipe = recipeById(entry.recipe_id);
                const date = new Date(`${entry.day}T12:00:00`);

                return (
                  <div
                    key={entry.day}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      background: '#FFFDF9',
                      border: '1px solid #E9DDCA',
                      borderRadius: 14,
                      padding: '10px 12px',
                      minHeight: 58,
                    }}
                  >
                    <div style={{ width: 40, flex: '0 0 40px' }}>
                      <div className="mono" style={{ fontSize: 11, color: '#9C8E7E', letterSpacing: '0.06em' }}>
                        {dayShort(date).toUpperCase()}
                      </div>
                      <div className="mono" style={{ fontSize: 18, color: '#6F6357', lineHeight: 1.1 }}>
                        {dayNumber(date)}
                      </div>
                    </div>

                    <div
                      style={{
                        width: 38,
                        height: 38,
                        flex: '0 0 38px',
                        borderRadius: 9,
                        background: recipe
                          ? categoryField(recipe.category)
                          : entry.kind === 'leftovers'
                            ? LEFTOVERS_FIELD
                            : OUT_FIELD,
                      }}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="serif" style={{ fontSize: 17, lineHeight: 1.2 }}>
                        {entry.kind === 'out'
                          ? (entry.out_place ?? 'Eating out')
                          : (recipe?.title ?? 'A recipe no longer in the library')}
                      </div>
                      {entry.kind === 'out' && (
                        <div className="mono" style={{ fontSize: 12, color: '#9C8E7E', marginTop: 2 }}>
                          Eating out
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
