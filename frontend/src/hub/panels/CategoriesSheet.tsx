import { useState } from 'react';
import { Check, Pencil, Trash2 } from 'lucide-react';

import { api } from '../../api/client';
import { useStore } from '../../api/store';
import type { RecipeCategory } from '../../api/types';
import { fieldOf } from '../../design/category';
import { CloseButton } from './AssignPanel';
import { Sheet } from './Sheet';

/**
 * The household's categories.
 *
 * A category is not a label in this product — there is no photography, so its
 * two colours are the entire visual identity of every recipe in it. That is why
 * this screen is mostly a colour picker, and why creating one asks for the
 * gradient up front rather than assigning a grey and hoping someone comes back.
 */

/**
 * The palette, taken from the design tokens rather than opened up to a colour
 * wheel. A free picker on a wall display produces a library that looks like a
 * bag of sweets within a month; these are the hues the rest of the hub already
 * uses, each with the darker stop the gradient ends on.
 */
const PALETTE: { name: string; from: string; to: string }[] = [
  { name: 'Terracotta', from: '#C8553D', to: '#8F3626' },
  { name: 'Amber', from: '#D9962B', to: '#9A6414' },
  { name: 'Olive', from: '#6E8B57', to: '#455A34' },
  { name: 'Plum', from: '#7C4E6B', to: '#4E2E43' },
  { name: 'Slate', from: '#4F7CA0', to: '#2E4C63' },
  { name: 'Clay', from: '#A2705A', to: '#6B4636' },
  { name: 'Moss', from: '#5E7A6A', to: '#374B41' },
  { name: 'Ink', from: '#5B5766', to: '#35323E' },
];

