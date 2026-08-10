import { useState } from 'react';
import { ChevronLeft, ChevronRight, History, Plus, ShoppingCart } from 'lucide-react';

import { useStore } from '../../api/store';
import { CATEGORY_FIELD, OUT_FIELD } from '../../design/category';
import { addDays, dayNumber, dayShort, isSameDay, isoDate, weekDays, weekRange } from '../../lib/week';
import { AssignPanel } from '../panels/AssignPanel';
import { HistorySheet } from '../panels/HistorySheet';
import { ShoppingSheet } from '../panels/ShoppingSheet';

interface Props {
  assignDay: string | null;
  setAssignDay: (day: string | null) => void;
  onOpenRecipe: (id: string) => void;
}

export function MealsScreen({ assignDay, setAssignDay, onOpenRecipe }: Props) {
  const { data, weekStart, setWeekStart, entryFor, recipeFor } = useStore();
  const [listOpen, setListOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  if (!data) return null;

  const days = weekDays(weekStart);
  const today = new Date();
  const plannedCount = data.plan.filter((entry) =>
    days.some((day) => isoDate(day) === entry.day),
  ).length;

  return (
    <div style={{ padding: '30px 34px', height: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20 }}>
        <div style={{ minWidth: 0 }}>
          <h1 className="display-title" style={{ fontSize: 36, color: '#FAF3E9', margin: 0 }}>
            Meal plan
          </h1>
          <div style={{ fontSize: 16, color: '#8E8073', marginTop: 4, whiteSpace: 'nowrap' }}>
            {weekRange(weekStart)} · {plannedCount} of 7 dinners planned
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: '0 0 auto' }}>
          {/* Secondary to the shopping list: outlined rather than terracotta,
              because looking back is a browse and the list is the errand. */}
          <button
            type="button"
            className="pressable"
            onClick={() => setHistoryOpen(true)}
            style={
              {
                height: 52,
                padding: '0 20px',
                borderRadius: 999,
                border: '1px solid rgba(252,247,239,0.18)',
                color: '#BFB0A0',
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                fontSize: 16,
                fontWeight: 600,
                '--bg-press': 'rgba(252,247,239,0.08)',
              } as React.CSSProperties
            }
          >
            <History size={20} strokeWidth={2} />
            Past weeks
          </button>

          <button
            type="button"
            className="pressable"
            onClick={() => setListOpen(true)}
            style={
              {
                height: 52,
                padding: '0 22px 0 18px',
                borderRadius: 999,
                color: '#FFF8F2',
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                fontSize: 16,
                fontWeight: 600,
                '--bg': '#C8553D',
                '--bg-press': '#A23F29',
              } as React.CSSProperties
            }
          >
            <ShoppingCart size={20} strokeWidth={2} />
            Shopping list
          </button>

          <div style={{ width: 1, height: 32, background: 'rgba(252,247,239,0.14)', margin: '0 4px' }} />

          <button
            type="button"
            className="pressable"
            aria-label="Previous week"
            onClick={() => setWeekStart(addDays(weekStart, -7))}
            style={
              {
                width: 52,
                height: 52,
                borderRadius: 14,
                border: '1px solid rgba(252,247,239,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#BFB0A0',
                '--bg-press': 'rgba(252,247,239,0.08)',
              } as React.CSSProperties
            }
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            className="pressable"
            aria-label="Next week"
            onClick={() => setWeekStart(addDays(weekStart, 7))}
            style={
              {
                width: 52,
                height: 52,
                borderRadius: 14,
                border: '1px solid rgba(252,247,239,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#BFB0A0',
                '--bg-press': 'rgba(252,247,239,0.08)',
              } as React.CSSProperties
            }
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gap: 12,
          flex: 1,
          minHeight: 0,
        }}
      >
        {days.map((day) => {
          const key = isoDate(day);
          const entry = entryFor(day);
          const recipe = recipeFor(day);
          const out = entry?.kind === 'out';
          const isToday = isSameDay(day, today);
          const isTarget = assignDay === key;

          return (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
              <div
                style={{
                  textAlign: 'center',
                  padding: '8px 0',
                  borderRadius: 12,
                  background: isToday ? 'rgba(200,85,61,0.20)' : 'transparent',
                }}
              >
                <div className="overline" style={{ color: isToday ? '#E37A57' : '#8E8073' }}>
                  {dayShort(day)}
                </div>
                <div
                  className="mono"
                  style={{ fontSize: 18, color: isToday ? '#E37A57' : '#8E8073', marginTop: 2 }}
                >
                  {dayNumber(day)}
                </div>
              </div>

              <button
                type="button"
                className="press-lift"
                // Every night opens the assign panel, planned or not. Sending a
                // planned night straight to the recipe left no way to change or
                // clear it: "Clear this night" only renders for a night that
                // has something, which was exactly the night you could not open.
                onClick={() => setAssignDay(key)}
                style={{
                  flex: 1,
                  minHeight: 0,
                  borderRadius: 20,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  background: recipe || out ? '#2A2420' : 'rgba(252,247,239,0.02)',
                  border:
                    recipe || out
                      ? '1px solid rgba(252,247,239,0.09)'
                      : isTarget
                        ? '2px dashed #C8553D'
                        : '2px dashed rgba(252,247,239,0.16)',
                }}
              >
                {recipe && (
                  <>
                    <div
                      style={{
                        height: 150,
                        flex: '0 0 150px',
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
                          color: 'rgba(255,248,242,0.85)',
                        }}
                      >
                        {recipe.category}
                      </span>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        padding: '16px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                        textAlign: 'left',
                      }}
                    >
                      <div className="serif" style={{ fontSize: 22, lineHeight: 1.18, color: '#FAF3E9' }}>
                        {recipe.title}
                      </div>
                      <div className="mono" style={{ fontSize: 13, color: '#8E8073' }}>
                        {recipe.time_label}
                      </div>
                    </div>
                  </>
                )}

                {out && (
                  <>
                    <div
                      style={{
                        height: 150,
                        flex: '0 0 150px',
                        background: OUT_FIELD,
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
                          color: 'rgba(255,248,242,0.85)',
                        }}
                      >
                        Eating out
                      </span>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        padding: '16px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                        textAlign: 'left',
                      }}
                    >
                      <div className="serif" style={{ fontSize: 22, lineHeight: 1.18, color: '#FAF3E9' }}>
                        {entry?.out_place ?? 'Eating out'}
                      </div>
                      <div className="mono" style={{ fontSize: 13, color: '#8E8073' }}>
                        no cooking
                      </div>
                    </div>
                  </>
                )}

                {!recipe && !out && (
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 12,
                      padding: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 999,
                        background: 'rgba(200,85,61,0.16)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#E37A57',
                      }}
                    >
                      <Plus size={30} strokeWidth={1.6} />
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: '#BFB0A0',
                        textAlign: 'center',
                        lineHeight: 1.3,
                      }}
                    >
                      Tap to add
                      <br />
                      dinner
                    </div>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {assignDay && (
        <AssignPanel
          day={assignDay}
          onClose={() => setAssignDay(null)}
          onOpenRecipe={onOpenRecipe}
        />
      )}
      {listOpen && <ShoppingSheet onClose={() => setListOpen(false)} />}
      {historyOpen && (
        <HistorySheet onClose={() => setHistoryOpen(false)} onOpenRecipe={onOpenRecipe} />
      )}
    </div>
  );
}
