import { useState } from 'react';

import { CATEGORIES, api } from '../api/client';
import type { Category } from '../api/types';

/**
 * Typing a recipe in by hand — the index-card route.
 *
 * Ingredients go in as plain lines ("500 g potato gnocchi"); the server splits
 * the amount from the name using the same parser the link importer uses, so
 * there is one implementation of that rule rather than two.
 */
export function ManualRecipeForm({
  onSaved,
  theme = 'dark',
}: {
  onSaved: () => void | Promise<void>;
  theme?: 'dark' | 'light';
}) {
  const [title, setTitle] = useState('');
  const [timeLabel, setTimeLabel] = useState('');
  const [serves, setServes] = useState('');
  const [category, setCategory] = useState<Category>('Dinner');
  const [ingredients, setIngredients] = useState('');
  const [steps, setSteps] = useState('');
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
      const minutes = parseMinutes(timeLabel);
      await api.saveRecipe(
        {
          title: title.trim(),
          category,
          time_label: timeLabel.trim(),
          time_minutes: minutes,
          serves_label: serves.trim(),
          blurb: '',
          ingredients: [],
          steps: steps
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean),
          // Sent alongside the empty `ingredients` so the server splits them.
          ...({ ingredient_lines: ingredients.split('\n') } as object),
        },
        'manual',
      );
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
          {CATEGORIES.map((option) => {
            const active = category === option;
            return (
              <button
                key={option}
                type="button"
                className="pressable"
                onClick={() => setCategory(option)}
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
                    '--bg': active ? '#C8553D' : 'transparent',
                    '--bg-press': active ? '#A23F29' : dark ? '#2E2823' : '#F6EDDE',
                  } as React.CSSProperties
                }
              >
                {option}
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
        {busy ? 'Saving…' : 'Save to library'}
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
