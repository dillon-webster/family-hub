import { useEffect, type ReactNode } from 'react';

/**
 * A right-hand sheet over the content area, with a scrim.
 *
 * Tapping the scrim closes it, which is what a hand reaching past the panel
 * expects; Escape does too, for anyone who has a keyboard attached.
 */
export function Sheet({
  width,
  onClose,
  children,
}: {
  width: number;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(12,10,9,0.55)',
        display: 'flex',
        justifyContent: 'flex-end',
        zIndex: 30,
        animation: 'fh-fade .15s ease-out',
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
        style={{
          width,
          maxWidth: '100%',
          height: '100%',
          background: '#241F1B',
          borderLeft: '1px solid rgba(252,247,239,0.12)',
          padding: '26px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          boxShadow: '-24px 0 48px rgba(0,0,0,0.35)',
          animation: 'fh-sheet-in .22s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
