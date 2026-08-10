import { useState } from 'react';
import { Delete } from 'lucide-react';

const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

/**
 * The hub types with its own keyboard rather than the iPad's.
 *
 * The display is a fixed, full-screen kiosk layout; the system keyboard would
 * slide over the sheet and resize the viewport underneath it. This one is part
 * of the sheet, sized for a hand reaching up to a wall.
 */
export function HubKeyboard({
  aisle,
  onCancel,
  onSubmit,
}: {
  aisle: string;
  onCancel: () => void;
  onSubmit: (value: string) => void;
}) {
  const [draft, setDraft] = useState('');

  const type = (char: string) => setDraft((current) => (current + char).slice(0, 40));
  const erase = () => setDraft((current) => current.slice(0, -1));

  const submit = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setDraft('');
  };

  const key = (
    label: string,
    onPress: () => void,
    extra?: React.CSSProperties,
    pressBg = '#C8553D',
  ) => (
    <button
      key={label}
      type="button"
      className="pressable"
      onClick={onPress}
      style={
        {
          width: 62,
          height: 58,
          borderRadius: 12,
          color: '#FAF3E9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          fontWeight: 600,
          '--bg': '#2E2823',
          '--bg-press': pressBg,
          ...extra,
        } as React.CSSProperties
      }
    >
      {label}
    </button>
  );

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 40,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
      }}
      onClick={onCancel}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: 720,
          maxWidth: '100%',
          background: '#1C1815',
          borderTop: '1px solid rgba(252,247,239,0.14)',
          borderLeft: '1px solid rgba(252,247,239,0.12)',
          padding: '18px 20px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          boxShadow: '0 -20px 40px rgba(0,0,0,0.45)',
          animation: 'fh-sheet-up .2s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              flex: 1,
              minHeight: 62,
              background: '#241F1B',
              border: '1px solid rgba(252,247,239,0.18)',
              borderRadius: 14,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <span style={{ fontSize: 20, color: draft ? '#FAF3E9' : '#8E8073' }}>
              {draft || 'Type an item'}
            </span>
            <span
              style={{
                width: 2,
                height: 24,
                background: '#E37A57',
                animation: 'fh-pulse 1.1s ease-in-out infinite',
              }}
            />
          </div>
          <button
            type="button"
            className="pressable"
            onClick={onCancel}
            style={
              {
                height: 62,
                padding: '0 22px',
                borderRadius: 14,
                border: '1px solid rgba(252,247,239,0.18)',
                color: '#BFB0A0',
                display: 'flex',
                alignItems: 'center',
                fontSize: 17,
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
            onClick={submit}
            style={
              {
                height: 62,
                padding: '0 28px',
                borderRadius: 14,
                color: '#FFF8F2',
                display: 'flex',
                alignItems: 'center',
                fontSize: 17,
                fontWeight: 600,
                opacity: draft.trim() ? 1 : 0.5,
                '--bg': '#C8553D',
                '--bg-press': '#A23F29',
              } as React.CSSProperties
            }
          >
            Add
          </button>
        </div>

        <div className="overline">Adding to {aisle}</div>

        {ROWS.map((row) => (
          <div key={row} style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {row.split('').map((char) => key(char, () => type(char)))}
          </div>
        ))}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button
            type="button"
            className="pressable"
            onClick={() => type(' ')}
            style={
              {
                flex: 1,
                height: 58,
                borderRadius: 12,
                color: '#BFB0A0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 17,
                fontWeight: 600,
                '--bg': '#2E2823',
                '--bg-press': '#3A322C',
              } as React.CSSProperties
            }
          >
            space
          </button>
          <button
            type="button"
            className="pressable"
            aria-label="Backspace"
            onClick={erase}
            style={
              {
                width: 120,
                height: 58,
                borderRadius: 12,
                color: '#BFB0A0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '--bg': '#2E2823',
                '--bg-press': '#3A322C',
              } as React.CSSProperties
            }
          >
            <Delete size={22} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
