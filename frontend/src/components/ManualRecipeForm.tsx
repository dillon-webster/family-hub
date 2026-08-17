import { useState } from 'react';

import { api } from '../api/client';
import { useStore } from '../api/store';
import type { Recipe } from '../api/types';

/**
 * Typing a recipe in by hand — the index-card route — and editing one already
 * in the library. The same form, because they are the same decisions; only the
 * verb on the button changes.
 *
 * Ingredients go in as plain lines ("500 g potato gnocchi"); the server splits
 * the amount from the name using the same parser the link importer uses, so
 * there is one implementation of that rule rather than two.
 */
export function ManualRecipeForm({
  onSaved,
  theme = 'dark',
  /** Present when editing. Absent is the blank form. */
  recipe,
}: {
  onSaved: () => void | Promise<void>;
  theme?: 'dark' | 'light';
  recipe?: Recipe;
}) {
  const { categories } = useStore();

  const [title, setTitle] = useState(recipe?.title ?? '');
  const [timeLabel, setTimeLabel] = useState(recipe?.time_label ?? '');
  const [serves, setServes] = useState(recipe?.serves_label ?? '');
  const [blurb, setBlurb] = useState(recipe?.blurb ?? '');
  const [category, setCategory] = useState(
    recipe?.category ?? categories[0]?.name ?? 'Dinner',
  );
  const [ingredients, setIngredients] = useState(
    // Back to the lines they were typed as, so the round trip through the
    // splitter is invisible to whoever is editing.
    (recipe?.ingredients ?? [])
      .map((item) => [item.qty, item.name].filter(Boolean).join(' '))
      .join('\n'),
  );
  const [steps, setSteps] = useState((recipe?.steps ?? []).join('\n'));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dark = theme === 'dark';
  const field: React.CSSProperties = {
    background: dark ? '#1C1815' : '#FFFDF9',
    border: `1px solid ${dark ? 'rgba(252,247,239,0.14)' : '#DBCBB1'}`,
    borderRadius: 14,
    padding: '14px 16px',
    fontSize: 17,
    color: dark ? '#FAF3E9' : '#2B2521',
    outline: 'none',
    width: '100%',
    resize: 'vertical',
    fontFamily: 'inherit',
  };
  const label = { marginBottom: 8, display: 'block' } as const;

  const save = async () => {
    if (!title.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const draft = {
        title: title.trim(),
        category,
        time_label: timeLabel.trim(),
        time_minutes: parseMinutes(timeLabel),
        serves_label: serves.trim(),
        blurb: blurb.trim(),
        // Sent alongside the empty `ingredients` so the server splits them.
        ingredients: [],
        ingredient_lines: ingredients.split('\n'),
        steps: steps
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean),
      };

      if (recipe) {
        await api.updateRecipe(recipe.id, draft);
      } else {
        await api.saveRecipe(draft, 'manual');
      }
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that recipe.');
      setBusy(false);
    }
  };

  return (
    <div
      className="scroll-none"
      style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, minHeight: 0, overflowY: 'auto' }}
    >
      <div>
        <div className="overline" style={label}>
          Name
        </div>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Dad's Sunday chili"
          style={field}
        />
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div className="overline" style={label}>
            Time
          </div>
          <input
            value={timeLabel}
            onChange={(event) => setTimeLabel(event.target.value)}
            placeholder="2 hr"
            className="mono"
            style={{ ...field, fontSize: 16 }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div className="overline" style={label}>
            Serves
          </div>
          <input
            value={serves}
            onChange={(event) => setServes(event.target.value)}
            placeholder="serves 6"
            className="mono"
            style={{ ...field, fontSize: 16 }}
          />
        </div>
      </div>

      <div>
        <div className="overline" style={label}>
          Category
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {categories.map((option) => {
            const active = category === option.name;
            return (
              <button
                key={option.id}
                type="button"
                className="pressable"
                onClick={() => setCategory(option.name)}
                style={
                  {
                    height: 48,
                    padding: '0 20px',
                    borderRadius: 999,
                    border: active
                      ? '1px solid transparent'
                      : `1px solid ${dark ? 'rgba(252,247,239,0.16)' : '#DBCBB1'}`,
                    color: active ? '#FFF8F2' : dark ? '#BFB0A0' : '#6F6357',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: 16,
                    fontWeight: 600,
                    // The category's own colour, so picking one shows what the
                    // card will look like rather than describing it.
                    '--bg': active ? option.color_from : 'transparent',
                    '--bg-press': active ? option.color_to : dark ? '#2E2823' : '#F6EDDE',
                  } as React.CSSProperties
                }
              >
                {option.name}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="overline" style={label}>
          Ingredients — one per line
        </div>
        <textarea
          value={ingredients}
          onChange={(event) => setIngredients(event.target.value)}
          rows={6}
          placeholder={'900 g ground beef\n2 onions, diced\n3 tbsp chili powder'}
          style={{ ...field, fontSize: 16, lineHeight: 1.6 }}
        />
      </div>

      <div>
        <div className="overline" style={label}>
          Method — one step per line
        </div>
        <textarea
          value={steps}
          onChange={(event) => setSteps(event.target.value)}
          rows={6}
          placeholder={'Brown the beef hard in a heavy pot.\nSoften the onions, then bloom the spices.'}
          style={{ ...field, fontSize: 16, lineHeight: 1.6 }}
        />
      </div>

      {/* Only when editing: the blurb is written by the importers and shown on
          the wall, so it is worth being able to fix, but not worth asking for
          on the way in. */}
      {recipe && (
        <div>
          <div className="overline" style={label}>
            One line for the wall display
          </div>
          <input
            value={blurb}
            onChange={(event) => setBlurb(event.target.value)}
            placeholder="Crisped in nutty brown butter and sage."
            style={field}
          />
        </div>
      )}

      {error && <div style={{ fontSize: 15, color: '#C8553D', lineHeight: 1.5 }}>{error}</div>}

      <button
        type="button"
        className="pressable"
        onClick={save}
        style={
          {
            height: 60,
            borderRadius: 16,
            color: '#FFF8F2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            fontWeight: 600,
            opacity: title.trim() ? 1 : 0.5,
            flex: '0 0 auto',
            '--bg': '#C8553D',
            '--bg-press': '#A23F29',
          } as React.CSSProperties
        }
      >
        {busy ? 'Saving…' : recipe ? 'Save changes' : 'Save to library'}
      </button>
    </div>
  );
}

/** "1 hr 15" / "45 min" / "2 hours" → whole minutes, for the quick filter. */
function parseMinutes(label: string): number | null {
  const hours = label.match(/(\d+)\s*(h|hr|hour)/i);
  const mins = label.match(/(\d+)\s*(m|min|minute)/i);
  // A bare trailing number after an hour value is minutes: "1 hr 15".
  const trailing = !mins && hours ? label.match(/h\w*\s+(\d+)\s*$/i) : null;

  const total =
    (hours ? Number(hours[1]) * 60 : 0) +
    (mins ? Number(mins[1]) : 0) +
    (trailing ? Number(trailing[1]) : 0);

  if (total > 0) return total;
  const bare = label.match(/^\s*(\d+)\s*$/);
  return bare ? Number(bare[1]) : null;
}
