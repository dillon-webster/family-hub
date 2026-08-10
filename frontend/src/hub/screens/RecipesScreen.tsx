import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';

import { useStore } from '../../api/store';
import type { Recipe } from '../../api/types';
import { CATEGORY_FIELD } from '../../design/category';
import { AddRecipeSheet } from '../panels/AddRecipeSheet';
import { RecipeDetail } from '../panels/RecipeDetail';

type Filter = 'all' | 'Dinner' | 'Vegetarian' | 'quick';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'Dinner', label: 'Dinner' },
  { key: 'Vegetarian', label: 'Vegetarian' },
  { key: 'quick', label: 'Under 30 min' },
];

export function RecipesScreen({
  openRecipe,
  setOpenRecipe,
}: {
  openRecipe: string | null;
  setOpenRecipe: (id: string | null) => void;
}) {
  const { data } = useStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [adding, setAdding] = useState(false);

  const recipes = useMemo(() => {
    const all = data?.recipes ?? [];
    if (filter === 'all') return all;
    if (filter === 'quick') {
      return all.filter((r) => r.time_minutes !== null && r.time_minutes <= 30);
    }
    return all.filter((r) => r.category === filter);
  }, [data?.recipes, filter]);

  if (!data) return null;

  const detail: Recipe | undefined = openRecipe
    ? data.recipes.find((r) => r.id === openRecipe)
    : undefined;

  return (
    <div style={{ padding: '30px 34px', height: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20 }}>
        <div>
          <h1 className="display-title" style={{ fontSize: 36, color: '#FAF3E9', margin: 0 }}>
            Recipes
          </h1>
          <div style={{ fontSize: 16, color: '#8E8073', marginTop: 4 }}>
            {data.recipes.length} in the family library
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="pressable"
            onClick={() => setAdding(true)}
            style={
              {
                height: 48,
                padding: '0 22px 0 18px',
                borderRadius: 999,
                color: '#FFF8F2',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 16,
                fontWeight: 600,
                '--bg': '#C8553D',
                '--bg-press': '#A23F29',
              } as React.CSSProperties
            }
          >
            <Plus size={20} strokeWidth={2.2} />
            Add recipe
          </button>

          <div style={{ width: 1, height: 32, background: 'rgba(252,247,239,0.14)', margin: '0 4px' }} />

          {FILTERS.map(({ key, label }) => {
            const active = filter === key;
            return (
              <button
                key={key}
                type="button"
                className="pressable"
                onClick={() => setFilter(key)}
                style={
                  {
                    height: 48,
                    padding: '0 20px',
                    borderRadius: 999,
                    border: active ? '1px solid transparent' : '1px solid rgba(252,247,239,0.16)',
                    color: active ? '#E37A57' : '#BFB0A0',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: 15,
                    fontWeight: 600,
                    '--bg': active ? 'rgba(200,85,61,0.22)' : 'transparent',
                    '--bg-press': 'rgba(200,85,61,0.30)',
                  } as React.CSSProperties
                }
              >
                {label}
              </button>
            );
          })}
        </div>
      </header>

      {recipes.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            color: '#8E8073',
          }}
        >
          <div className="serif" style={{ fontSize: 28, color: '#BFB0A0' }}>
            {data.recipes.length === 0 ? 'The library is empty' : 'Nothing matches that filter'}
          </div>
          <div style={{ fontSize: 17 }}>
            {data.recipes.length === 0
              ? 'Add one from a link, a photo, or type it in.'
              : 'Try another filter.'}
          </div>
        </div>
      ) : (
        <div
          className="scroll-none"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gridAutoRows: 'minmax(230px, 1fr)',
            gap: 16,
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            alignContent: 'start',
          }}
        >
          {recipes.map((recipe) => (
            <button
              key={recipe.id}
              type="button"
              className="pressable"
              onClick={() => setOpenRecipe(recipe.id)}
              style={
                {
                  border: '1px solid rgba(252,247,239,0.09)',
                  borderRadius: 20,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: 0,
                  textAlign: 'left',
                  '--bg': '#2A2420',
                  '--bg-press': '#342C27',
                } as React.CSSProperties
              }
            >
              <div
                style={{
                  height: 104,
                  flex: '0 0 104px',
                  background: CATEGORY_FIELD[recipe.category],
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: 12,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,248,242,0.88)',
                  }}
                >
                  {recipe.category}
                </span>
              </div>
              <div
                style={{
                  flex: 1,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 10,
                  minWidth: 0,
                }}
              >
                <div>
                  <div className="serif" style={{ fontSize: 23, lineHeight: 1.16, color: '#FAF3E9' }}>
                    {recipe.title}
                  </div>
                  {recipe.blurb && (
                    <div style={{ fontSize: 14, color: '#8E8073', marginTop: 6, lineHeight: 1.35 }}>
                      {recipe.blurb}
                    </div>
                  )}
                </div>
                <div className="mono" style={{ fontSize: 14, color: '#BFB0A0' }}>
                  {[recipe.time_label, recipe.serves_label].filter(Boolean).join(' · ')}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {adding && <AddRecipeSheet onClose={() => setAdding(false)} />}
      {detail && <RecipeDetail recipe={detail} onClose={() => setOpenRecipe(null)} />}
    </div>
  );
}
