import { useState } from 'react';
import { BookOpen, CalendarDays, Clock, House, ListChecks } from 'lucide-react';

import { useStore } from '../api/store';
import { BrandMark } from '../components/BrandMark';
import { HomeScreen } from './screens/HomeScreen';
import { MealsScreen } from './screens/MealsScreen';
import { RecipesScreen } from './screens/RecipesScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { TasksScreen } from './screens/TasksScreen';

export type HubScreen = 'home' | 'plan' | 'recipes' | 'cal' | 'tasks';

const NAV = [
  { key: 'home', label: 'Home', Icon: House },
  { key: 'plan', label: 'Meals', Icon: CalendarDays },
  { key: 'recipes', label: 'Recipes', Icon: BookOpen },
  { key: 'cal', label: 'Calendar', Icon: Clock },
  { key: 'tasks', label: 'Tasks', Icon: ListChecks },
] as const;

export function HubApp() {
  const { data, loading, error, connected } = useStore();
  const [screen, setScreen] = useState<HubScreen>('home');
  /** Set when Home sends you to Meals to fill a specific empty night. */
  const [assignDay, setAssignDay] = useState<string | null>(null);
  /** Set when a card sends you to Recipes with one already open. */
  const [openRecipe, setOpenRecipe] = useState<string | null>(null);

  const go = (next: HubScreen) => {
    setScreen(next);
    if (next !== 'plan') setAssignDay(null);
    if (next !== 'recipes') setOpenRecipe(null);
  };

  if (loading && !data) {
    return (
      <div
        className="surface-hub"
        style={{
          height: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          color: '#8E8073',
          fontSize: 18,
        }}
      >
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: 999,
            background: '#E37A57',
            animation: 'fh-pulse 1.1s ease-in-out infinite',
          }}
        />
        Waking the hub up…
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className="surface-hub"
        style={{
          height: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: 40,
          textAlign: 'center',
        }}
      >
        <div className="serif" style={{ fontSize: 32, color: '#FAF3E9' }}>
          The hub is not answering
        </div>
        <div style={{ fontSize: 17, color: '#BFB0A0', maxWidth: 420, lineHeight: 1.5 }}>
          {error ?? 'It will keep trying on its own.'}
        </div>
      </div>
    );
  }

  return (
    <div
      className="surface-hub"
      style={{
        height: '100dvh',
        display: 'flex',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <nav
        style={{
          width: 104,
          flex: '0 0 104px',
          background: '#171412',
          borderRight: '1px solid rgba(252,247,239,0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '18px 0 max(20px, env(safe-area-inset-bottom))',
          gap: 6,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: '#C8553D',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 14,
          }}
        >
          <BrandMark />
        </div>

        {NAV.map(({ key, label, Icon }) => {
          const active = screen === key;
          return (
            <button
              key={key}
              type="button"
              className="pressable"
              onClick={() => go(key)}
              aria-current={active ? 'page' : undefined}
              style={
                {
                  width: 84,
                  height: 74,
                  borderRadius: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  color: active ? '#E37A57' : '#8E8073',
                  '--bg': active ? 'rgba(200,85,61,0.20)' : 'transparent',
                  '--bg-press': 'rgba(200,85,61,0.30)',
                } as React.CSSProperties
              }
            >
              <Icon size={26} strokeWidth={2} />
              <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.03em' }}>
                {label}
              </span>
            </button>
          );
        })}

        <div style={{ flex: 1 }} />

        {/* Household avatars, and the one place the live link is visible: a
            dimmed row means the display is showing what it last knew. */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            opacity: connected ? 1 : 0.4,
            transition: 'opacity .3s',
          }}
          title={connected ? 'Live' : 'Reconnecting…'}
        >
          {data.members.slice(0, 3).map((member) => (
            <div
              key={member.id}
              style={{
                width: 26,
                height: 26,
                borderRadius: 999,
                background: member.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                color: '#FFF8F2',
              }}
            >
              {member.initial}
            </div>
          ))}
        </div>
      </nav>

      <main style={{ flex: 1, position: 'relative', overflow: 'hidden', minWidth: 0 }}>
        {screen === 'home' && (
          <HomeScreen
            onGo={go}
            onPlanDay={(day) => {
              setAssignDay(day);
              setScreen('plan');
            }}
            onOpenRecipe={(id) => {
              setOpenRecipe(id);
              setScreen('recipes');
            }}
          />
        )}
        {screen === 'plan' && (
          <MealsScreen
            assignDay={assignDay}
            setAssignDay={setAssignDay}
            onOpenRecipe={(id) => {
              setOpenRecipe(id);
              setScreen('recipes');
            }}
          />
        )}
        {screen === 'recipes' && (
          <RecipesScreen openRecipe={openRecipe} setOpenRecipe={setOpenRecipe} />
        )}
        {screen === 'cal' && <CalendarScreen />}
        {screen === 'tasks' && <TasksScreen />}
      </main>
    </div>
  );
}
