import { useState } from 'react';
import { Delete } from 'lucide-react';

const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

/**
 * The shop keyboard.
 *
 * A real keyboard would work, but iOS resizes the viewport when it opens and
 * the floating tab bar jumps with it. This one is part of the sheet, so the
 * list stays put while you add to it — which is what you want with one hand on
 * a trolley.
 */
export function PhoneKeyboard({
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

  const submit = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setDraft('');
  };

  const cap = (value: string) => ({
    width: 33,
    height: 46,
    borderRadius: 7,
    color: '#2B2521',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 19,
    fontWeight: 500,
    boxShadow: '0 1px 2px rgba(67,47,28,0.18)',
    '--bg': '#FFFDF9',
    '--bg-press': '#DBCBB1',
    ...(value ? {} : {}),
  }) as React.CSSProperties;

  return (
    <>
      <div
        onClick={onCancel}
        style={{ position: 'absolute', inset: 0, background: 'rgba(43,37,33,0.35)', zIndex: 40 }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 41,
          background: '#EFE3D0',
          borderRadius: '24px 24px 0 0',
          padding: '14px 8px calc(22px + env(safe-area-inset-bottom))',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          boxShadow: '0 -12px 28px rgba(67,47,28,0.22)',
          animation: 'fh-sheet-up .2s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px' }}>
          <div
            style={{
              flex: 1,
              minHeight: 52,
              background: '#FFFDF9',
              border: '1px solid #DBCBB1',
              borderRadius: 14,
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              minWidth: 0,
            }}
          >
            <span
              style={{
                fontSize: 17,
                color: draft ? '#2B2521' : '#9C8E7E',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {draft || 'Type an item'}
            </span>
            <span
              style={{
                width: 2,
                height: 20,
                background: '#C8553D',
                animation: 'fh-pulse 1.1s ease-in-out infinite',
                flex: '0 0 2px',
              }}
            />
          </div>
          <button
            type="button"
            className="pressable"
            onClick={submit}
            style={
              {
                height: 52,
                padding: '0 20px',
                borderRadius: 14,
                color: '#FFF8F2',
                display: 'flex',
                alignItems: 'center',
                fontSize: 16,
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

        <div
          className="overline"
          style={{ fontSize: 11, padding: '0 10px 2px', color: '#9C8E7E' }}
        >
          Adding to {aisle}
        </div>

        {ROWS.map((row) => (
          <div key={row} style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
            {row.split('').map((char) => (
              <button
                key={char}
                type="button"
                className="pressable"
                onClick={() => type(char)}
                style={cap(char)}
              >
                {char}
              </button>
            ))}
          </div>
        ))}

        <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
          <button
            type="button"
            className="pressable"
            onClick={onCancel}
            style={
              {
                width: 76,
                height: 46,
                borderRadius: 7,
                color: '#6F6357',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 600,
                '--bg': '#DBCBB1',
                '--bg-press': '#CBB89A',
              } as React.CSSProperties
            }
          >
            Cancel
          </button>
          <button
            type="button"
            className="pressable"
            onClick={() => type(' ')}
            style={
              {
                flex: 1,
                height: 46,
                borderRadius: 7,
                color: '#6F6357',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 15,
                fontWeight: 600,
                boxShadow: '0 1px 2px rgba(67,47,28,0.18)',
                '--bg': '#FFFDF9',
                '--bg-press': '#DBCBB1',
              } as React.CSSProperties
            }
          >
            space
          </button>
          <button
            type="button"
            className="pressable"
            aria-label="Backspace"
            onClick={() => setDraft((current) => current.slice(0, -1))}
            style={
              {
                width: 76,
                height: 46,
                borderRadius: 7,
                color: '#6F6357',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '--bg': '#DBCBB1',
                '--bg-press': '#CBB89A',
              } as React.CSSProperties
            }
          >
            <Delete size={19} strokeWidth={2} />
          </button>
        </div>
      </div>
    </>
  );
}
