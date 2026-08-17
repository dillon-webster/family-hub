import { useEffect, useRef, useState } from 'react';
import { Pause, Play, Timer, X } from 'lucide-react';

/**
 * A kitchen timer, at the top of the recipe you are cooking.
 *
 * Two things make it a kitchen timer rather than a countdown widget. It keeps
 * an absolute deadline instead of decrementing a number, so a display that
 * throttles its timers while nobody is touching it still goes off at the right
 * moment. And it makes a noise: a timer on a wall you have your back to is
 * decoration.
 */

const PRESETS = [5, 10, 15, 20, 30, 45];

export function RecipeTimer() {
  const [open, setOpen] = useState(false);
  /** Wall-clock ms when it fires. Null when nothing is set. */
  const [deadline, setDeadline] = useState<number | null>(null);
  /** Remaining ms while paused. Null while running. */
  const [paused, setPaused] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [ringing, setRinging] = useState(false);

  const audio = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (deadline === null || paused !== null) return;

    const tick = () => {
      const left = deadline - Date.now();
      setRemaining(Math.max(0, left));
      if (left <= 0) {
        setDeadline(null);
        setRinging(true);
      }
    };

    tick();
    // Four times a second: the seconds digit never visibly sticks, and it
    // costs nothing next to what the display is already doing.
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [deadline, paused]);

  // The alarm. Built on the tap that started the timer, so the audio context is
  // created inside a gesture and is allowed to make sound later.
  useEffect(() => {
    if (!ringing) return;

    let cancelled = false;
    const context = audio.current;

    const beep = (at: number) => {
      if (!context || cancelled) return;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = 880;
      // A hard start and stop clicks; a short ramp is what makes it a chime.
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(0.25, at + 0.02);
      gain.gain.linearRampToValueAtTime(0, at + 0.35);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(at);
      oscillator.stop(at + 0.36);
    };

    const ring = () => {
      if (!context) return;
      const now = context.currentTime;
      [0, 0.45, 0.9].forEach((offset) => beep(now + offset));
    };

    ring();
    // Keeps going until someone comes back to it, which is the point.
    const id = window.setInterval(ring, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [ringing]);

  const start = (minutes: number) => {
    if (!audio.current) {
      const Ctor = window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctor) audio.current = new Ctor();
    }
    void audio.current?.resume();
    setDeadline(Date.now() + minutes * 60_000);
    setPaused(null);
    setRinging(false);
    setOpen(false);
  };

  const add = (minutes: number) => {
    if (paused !== null) setPaused(paused + minutes * 60_000);
    else if (deadline !== null) setDeadline(deadline + minutes * 60_000);
  };

  const pause = () => {
    if (deadline === null) return;
    setPaused(Math.max(0, deadline - Date.now()));
    setDeadline(null);
  };

  const resume = () => {
    if (paused === null) return;
    setDeadline(Date.now() + paused);
    setPaused(null);
  };

  const stop = () => {
    setDeadline(null);
    setPaused(null);
    setRinging(false);
    setRemaining(0);
    setOpen(false);
  };

  const running = deadline !== null;
  const shown = paused ?? remaining;

  if (ringing) {
    return (
      <button
        type="button"
        onClick={stop}
        style={{
          height: 56,
          padding: '0 22px',
          borderRadius: 999,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 17,
          fontWeight: 700,
          color: '#FFF8F2',
          background: '#C8553D',
          border: '1px solid rgba(255,248,242,0.45)',
          animation: 'fh-pulse 1s ease-in-out infinite',
        }}
      >
        <Timer size={20} strokeWidth={2.4} />
        Time's up
      </button>
    );
  }

  if (running || paused !== null) {
    return (
      <div
        style={{
          height: 56,
          padding: '0 8px 0 18px',
          borderRadius: 999,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          color: '#FFF8F2',
          background: 'rgba(20,17,15,0.42)',
          border: '1px solid rgba(255,248,242,0.30)',
        }}
      >
        <span className="mono" style={{ fontSize: 21, minWidth: 66, opacity: paused !== null ? 0.6 : 1 }}>
          {clock(shown)}
        </span>

        <PillButton onClick={() => add(1)} label="+1 min">
          <span className="mono" style={{ fontSize: 14 }}>
            +1
          </span>
        </PillButton>

        <PillButton onClick={paused !== null ? resume : pause} label={paused !== null ? 'Resume' : 'Pause'}>
          {paused !== null ? <Play size={17} strokeWidth={2.4} /> : <Pause size={17} strokeWidth={2.4} />}
        </PillButton>

        <PillButton onClick={stop} label="Stop the timer">
          <X size={17} strokeWidth={2.4} />
        </PillButton>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        className="pressable"
        onClick={() => setOpen((on) => !on)}
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
            '--bg': 'rgba(20,17,15,0.30)',
            '--bg-press': 'rgba(20,17,15,0.62)',
          } as React.CSSProperties
        }
      >
        <Timer size={19} strokeWidth={2} />
        Timer
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 64,
            // Opens rightward from the button, not leftward from it. Anchored
            // right, the row of presets reached back across the header and sat
            // on top of the recipe title.
            left: 0,
            zIndex: 5,
            background: '#241F1B',
            border: '1px solid rgba(252,247,239,0.14)',
            borderRadius: 18,
            padding: 14,
            display: 'flex',
            gap: 8,
            boxShadow: '0 18px 36px rgba(0,0,0,0.45)',
            animation: 'fh-rise .16s ease-out',
          }}
        >
          {PRESETS.map((minutes) => (
            <button
              key={minutes}
              type="button"
              className="pressable mono"
              onClick={() => start(minutes)}
              style={
                {
                  width: 62,
                  height: 54,
                  borderRadius: 12,
                  color: '#FAF3E9',
                  fontSize: 17,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '--bg': '#2E2823',
                  '--bg-press': '#C8553D',
                } as React.CSSProperties
              }
            >
              {minutes}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PillButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="pressable"
      aria-label={label}
      onClick={onClick}
      style={
        {
          width: 40,
          height: 40,
          borderRadius: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFF8F2',
          '--bg': 'rgba(255,248,242,0.12)',
          '--bg-press': 'rgba(255,248,242,0.26)',
        } as React.CSSProperties
      }
    >
      {children}
    </button>
  );
}

/** "12:05", counting whole seconds up rather than down mid-tick. */
function clock(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${`${seconds}`.padStart(2, '0')}`;
}
