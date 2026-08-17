import { useCallback, useEffect, useState } from 'react';
import { Check, ChevronLeft, Pencil, RotateCcw, Trash2 } from 'lucide-react';

import { api } from '../../api/client';
import { useStore } from '../../api/store';
import type { Recipe } from '../../api/types';
import { ManualRecipeForm } from '../../components/ManualRecipeForm';
import { CloseButton } from './AssignPanel';
import { RecipeTimer } from './RecipeTimer';
import { Sheet } from './Sheet';

/**
 * Full-bleed over the content area — the one screen someone reads while their
 * hands are busy, so the ingredients column stays fixed and only the method
 * scrolls.
 *
 * Cooking is the reason this screen exists, which is why ticking things off is
 * a tap on the line itself rather than a checkbox you have to hit. The ticks
 * are deliberately not saved to the server: they are about tonight, not about
 * the recipe, and a stale tick from last Tuesday showing up mid-cook is worse
 * than losing them when the display sleeps.
 */
export function RecipeDetail({
  recipe,
  onClose,
  /** How many times over it is being cooked tonight, from the plan. */
  batch = 1,
}: {
  recipe: Recipe;
  onClose: () => void;
  batch?: number;
}) {
  const { refresh, categoryField } = useStore();
  /** Removing is two taps rather than a dialog: the second tap is the confirm,
   *  and looking away resets it. A modal over a wall display is a trap for
   *  whoever walks up next. */
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());

  /** The recipe at tonight's size. Scaled by the server, because the quantity
   *  parser lives in Rust and a second one here would drift from the list. */
  const [scaled, setScaled] = useState<Recipe | null>(null);

  useEffect(() => {
    if (batch <= 1) {
      setScaled(null);
      return;
    }
    let live = true;
    api
      .recipeAtBatch(recipe.id, batch)
      // Falling back to the written amounts is the right failure: the recipe is
      // still cookable, it just is not doing the arithmetic for you.
      .then((next) => live && setScaled(next))
      .catch(() => live && setScaled(null));
    return () => {
      live = false;
    };
  }, [recipe.id, batch]);

  const shown = scaled ?? recipe;

  const reset = useCallback(() => {
    setCheckedIngredients(new Set());
    setCheckedSteps(new Set());
  }, []);

  // A different recipe is a different cook.
  useEffect(() => reset(), [recipe.id, reset]);

  const toggle = (set: Set<number>, index: number) => {
    const next = new Set(set);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    return next;
  };

  const done = checkedIngredients.size + checkedSteps.size;
  const total = shown.ingredients.length + shown.steps.length;

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
      if (event.key === 'Escape' && !editing) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, editing]);

  const serves = shown.serves_label.replace(/^(serves|makes)\s+/i, '');

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
          background: categoryField(recipe.category),
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <RecipeTimer />

            {/* Only offered once something is ticked. A reset that resets
                nothing is a button that does nothing. */}
            {done > 0 && (
              <HeaderButton onClick={reset} label={`Reset ${done}`} icon={<RotateCcw size={19} strokeWidth={2} />} />
            )}

            <HeaderButton
              onClick={() => setEditing(true)}
              label="Edit"
              icon={<Pencil size={19} strokeWidth={2} />}
            />

            <HeaderButton
              onClick={remove}
              label={busy ? 'Removing…' : confirming ? 'Tap again to remove' : 'Remove'}
              icon={<Trash2 size={19} strokeWidth={2} />}
              active={confirming}
            />
          </div>
        </div>

        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              color: 'rgba(255,248,242,0.82)',
            }}
          >
            {recipe.category}
            {batch > 1 && (
              <span
                className="mono"
                style={{
                  letterSpacing: 0,
                  textTransform: 'none',
                  padding: '4px 9px',
                  borderRadius: 8,
                  background: 'rgba(20,17,15,0.34)',
                  color: '#FFF8F2',
                }}
              >
                ×{batch} batch{scaled ? '' : ' · amounts as written'}
              </span>
            )}
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
            {shown.time_label && (
              <div>
                <div className="overline" style={{ fontSize: 11 }}>
                  Time
                </div>
                <div className="mono" style={{ fontSize: 19, color: '#FAF3E9', marginTop: 4 }}>
                  {shown.time_label}
                </div>
              </div>
            )}
            {serves && (
              <div>
                <div className="overline" style={{ fontSize: 11 }}>
                  Serves
                </div>
                <div className="mono" style={{ fontSize: 19, color: '#FAF3E9', marginTop: 4 }}>
                  {batch > 1 && scaled ? `${serves} ×${batch}` : serves}
                </div>
              </div>
            )}
          </div>

          <div style={{ height: 1, background: 'rgba(252,247,239,0.10)' }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="overline">Ingredients</div>
            {total > 0 && (
              <div className="mono" style={{ fontSize: 13, color: '#8E8073' }}>
                {done}/{total}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {shown.ingredients.map((ingredient, index) => {
              const ticked = checkedIngredients.has(index);
              return (
                <button
                  key={`${ingredient.name}-${index}`}
                  type="button"
                  className="pressable"
                  aria-pressed={ticked}
                  onClick={() => setCheckedIngredients((set) => toggle(set, index))}
                  style={
                    {
                      display: 'flex',
                      gap: 12,
                      alignItems: 'baseline',
                      padding: '10px 8px',
                      marginLeft: -8,
                      marginRight: -8,
                      borderRadius: 10,
                      borderBottom: '1px solid rgba(252,247,239,0.07)',
                      textAlign: 'left',
                      opacity: ticked ? 0.4 : 1,
                      transition: 'opacity .15s',
                      '--bg-press': 'rgba(252,247,239,0.06)',
                    } as React.CSSProperties
                  }
                >
                  <Tick ticked={ticked} />
                  <span
                    className="mono"
                    style={{ fontSize: 16, color: '#E37A57', minWidth: 78, flex: '0 0 78px' }}
                  >
                    {ingredient.qty}
                  </span>
                  <span
                    style={{
                      fontSize: 18,
                      color: '#FAF3E9',
                      lineHeight: 1.3,
                      textDecoration: ticked ? 'line-through' : 'none',
                    }}
                  >
                    {ingredient.name}
                  </span>
                </button>
              );
            })}
          </div>

          {recipe.source_url && (
            <div style={{ fontSize: 13, color: '#8E8073', wordBreak: 'break-all', lineHeight: 1.4 }}>
              From {hostOf(recipe.source_url)}
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
            {shown.steps.map((step, index) => {
              const ticked = checkedSteps.has(index);
              return (
                <button
                  key={index}
                  type="button"
                  className="pressable"
                  aria-pressed={ticked}
                  onClick={() => setCheckedSteps((set) => toggle(set, index))}
                  style={
                    {
                      display: 'flex',
                      gap: 18,
                      alignItems: 'flex-start',
                      borderRadius: 16,
                      padding: '18px 20px',
                      textAlign: 'left',
                      opacity: ticked ? 0.42 : 1,
                      transition: 'opacity .15s',
                      '--bg': ticked ? '#231E1B' : '#2A2420',
                      '--bg-press': '#342C27',
                    } as React.CSSProperties
                  }
                >
                  <div
                    className="mono"
                    style={{
                      width: 38,
                      height: 38,
                      flex: '0 0 38px',
                      borderRadius: 999,
                      background: ticked ? '#6E8B57' : 'rgba(200,85,61,0.18)',
                      color: ticked ? '#FBFCF7' : '#E37A57',
                      fontSize: 17,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {ticked ? <Check size={20} strokeWidth={3} /> : index + 1}
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      lineHeight: 1.5,
                      color: '#EFE4D6',
                      textWrap: 'pretty',
                      textDecoration: ticked ? 'line-through' : 'none',
                    }}
                  >
                    {step}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {editing && (
        <Sheet width={520} onClose={() => setEditing(false)}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div className="overline">Editing</div>
              <div className="serif" style={{ fontSize: 28, color: '#FAF3E9', marginTop: 6 }}>
                {recipe.title}
              </div>
            </div>
            <CloseButton onClose={() => setEditing(false)} />
          </div>
          <ManualRecipeForm
            recipe={recipe}
            onSaved={async () => {
              await refresh();
              setEditing(false);
              // Ticks refer to line numbers, and the lines may have moved.
              reset();
            }}
          />
        </Sheet>
      )}
    </div>
  );
}

function Tick({ ticked }: { ticked: boolean }) {
  return (
    <span
      style={{
        width: 22,
        height: 22,
        flex: '0 0 22px',
        alignSelf: 'center',
        borderRadius: 7,
        border: `2px solid ${ticked ? '#6E8B57' : 'rgba(252,247,239,0.26)'}`,
        background: ticked ? '#6E8B57' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: ticked ? '#FBFCF7' : 'transparent',
      }}
    >
      <Check size={13} strokeWidth={3.4} />
    </span>
  );
}

function HeaderButton({
  onClick,
  label,
  icon,
  active = false,
}: {
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className="pressable"
      onClick={onClick}
      style={
        {
          height: 56,
          padding: '0 20px',
          borderRadius: 999,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 16,
          fontWeight: 600,
          color: '#FFF8F2',
          border: '1px solid rgba(255,248,242,0.30)',
          '--bg': active ? 'rgba(20,17,15,0.55)' : 'rgba(20,17,15,0.30)',
          '--bg-press': 'rgba(20,17,15,0.62)',
        } as React.CSSProperties
      }
    >
      {icon}
      {label}
    </button>
  );
}

/** A malformed `source_url` must not take the whole screen down with it. */
function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
