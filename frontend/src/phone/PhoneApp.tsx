import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, CalendarDays, Check, ShoppingCart } from 'lucide-react';

import { useStore } from '../api/store';
import { ListScreen } from './ListScreen';
import { WeekScreen } from './WeekScreen';
import { CaptureScreen } from './CaptureScreen';

export type PhoneTab = 'list' | 'plan' | 'capture';

/**
 * The phone surface fills the device rather than drawing the prototype's
 * 393×852 frame — the mockup's rounded bezel and painted status bar were how
 * the design showed a phone on a desktop, not part of the product.
 */
export function PhoneApp() {
  const { data, loading, error } = useStore();
  const [tab, setTab] = useState<PhoneTab>('list');
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<number>(undefined);

  const flash = useCallback((message: string) => {
    window.clearTimeout(timer.current);
    setToast(message);
    timer.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  if (loading && !data) {
    return (
      <div
        className="surface-phone"
        style={{
          height: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          color: '#6F6357',
          fontSize: 17,
        }}
      >
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: 999,
            background: '#C8553D',
            animation: 'fh-pulse 1.1s ease-in-out infinite',
          }}
        />
        Catching up with the hub…
      </div>
    );
  }

  if (!data) {
    return (
      <div
        className="surface-phone"
        style={{
          height: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          padding: 30,
          textAlign: 'center',
        }}
      >
        <div className="serif" style={{ fontSize: 28 }}>
          Can't reach the hub
        </div>
        <div style={{ fontSize: 16, color: '#6F6357', lineHeight: 1.5 }}>
          {error ?? 'Check that you are on the tailnet.'}
        </div>
      </div>
    );
  }

  return (
    <div
      className="surface-phone"
      style={{ height: '100dvh', position: 'relative', overflow: 'hidden' }}
    >
      {tab === 'list' && <ListScreen flash={flash} />}
      {tab === 'plan' && <WeekScreen flash={flash} />}
      {tab === 'capture' && <CaptureScreen flash={flash} onDone={() => setTab('plan')} />}

      {toast && (
        <div
          style={{
            position: 'absolute',
            left: 20,
            right: 20,
            bottom: 'calc(112px + env(safe-area-inset-bottom))',
            zIndex: 30,
            background: '#2B2521',
            color: '#FCF7EF',
            borderRadius: 18,
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 12px 28px rgba(67,47,28,0.28)',
            animation: 'fh-rise .2s ease-out',
          }}
          role="status"
        >
          <span
            style={{
              width: 26,
              height: 26,
              flex: '0 0 26px',
              borderRadius: 999,
              background: '#6E8B57',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Check size={15} strokeWidth={3} color="#FBFCF7" />
          </span>
          <span style={{ fontSize: 16, fontWeight: 600 }}>{toast}</span>
        </div>
      )}

      {/* The cream gradient keeps content from colliding with the floating bar
          as it scrolls under it. */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 118,
          background: 'linear-gradient(180deg, rgba(252,247,239,0) 0%, #FCF7EF 55%)',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      />

      <nav
        style={{
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 'calc(20px + env(safe-area-inset-bottom))',
          height: 74,
          background: '#FFFDF9',
          border: '1px solid #E9DDCA',
          borderRadius: 26,
          zIndex: 11,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0 10px',
          boxShadow: '0 12px 28px rgba(67,47,28,0.14)',
        }}
      >
        <TabButton
          label="List"
          active={tab === 'list'}
          onClick={() => setTab('list')}
          icon={<ShoppingCart size={24} strokeWidth={2} />}
        />

        <button
          type="button"
          className="pressable"
          aria-label="Add a recipe"
          onClick={() => setTab('capture')}
          style={
            {
              width: 66,
              height: 66,
              borderRadius: 999,
              color: '#FFF8F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: -26,
              boxShadow: '0 10px 22px rgba(200,85,61,0.42)',
              '--bg': tab === 'capture' ? '#A23F29' : '#C8553D',
              '--bg-press': '#A23F29',
            } as React.CSSProperties
          }
        >
          <Camera size={28} strokeWidth={2} />
        </button>

        <TabButton
          label="Week"
          active={tab === 'plan'}
          onClick={() => setTab('plan')}
          icon={<CalendarDays size={24} strokeWidth={2} />}
        />
      </nav>
    </div>
  );
}

function TabButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      style={{
        width: 88,
        height: 60,
        borderRadius: 18,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        color: active ? '#C8553D' : '#9C8E7E',
        transition: 'color .15s',
      }}
    >
      {icon}
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.03em' }}>{label}</span>
    </button>
  );
}
