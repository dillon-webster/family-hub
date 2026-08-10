import { useEffect, useState } from 'react';
import { ChevronLeft, Trash2 } from 'lucide-react';

import { api } from '../../api/client';
import { useStore } from '../../api/store';
import type { Recipe } from '../../api/types';
import { CATEGORY_FIELD } from '../../design/category';

/**
 * Full-bleed over the content area — the one screen someone reads while their
 * hands are busy, so the ingredients column stays fixed and only the method
 * scrolls.
 */
export function RecipeDetail({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) {
  const { refresh } = useStore();
  /** Removing is two taps rather than a dialog: the second tap is the confirm,
   *  and looking away resets it. A modal over a wall display is a trap for
   *  whoever walks up next. */
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!confirming) return;
    const timer = setTimeout(() => setConfirming(false), 4000);
    return () => clearTimeout(timer);
  }, [confirming]);

  const remove = async () => {
    if (busy) return;
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setBusy(true);
    try {
      await api.deleteRecipe(recipe.id);
      await refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove that recipe.');
      setBusy(false);
      setConfirming(false);
    }
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const serves = recipe.serves_label.replace(/^(serves|makes)\s+/i, '');

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: '#1E1A17',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 20,
        animation: 'fh-fade .18s ease-out',
      }}
    >
      <header
        style={{
          height: 196,
          flex: '0 0 196px',
          background: CATEGORY_FIELD[recipe.category],
          padding: '26px 34px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <button
          type="button"
          aria-label="Back"
          onClick={onClose}
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            background: 'rgba(20,17,15,0.30)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFF8F2',
          }}
        >
          <ChevronLeft size={26} strokeWidth={2} />
        </button>

        <button
          type="button"
          className="pressable"
          onClick={remove}
          disabled={busy}
          style={
            {
              height: 56,
              padding: '0 22px',
              borderRadius: 999,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 16,
              fontWeight: 600,
              color: '#FFF8F2',
              border: '1px solid rgba(255,248,242,0.30)',
              '--bg': confirming ? 'rgba(20,17,15,0.55)' : 'rgba(20,17,15,0.30)',
              '--bg-press': 'rgba(20,17,15,0.62)',
            } as React.CSSProperties
          }
        >
          <Trash2 size={20} strokeWidth={2} />
          {busy ? 'Removing…' : confirming ? 'Tap again to remove' : 'Remove'}
        </button>
        </div>

        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              color: 'rgba(255,248,242,0.82)',
            }}
          >
            {recipe.category}
          </div>
          <h1
            className="display-title"
            style={{ fontSize: 44, color: '#FFF8F2', marginTop: 6, marginBottom: 0 }}
          >
            {recipe.title}
          </h1>
          {error && (
            <div style={{ fontSize: 15, color: '#FFF8F2', marginTop: 8, opacity: 0.9 }}>{error}</div>
          )}
        </div>
      </header>

      <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: '352px minmax(0, 1fr)' }}>
        <aside
          className="scroll-none"
          style={{
            background: '#241F1B',
            padding: '24px 26px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            minHeight: 0,
            overflowY: 'auto',
          }}
        >
          <div style={{ display: 'flex', gap: 22 }}>
            {recipe.time_label && (
              <div>
                <div className="overline" style={{ fontSize: 11 }}>
                  Time
                </div>
                <div className="mono" style={{ fontSize: 19, color: '#FAF3E9', marginTop: 4 }}>
                  {recipe.time_label}
                </div>
              </div>
            )}
            {serves && (
              <div>
                <div className="overline" style={{ fontSize: 11 }}>
                  Serves
                </div>
                <div className="mono" style={{ fontSize: 19, color: '#FAF3E9', marginTop: 4 }}>
                  {serves}
                </div>
              </div>
            )}
          </div>

          <div style={{ height: 1, background: 'rgba(252,247,239,0.10)' }} />

          <div className="overline">Ingredients</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recipe.ingredients.map((ingredient, index) => (
              <div
                key={`${ingredient.name}-${index}`}
                style={{
                  display: 'flex',
                  gap: 14,
                  alignItems: 'baseline',
                  padding: '10px 0',
                  borderBottom: '1px solid rgba(252,247,239,0.07)',
                }}
              >
                <span
                  className="mono"
                  style={{ fontSize: 16, color: '#E37A57', minWidth: 86, flex: '0 0 86px' }}
                >
                  {ingredient.qty}
                </span>
                <span style={{ fontSize: 18, color: '#FAF3E9', lineHeight: 1.3 }}>
                  {ingredient.name}
                </span>
              </div>
            ))}
          </div>

          {recipe.source_url && (
            <div style={{ fontSize: 13, color: '#8E8073', wordBreak: 'break-all', lineHeight: 1.4 }}>
              From {new URL(recipe.source_url).hostname.replace(/^www\./, '')}
            </div>
          )}
        </aside>

        <section
          className="scroll-none"
          style={{
            padding: '24px 34px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            minHeight: 0,
            overflowY: 'auto',
          }}
        >
          <div className="overline">Method</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 20 }}>
            {recipe.steps.map((step, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  gap: 18,
                  alignItems: 'flex-start',
                  background: '#2A2420',
                  borderRadius: 16,
                  padding: '18px 20px',
                }}
              >
                <div
                  className="mono"
                  style={{
                    width: 38,
                    height: 38,
                    flex: '0 0 38px',
                    borderRadius: 999,
                    background: 'rgba(200,85,61,0.18)',
                    color: '#E37A57',
                    fontSize: 17,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {index + 1}
                </div>
                <div style={{ fontSize: 20, lineHeight: 1.5, color: '#EFE4D6', textWrap: 'pretty' }}>
                  {step}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
