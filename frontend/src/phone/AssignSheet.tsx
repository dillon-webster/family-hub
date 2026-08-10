import { useState } from 'react';
import { Utensils, X } from 'lucide-react';

import { api } from '../api/client';
import { useStore } from '../api/store';
import { CATEGORY_FIELD, OUT_FIELD } from '../design/category';
import { assignLabel } from '../lib/week';

export function AssignSheet({
  day,
  onClose,
  onPicked,
}: {
  day: string;
  onClose: () => void;
  onPicked: () => void;
}) {
  const { data, refresh, entryFor } = useStore();
  const [busy, setBusy] = useState(false);
  if (!data) return null;

  const date = new Date(`${day}T12:00:00`);
  const current = entryFor(date);

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
            <div className="overline">Assign dinner</div>
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
          className="scroll-none"
          style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}
        >
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

          <div className="overline" style={{ padding: '6px 2px 0' }}>
            From your library
          </div>

          {data.recipes.map((recipe) => (
            <button
              key={recipe.id}
              type="button"
              className="pressable"
              onClick={() => run(() => api.cook(day, recipe.id))}
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
                  background: CATEGORY_FIELD[recipe.category],
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
              onClick={() => run(() => api.clearDay(day))}
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
              Clear this night
            </button>
          )}
        </div>
      </div>
    </>
  );
}