export function CategoriesSheet({ onClose }: { onClose: () => void }) {
  const { data, categories, refresh } = useStore();
  const [editing, setEditing] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [swatch, setSwatch] = useState(0);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Removing is two taps rather than a dialog, matching the recipe screen. */
  const [confirming, setConfirming] = useState<string | null>(null);

  if (!data) return null;

  const counts = new Map<string, number>();
  for (const recipe of data.recipes) {
    counts.set(recipe.category, (counts.get(recipe.category) ?? 0) + 1);
  }

  const run = async (action: () => Promise<unknown>) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await action();
      await refresh();
      setEditing(null);
      setAdding(false);
      setDraftName('');
      setConfirming(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That did not save.');
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (category: RecipeCategory) => {
    const index = PALETTE.findIndex((option) => option.from === category.color_from);
    setEditing(category.id);
    setAdding(false);
    setDraftName(category.name);
    setSwatch(index === -1 ? 0 : index);
    setError(null);
  };

  const startAdd = () => {
    setAdding(true);
    setEditing(null);
    setDraftName('');
    setSwatch(categories.length % PALETTE.length);
    setError(null);
  };

  const remove = (category: RecipeCategory) => {
    if (confirming !== category.id) {
      setConfirming(category.id);
      return;
    }
    void run(() => api.deleteCategory(category.id));
  };

  const field = {
    background: '#1C1815',
    border: '1px solid rgba(252,247,239,0.16)',
    borderRadius: 12,
    padding: '13px 15px',
    fontSize: 17,
    color: '#FAF3E9',
    outline: 'none',
    width: '100%',
  } as const;

  return (
    <Sheet width={460} onClose={onClose}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div className="overline">Recipe library</div>
          <div className="serif" style={{ fontSize: 30, color: '#FAF3E9', marginTop: 6 }}>
            Categories
          </div>
        </div>
        <CloseButton onClose={onClose} />
      </div>

      <div style={{ fontSize: 15, color: '#8E8073', lineHeight: 1.5 }}>
        Recipes have no photographs here — a category's colour is how its cards
        are told apart across the kitchen.
      </div>

      {error && (
        <div style={{ fontSize: 15, color: '#E37A57', lineHeight: 1.5 }}>{error}</div>
      )}

      <div
        className="scroll-none"
        style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}
      >
        {categories.map((category) => {
          const count = counts.get(category.name) ?? 0;

          if (editing === category.id) {
            return (
              <Editor
                key={category.id}
                field={field}
                name={draftName}
                setName={setDraftName}
                swatch={swatch}
                setSwatch={setSwatch}
                busy={busy}
                onCancel={() => setEditing(null)}
                onSave={() =>
                  run(() =>
                    api.updateCategory(category.id, {
                      name: draftName,
                      color_from: PALETTE[swatch].from,
                      color_to: PALETTE[swatch].to,
                    }),
                  )
                }
              />
            );
          }

          return (
            <div
              key={category.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                background: '#2E2823',
                border: '1px solid rgba(252,247,239,0.10)',
                borderRadius: 16,
                padding: '12px 14px',
                minHeight: 72,
                flex: '0 0 auto',
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  flex: '0 0 52px',
                  borderRadius: 12,
                  background: fieldOf(category),
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="serif" style={{ fontSize: 20, color: '#FAF3E9', lineHeight: 1.2 }}>
                  {category.name}
                </div>
                <div className="mono" style={{ fontSize: 13, color: '#8E8073', marginTop: 3 }}>
                  {count === 0 ? 'no recipes' : `${count} recipe${count === 1 ? '' : 's'}`}
                </div>
              </div>

              <button
                type="button"
                className="pressable"
                aria-label={`Edit ${category.name}`}
                onClick={() => startEdit(category)}
                style={
                  {
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#BFB0A0',
                    '--bg-press': '#3A322C',
                  } as React.CSSProperties
                }
              >
                <Pencil size={18} strokeWidth={2} />
              </button>

              {/* A category with recipes in it cannot be removed — the server
                  says so by name and count, so the button stays live rather
                  than being disabled with no explanation. */}
              <button
                type="button"
                className="pressable"
                aria-label={`Remove ${category.name}`}
                onClick={() => remove(category)}
                style={
                  {
                    height: 44,
                    padding: confirming === category.id ? '0 14px' : '0',
                    width: confirming === category.id ? 'auto' : 44,
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    color: confirming === category.id ? '#E37A57' : '#BFB0A0',
                    '--bg-press': '#3A322C',
                  } as React.CSSProperties
                }
              >
                <Trash2 size={18} strokeWidth={2} />
                {confirming === category.id && 'Tap again'}
              </button>
            </div>
          );
        })}

        {adding && (
          <Editor
            field={field}
            name={draftName}
            setName={setDraftName}
            swatch={swatch}
            setSwatch={setSwatch}
            busy={busy}
            onCancel={() => setAdding(false)}
            onSave={() =>
              run(() =>
                api.addCategory({
                  name: draftName,
                  color_from: PALETTE[swatch].from,
                  color_to: PALETTE[swatch].to,
                }),
              )
            }
          />
        )}
      </div>

      {!adding && (
        <button
          type="button"
          className="pressable"
          onClick={startAdd}
          style={
            {
              height: 56,
              borderRadius: 16,
              color: '#FFF8F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 17,
              fontWeight: 600,
              flex: '0 0 auto',
              '--bg': '#C8553D',
              '--bg-press': '#A23F29',
            } as React.CSSProperties
          }
        >
          Add a category
        </button>
      )}
    </Sheet>
  );
}

function Editor({
  field,
  name,
  setName,
  swatch,
  setSwatch,
  busy,
  onCancel,
  onSave,
}: {
  field: React.CSSProperties;
  name: string;
  setName: (value: string) => void;
  swatch: number;
  setSwatch: (index: number) => void;
  busy: boolean;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div
      style={{
        background: '#2E2823',
        border: '1px solid rgba(200,85,61,0.45)',
        borderRadius: 16,
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        flex: '0 0 auto',
      }}
    >
      <input
        autoFocus
        value={name}
        maxLength={24}
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => event.key === 'Enter' && onSave()}
        placeholder="Slow cooker"
        style={field}
      />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {PALETTE.map((option, index) => (
          <button
            key={option.name}
            type="button"
            aria-label={option.name}
            aria-pressed={swatch === index}
            onClick={() => setSwatch(index)}
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: fieldOf({ color_from: option.from, color_to: option.to }),
              border:
                swatch === index ? '2px solid #FAF3E9' : '2px solid rgba(252,247,239,0.10)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF8F2',
            }}
          >
            {swatch === index && <Check size={20} strokeWidth={3} />}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          type="button"
          className="pressable"
          onClick={onCancel}
          style={
            {
              flex: 1,
              height: 48,
              borderRadius: 12,
              border: '1px solid rgba(252,247,239,0.18)',
              color: '#BFB0A0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 600,
              '--bg-press': 'rgba(252,247,239,0.06)',
            } as React.CSSProperties
          }
        >
          Cancel
        </button>
        <button
          type="button"
          className="pressable"
          onClick={onSave}
          style={
            {
              flex: 1,
              height: 48,
              borderRadius: 12,
              color: '#FFF8F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              fontWeight: 600,
              opacity: name.trim() ? 1 : 0.5,
              '--bg': '#C8553D',
              '--bg-press': '#A23F29',
            } as React.CSSProperties
          }
        >
          {busy ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}
