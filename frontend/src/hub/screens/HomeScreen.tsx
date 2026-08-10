import { useStore } from '../../api/store';
import { CATEGORY_COLOR, CATEGORY_FIELD, OUT_COLOR, OUT_FIELD } from '../../design/category';
import {
  addDays,
  clockTime,
  dayShort,
  eventTime,
  fullDay,
  greeting,
  isSameDay,
  isoDate,
  meridiem,
  monthDay,
  thingsOnToday,
} from '../../lib/week';
import type { HubScreen } from '../HubApp';

interface Props {
  onGo: (screen: HubScreen) => void;
  onPlanDay: (day: string) => void;
  onOpenRecipe: (id: string) => void;
}

export function HomeScreen({ onGo, onPlanDay, onOpenRecipe }: Props) {
  const { data, now, entryFor, recipeFor } = useStore();
  if (!data) return null;

  const today = new Date();
  const todayEntry = entryFor(today);
  const tonight = recipeFor(today);
  const eatingOut = todayEntry?.kind === 'out';

  const members = new Map(data.members.map((m) => [m.id, m]));
  const todaysEvents = data.events
    .filter((event) => isSameDay(new Date(event.starts_at), today))
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));

  const openTasks = data.tasks.filter((task) => !task.done).length;

  // "The rest of the week" is the four days after today, wrapping into next
  // week near the weekend so the panel is never mostly empty.
  const upcoming = Array.from({ length: 4 }, (_, index) => addDays(today, index + 1));

  const field = tonight
    ? CATEGORY_FIELD[tonight.category]
    : eatingOut
      ? OUT_FIELD
      : 'linear-gradient(160deg, #3A3129 0%, #241F1B 100%)';

  return (
    <div
      style={{
        padding: '30px 34px 26px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 22,
      }}
    >
      {/* ---- header ---- */}
      <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
        <div style={{ minWidth: 0 }}>
          <h1
            className="display-title"
            style={{ fontSize: 38, color: '#FAF3E9', margin: 0 }}
          >
            {/* No name: the wall display is shared, and it has no idea who is
                standing in front of it. Greeting one member by name is a
                deliberate departure from the handoff's "Good evening, Maya". */}
            {greeting(now)}
          </h1>
          <div style={{ fontSize: 17, color: '#BFB0A0', marginTop: 4 }}>
            {fullDay(now)} · {thingsOnToday(todaysEvents.length)}
          </div>
        </div>

        <div style={{ textAlign: 'right', lineHeight: 1, flex: '0 0 auto' }}>
          <div
            className="mono"
            style={{
              fontSize: 66,
              fontWeight: 500,
              letterSpacing: '-0.03em',
              color: '#FAF3E9',
            }}
          >
            {clockTime(now)}
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              color: '#8E8073',
              marginTop: 6,
            }}
          >
            {meridiem(now)}
          </div>
        </div>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 386px',
          gap: 22,
          flex: 1,
          minHeight: 0,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, minHeight: 0 }}>
          {/* ---- tonight ---- */}
          <section
            style={{
              display: 'flex',
              background: '#2A2420',
              border: '1px solid rgba(252,247,239,0.09)',
              borderRadius: 24,
              overflow: 'hidden',
              flex: '0 0 268px',
              boxShadow: '0 12px 28px rgba(0,0,0,0.28)',
            }}
          >
            <div
              style={{
                width: 214,
                flex: '0 0 214px',
                background: field,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: 20,
              }}
            >
              <div className="overline" style={{ color: 'rgba(255,248,242,0.78)' }}>
                {tonight ? tonight.category : eatingOut ? 'Eating out' : 'Dinner'}
              </div>
              {tonight && (
                <div className="mono" style={{ fontSize: 15, color: '#FFF8F2', marginTop: 6 }}>
                  {[tonight.time_label, tonight.serves_label].filter(Boolean).join(' · ')}
                </div>
              )}
            </div>

            <div
              style={{
                flex: 1,
                padding: '24px 26px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minWidth: 0,
              }}
            >
              <div>
                <div className="overline">Tonight</div>
                <div
                  className="display-title"
                  style={{ fontSize: 44, color: '#FAF3E9', marginTop: 10 }}
                >
                  {tonight
                    ? tonight.title
                    : eatingOut
                      ? (todayEntry?.out_place ?? 'Eating out')
                      : 'Nothing planned yet'}
                </div>
                <div style={{ fontSize: 17, color: '#BFB0A0', marginTop: 8 }}>
                  {tonight
                    ? tonight.blurb
                    : eatingOut
                      ? 'Nothing to cook and nothing on the shopping list.'
                      : 'Pick something from the library and it will show up here.'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                {tonight ? (
                  <button
                    type="button"
                    className="pressable"
                    onClick={() => onOpenRecipe(tonight.id)}
                    style={
                      {
                        height: 52,
                        padding: '0 26px',
                        borderRadius: 14,
                        color: '#FFF8F2',
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: 17,
                        fontWeight: 600,
                        '--bg': '#C8553D',
                        '--bg-press': '#A23F29',
                      } as React.CSSProperties
                    }
                  >
                    Start cooking
                  </button>
                ) : (
                  <button
                    type="button"
                    className="pressable"
                    onClick={() => onPlanDay(isoDate(today))}
                    style={
                      {
                        height: 52,
                        padding: '0 26px',
                        borderRadius: 14,
                        color: '#FFF8F2',
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: 17,
                        fontWeight: 600,
                        '--bg': '#C8553D',
                        '--bg-press': '#A23F29',
                      } as React.CSSProperties
                    }
                  >
                    Plan tonight
                  </button>
                )}
                <button
                  type="button"
                  className="pressable"
                  onClick={() => onGo('plan')}
                  style={
                    {
                      height: 52,
                      padding: '0 22px',
                      borderRadius: 14,
                      border: '1px solid rgba(252,247,239,0.20)',
                      color: '#FAF3E9',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: 17,
                      fontWeight: 600,
                      '--bg': 'transparent',
                      '--bg-press': 'rgba(252,247,239,0.10)',
                    } as React.CSSProperties
                  }
                >
                  See the week
                </button>
              </div>
            </div>
          </section>

          {/* ---- rest of the week ---- */}
          <section style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="overline">Rest of the week</div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: 12,
                flex: 1,
                minHeight: 0,
              }}
            >
              {upcoming.map((day) => {
                const recipe = recipeFor(day);
                const entry = entryFor(day);
                const out = entry?.kind === 'out';
                const planned = Boolean(recipe || out);

                return (
                  <button
                    key={isoDate(day)}
                    type="button"
                    className="pressable"
                    onClick={() =>
                      recipe ? onOpenRecipe(recipe.id) : onPlanDay(isoDate(day))
                    }
                    style={
                      {
                        border: '1px solid rgba(252,247,239,0.09)',
                        borderRadius: 18,
                        padding: '14px 14px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                        minHeight: 0,
                        '--bg': '#2A2420',
                        '--bg-press': '#342C27',
                      } as React.CSSProperties
                    }
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="overline">{dayShort(day)}</span>
                      <span className="mono" style={{ fontSize: 13, color: '#8E8073' }}>
                        {monthDay(day)}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        borderRadius: 3,
                        background: recipe
                          ? CATEGORY_COLOR[recipe.category]
                          : out
                            ? OUT_COLOR
                            : 'rgba(252,247,239,0.14)',
                      }}
                    />
                    <div
                      className="serif"
                      style={{
                        fontSize: 19,
                        lineHeight: 1.2,
                        color: planned ? '#FAF3E9' : '#8E8073',
                      }}
                    >
                      {recipe
                        ? recipe.title
                        : out
                          ? (entry?.out_place ?? 'Eating out')
                          : 'Nothing planned yet'}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* ---- today panel ---- */}
        <aside
          style={{
            background: '#2A2420',
            border: '1px solid rgba(252,247,239,0.09)',
            borderRadius: 24,
            padding: 22,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            minHeight: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <h2 className="serif" style={{ fontSize: 26, color: '#FAF3E9', margin: 0 }}>
              Today
            </h2>
            <button
              type="button"
              onClick={() => onGo('cal')}
              style={{ fontSize: 15, fontWeight: 600, color: '#E37A57', padding: '8px 4px' }}
            >
              Week ›
            </button>
          </div>

          <div
            className="scroll-none"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
            }}
          >
            {todaysEvents.length === 0 && (
              <div style={{ fontSize: 16, color: '#8E8073', padding: '10px 2px', lineHeight: 1.5 }}>
                Nothing on the calendar today.
              </div>
            )}
            {todaysEvents.map((event) => {
              const owner = event.member_id ? members.get(event.member_id) : undefined;
              return (
                <div
                  key={event.id}
                  style={{
                    display: 'flex',
                    gap: 14,
                    alignItems: 'center',
                    background: '#332C27',
                    borderRadius: 14,
                    padding: '14px 16px',
                    minHeight: 64,
                    flex: '0 0 auto',
                  }}
                >
                  <div
                    style={{
                      width: 4,
                      alignSelf: 'stretch',
                      borderRadius: 2,
                      background: owner?.color ?? '#8E8073',
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 18, fontWeight: 600, color: '#FAF3E9', lineHeight: 1.25 }}>
                      {event.title}
                    </div>
                    {owner && (
                      <div style={{ fontSize: 14, color: '#8E8073', marginTop: 2 }}>{owner.name}</div>
                    )}
                  </div>
                  <div className="mono" style={{ fontSize: 16, color: '#BFB0A0', whiteSpace: 'nowrap' }}>
                    {event.all_day ? 'All day' : eventTime(new Date(event.starts_at))}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className="pressable"
            onClick={() => onGo('tasks')}
            style={
              {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: 14,
                padding: '16px 18px',
                minHeight: 56,
                '--bg': '#3A3129',
                '--bg-press': '#463B31',
              } as React.CSSProperties
            }
          >
            <span style={{ fontSize: 16, fontWeight: 600, color: '#FAF3E9' }}>
              {openTasks === 0
                ? 'Nothing left on the board'
                : `${openTasks} household task${openTasks === 1 ? '' : 's'} open`}
            </span>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#E3A85C' }}>Board ›</span>
          </button>
        </aside>
      </div>
    </div>
  );
}
