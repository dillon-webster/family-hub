import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CalendarCheck, History, Plus, ShoppingCart } from 'lucide-react';

import { useStore } from '../../api/store';
import { LEFTOVERS_FIELD, OUT_FIELD } from '../../design/category';
import {
  addDays,
  dayNumber,
  dayShort,
  isSameDay,
  isoDate,
  mondayOf,
  monthDay,
  weekRange,
} from '../../lib/week';
import { mealKey } from '../../lib/meal';
import { AssignPanel } from '../panels/AssignPanel';
import { HistorySheet } from '../panels/HistorySheet';
import { LunchStrip } from '../panels/LunchStrip';
import { ShoppingSheet } from '../panels/ShoppingSheet';

interface Props {
  assignDay: string | null;
  setAssignDay: (day: string | null) => void;
  onOpenRecipe: (id: string, batch?: number) => void;
}

/**
 * The plan is a strip you scroll, not a week you page.
 *
 * Paging with arrows made the boundary between Sunday and Monday into a wall:
 * planning Sunday and the Monday after it — which is one decision a household
 * makes in one breath — took two taps and a reorientation. A continuous strip
 * has no boundary, so the only thing left to solve is knowing where you are,
 * which is what the Today button and the live week label are for.
 */

/** One day column, and the gap between two. Needed as numbers because the
 *  scroll maths converts pixels back into which day is on the left. */
const DAY_WIDTH = 188;
const DAY_GAP = 12;
const STRIDE = DAY_WIDTH + DAY_GAP;

/** How far the strip runs either side of its anchor. Matches the plan window
 *  the bootstrap request asks for — a strip wider than the data would scroll
 *  into days that render as empty rather than unknown. */
const DAYS_BEFORE = 21;
const DAYS_AFTER = 27;

export function MealsScreen({ assignDay, setAssignDay, onOpenRecipe }: Props) {
  const { data, weekStart, setWeekStart, entryFor, recipeFor, categoryField } = useStore();
  const [listOpen, setListOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const scroller = useRef<HTMLDivElement>(null);

  /**
   * The strip's origin, deliberately independent of `weekStart`.
   *
   * Scrolling updates `weekStart` so the shopping list follows what you are
   * looking at, and `weekStart` drives a refetch. If the day range were derived
   * from it too, every scroll would rebuild the strip under your finger and
   * throw away the scroll position. The anchor only moves when Today is pressed.
   */
  const [anchor, setAnchor] = useState(() => mondayOf(new Date()));

  /** The leftmost day on screen, which is what the header describes. */
  const [firstVisible, setFirstVisible] = useState(() => mondayOf(new Date()));

  const days = Array.from({ length: DAYS_BEFORE + DAYS_AFTER + 1 }, (_, index) =>
    addDays(anchor, index - DAYS_BEFORE),
  );

  const today = new Date();

  const scrollTo = useCallback(
    (day: Date, behavior: ScrollBehavior) => {
      const node = scroller.current;
      if (!node) return;
      const index = Math.round(
        (day.getTime() - addDays(anchor, -DAYS_BEFORE).getTime()) / 86_400_000,
      );
      node.scrollTo({ left: Math.max(0, index * STRIDE), behavior });
    },
    [anchor],
  );

  // Open on today rather than on Monday: the display is read standing in the
  // kitchen on a Thursday, and the useful question is what happens tonight.
  useLayoutEffect(() => {
    scrollTo(new Date(), 'auto');
    setFirstVisible(new Date());
  }, [scrollTo]);

  const onScroll = () => {
    const node = scroller.current;
    if (!node) return;
    const index = Math.round(node.scrollLeft / STRIDE);
    const day = addDays(anchor, index - DAYS_BEFORE);
    setFirstVisible(day);

    // Follow the week into the store so the shopping list, which is built for
    // one week, is the week the plan is showing. Only on an actual change:
    // every scroll frame would otherwise refetch the bootstrap payload.
    const monday = mondayOf(day);
    if (isoDate(monday) !== isoDate(weekStart)) setWeekStart(monday);
  };

  const goToToday = () => {
    const now = new Date();
    // Re-anchor first when today has drifted off the end of the strip, which
    // happens to a display left running for a month.
    const offset = Math.round((now.getTime() - anchor.getTime()) / 86_400_000);
    if (offset < -DAYS_BEFORE || offset > DAYS_AFTER) setAnchor(mondayOf(now));
    setWeekStart(mondayOf(now));
    scrollTo(now, 'smooth');
    setFirstVisible(now);
  };

  useEffect(() => {
    if (!data) return;
    // A recipe opened and closed can leave the strip scrolled somewhere the
    // header no longer describes; recomputing on data changes is cheap.
    onScroll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (!data) return null;

  // The seven days from wherever the strip is parked, which is what the count
  // in the header is counting.
  const visibleWeek = Array.from({ length: 7 }, (_, index) => addDays(firstVisible, index));
  const plannedCount = data.plan.filter(
    (entry) =>
      entry.slot === 'dinner' && visibleWeek.some((day) => isoDate(day) === entry.day),
  ).length;

  const showingThisWeek = isoDate(mondayOf(firstVisible)) === isoDate(mondayOf(today));

  return (
    <div style={{ padding: '30px 0 24px', height: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 20,
          padding: '0 34px',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h1 className="display-title" style={{ fontSize: 36, color: '#FAF3E9', margin: 0 }}>
            Meal plan
          </h1>
          <div style={{ fontSize: 16, color: '#8E8073', marginTop: 4, whiteSpace: 'nowrap' }}>
            {weekRange(mondayOf(firstVisible))} · {plannedCount} of 7 dinners planned
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: '0 0 auto' }}>
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

          {/* The only navigation control left. It earns its place by being the
              one thing scrolling cannot do for you: get back. */}
          <button
            type="button"
            className="pressable"
            onClick={goToToday}
            aria-label="Scroll back to today"
            style={
              {
                height: 52,
                padding: '0 20px',
                borderRadius: 999,
                border: `1px solid ${showingThisWeek ? 'rgba(252,247,239,0.18)' : 'rgba(200,85,61,0.55)'}`,
                color: showingThisWeek ? '#BFB0A0' : '#E37A57',
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                fontSize: 16,
                fontWeight: 600,
                transition: 'color .2s, border-color .2s',
                '--bg-press': 'rgba(252,247,239,0.08)',
              } as React.CSSProperties
            }
          >
            <CalendarCheck size={20} strokeWidth={2} />
            Today
          </button>
        </div>
      </header>

      <div
        ref={scroller}
        onScroll={onScroll}
        className="scroll-none"
        style={{
          flex: 1,
          minHeight: 0,
          overflowX: 'auto',
          overflowY: 'hidden',
          display: 'flex',
          gap: DAY_GAP,
          // Snapping is what keeps a flick from parking half a Tuesday against
          // the edge of the screen.
          scrollSnapType: 'x mandatory',
          padding: '0 34px',
          scrollPaddingLeft: 34,
        }}
      >
        {days.map((day) => {
          const key = isoDate(day);
          const entry = entryFor(day);
          const recipe = recipeFor(day);
          const out = entry?.kind === 'out';
          const over = entry?.kind === 'leftovers';
          const isToday = isSameDay(day, today);
          const isTarget = assignDay === key;
          const batch = entry?.batch ?? 1;

          return (
            <div
              key={key}
              // The strip holds seven weeks of columns, so "the first empty
              // night" is no longer a way to mean "tonight". This is how a
              // specific day is addressed from outside — the e2e tests reach
              // for today's column through it.
              data-day={key}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                minHeight: 0,
                width: DAY_WIDTH,
                flex: `0 0 ${DAY_WIDTH}px`,
                scrollSnapAlign: 'start',
              }}
            >
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
                  {/* The month appears on the 1st, so a strip you have scrolled
                      a long way never leaves you guessing which month it is. */}
                  {day.getDate() === 1 ? monthDay(day) : dayNumber(day)}
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
                  background: recipe || out || over ? '#2A2420' : 'rgba(252,247,239,0.02)',
                  border:
                    recipe || out || over
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
                        height: 138,
                        flex: '0 0 138px',
                        background: categoryField(recipe.category),
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between',
                        gap: 8,
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
                      {batch > 1 && <BatchBadge batch={batch} />}
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
                      <div className="serif" style={{ fontSize: 21, lineHeight: 1.18, color: '#FAF3E9' }}>
                        {recipe.title}
                      </div>
                      <div className="mono" style={{ fontSize: 13, color: '#8E8073' }}>
                        {recipe.time_label}
                      </div>
                    </div>
                  </>
                )}

                {(out || over) && (
                  <>
                    <div
                      style={{
                        height: 138,
                        flex: '0 0 138px',
                        background: over ? LEFTOVERS_FIELD : OUT_FIELD,
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
                        {over ? 'Leftovers' : 'Eating out'}
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
                      <div className="serif" style={{ fontSize: 21, lineHeight: 1.18, color: '#FAF3E9' }}>
                        {over ? 'Leftovers' : (entry?.out_place ?? 'Eating out')}
                      </div>
                      <div className="mono" style={{ fontSize: 13, color: '#8E8073' }}>
                        no cooking
                      </div>
                    </div>
                  </>
                )}

                {!recipe && !out && !over && (
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

      <LunchStrip week={visibleWeek} onAssign={(day) => setAssignDay(mealKey(day, 'lunch'))} />

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

/** "×2" on a doubled night. Mono, because it is a number. */
export function BatchBadge({ batch, dark = false }: { batch: number; dark?: boolean }) {
  return (
    <span
      className="mono"
      style={{
        fontSize: 12,
        lineHeight: 1,
        padding: '5px 8px',
        borderRadius: 8,
        flex: '0 0 auto',
        background: dark ? 'rgba(200,85,61,0.18)' : 'rgba(20,17,15,0.34)',
        color: dark ? '#E37A57' : '#FFF8F2',
      }}
    >
      ×{batch}
    </span>
  );
}
