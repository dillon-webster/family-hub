import { useState } from 'react';
import { Link2, PencilLine, ScanLine } from 'lucide-react';

import { api } from '../../api/client';
import { useStore } from '../../api/store';
import type { Category, ImportPreview } from '../../api/types';
import { CATEGORY_FIELD } from '../../design/category';
import { CameraFrame } from '../../components/CameraFrame';
import { ManualRecipeForm } from '../../components/ManualRecipeForm';
import { CloseButton } from './AssignPanel';
import { Sheet } from './Sheet';

type Mode = 'menu' | 'link' | 'scan' | 'manual';

const TITLES: Record<Mode, string> = {
  menu: 'Where from?',
  link: 'From a link',
  scan: 'Scan a page',
  manual: 'Type it in',
};

export function AddRecipeSheet({ onClose }: { onClose: () => void }) {
  const { data, refresh } = useStore();
  const [mode, setMode] = useState<Mode>('menu');
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [found, setFound] = useState<ImportPreview | null>(null);

  const scanningEnabled = data?.scanning_enabled ?? false;

  const reset = (next: Mode) => {
    setMode(next);
    setFound(null);
    setError(null);
  };

  const readLink = async () => {
    if (!url.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      setFound(await api.importLink(url.trim()));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read that link.');
    } finally {
      setBusy(false);
    }
  };

  const readImage = async (dataUrl: string) => {
    setBusy(true);
    setError(null);
    try {
      // The wall display captures one page at a time; multi-page scanning is a
      // phone job, where you can turn the card over in your hand.
      setFound(await api.importScan([dataUrl]));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read that photo.');
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!found || busy) return;
    setBusy(true);
    try {
      const { method, ...draft } = found;
      await api.saveRecipe(draft, method === 'scan' ? 'scan' : 'link');
      await refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that recipe.');
      setBusy(false);
    }
  };

  return (
    <Sheet width={470} onClose={onClose}>
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div className="overline">Add recipe</div>
          <div className="serif" style={{ fontSize: 30, color: '#FAF3E9', marginTop: 6 }}>
            {TITLES[mode]}
          </div>
        </div>
        <CloseButton onClose={onClose} />
      </header>

      {mode === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 17, lineHeight: 1.5, color: '#BFB0A0', margin: 0 }}>
            Pull one in from anywhere — the hub keeps it with the rest of your library.
          </p>
          <Route
            icon={<Link2 size={26} strokeWidth={2} />}
            tint="rgba(200,85,61,0.20)"
            color="#E37A57"
            title="Paste a link"
            sub="From a blog or recipe site"
            onClick={() => reset('link')}
          />
          <Route
            icon={<ScanLine size={26} strokeWidth={2} />}
            tint="rgba(110,139,87,0.22)"
            color="#93B278"
            title="Scan a cookbook page"
            sub={scanningEnabled ? 'Uses the iPad camera' : 'Needs an API key on the hub'}
            disabled={!scanningEnabled}
            onClick={() => reset('scan')}
          />
          <Route
            icon={<PencilLine size={26} strokeWidth={2} />}
            tint="rgba(217,150,43,0.20)"
            color="#E3A85C"
            title="Type it in"
            sub="Family recipes, index cards"
            onClick={() => reset('manual')}
          />
        </div>
      )}

      {mode === 'link' && !found && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, minHeight: 0 }}>
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && readLink()}
            placeholder="https://…"
            inputMode="url"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="mono"
            style={{
              background: '#1C1815',
              border: '1px solid rgba(252,247,239,0.14)',
              borderRadius: 14,
              padding: '16px 18px',
              minHeight: 60,
              fontSize: 15,
              color: '#FAF3E9',
              outline: 'none',
            }}
          />
          {busy ? (
            <Pulse label="Reading the page…" />
          ) : (
            <button
              type="button"
              className="pressable"
              onClick={readLink}
              style={
                {
                  height: 60,
                  borderRadius: 16,
                  color: '#FFF8F2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  fontWeight: 600,
                  opacity: url.trim() ? 1 : 0.5,
                  '--bg': '#C8553D',
                  '--bg-press': '#A23F29',
                } as React.CSSProperties
              }
            >
              Read this page
            </button>
          )}
        </div>
      )}

      {mode === 'scan' && !found && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, minHeight: 0 }}>
          {busy ? (
            <Pulse label="Reading the page…" />
          ) : (
            <CameraFrame height={300} onCapture={readImage} />
          )}
        </div>
      )}

      {mode === 'manual' && (
        <ManualRecipeForm
          onSaved={async () => {
            await refresh();
            onClose();
          }}
        />
      )}

      {found && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, minHeight: 0 }}>
          <div className="overline" style={{ color: '#93B278' }}>
            {found.method === 'structured' ? 'Recipe found' : 'Recipe read'}
          </div>
          <div className="scroll-none" style={{ background: '#2E2823', borderRadius: 20, overflow: 'hidden', flex: '0 0 auto' }}>
            <div style={{ height: 110, background: CATEGORY_FIELD[found.category] }} />
            <div style={{ padding: 18 }}>
              <div className="serif" style={{ fontSize: 26, color: '#FAF3E9', lineHeight: 1.15 }}>
                {found.title}
              </div>
              <div className="mono" style={{ fontSize: 14, color: '#8E8073', marginTop: 8 }}>
                {[
                  found.time_label,
                  found.serves_label,
                  `${found.ingredients.length} ingredient${found.ingredients.length === 1 ? '' : 's'}`,
                  `${found.steps.length} step${found.steps.length === 1 ? '' : 's'}`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </div>
            </div>
          </div>

          <div
            className="scroll-none"
            style={{ flex: 1, minHeight: 0, overflowY: 'auto', fontSize: 15, color: '#BFB0A0', lineHeight: 1.5 }}
          >
            {found.ingredients.map((ingredient, index) => (
              <div key={index} style={{ display: 'flex', gap: 10, padding: '3px 0' }}>
                <span className="mono" style={{ color: '#E37A57', minWidth: 80, flex: '0 0 80px' }}>
                  {ingredient.qty}
                </span>
                <span>{ingredient.name}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="pressable"
            onClick={save}
            style={
              {
                height: 60,
                borderRadius: 16,
                color: '#FFF8F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                fontWeight: 600,
                flex: '0 0 auto',
                '--bg': '#C8553D',
                '--bg-press': '#A23F29',
              } as React.CSSProperties
            }
          >
            Save to library
          </button>
        </div>
      )}

      {error && (
        <div style={{ fontSize: 15, color: '#E37A57', lineHeight: 1.5, flex: '0 0 auto' }}>{error}</div>
      )}

      <div style={{ flex: 1 }} />

      {mode !== 'menu' && (
        <button
          type="button"
          className="pressable"
          onClick={() => reset('menu')}
          style={
            {
              height: 56,
              borderRadius: 16,
              border: '1px solid rgba(252,247,239,0.18)',
              color: '#BFB0A0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 17,
              fontWeight: 600,
              flex: '0 0 auto',
              '--bg-press': 'rgba(252,247,239,0.06)',
            } as React.CSSProperties
          }
        >
          Back
        </button>
      )}
    </Sheet>
  );
}

function Route({
  icon,
  tint,
  color,
  title,
  sub,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  tint: string;
  color: string;
  title: string;
  sub: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className="pressable"
      onClick={onClick}
      disabled={disabled}
      style={
        {
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          borderRadius: 18,
          padding: 18,
          minHeight: 88,
          opacity: disabled ? 0.45 : 1,
          cursor: disabled ? 'default' : 'pointer',
          '--bg': '#2E2823',
          '--bg-press': disabled ? '#2E2823' : '#3A322C',
        } as React.CSSProperties
      }
    >
      <span
        style={{
          width: 52,
          height: 52,
          flex: '0 0 52px',
          borderRadius: 14,
          background: tint,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
        }}
      >
        {icon}
      </span>
      <span style={{ flex: 1, textAlign: 'left' }}>
        <span style={{ display: 'block', fontSize: 20, fontWeight: 600, color: '#FAF3E9' }}>{title}</span>
        <span style={{ display: 'block', fontSize: 15, color: '#8E8073', marginTop: 3 }}>{sub}</span>
      </span>
      <span style={{ color: '#8E8073', fontSize: 22 }}>›</span>
    </button>
  );
}

export function Pulse({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#8E8073', fontSize: 17 }}>
      <span
        style={{
          width: 14,
          height: 14,
          borderRadius: 999,
          background: '#E37A57',
          animation: 'fh-pulse 1.1s ease-in-out infinite',
        }}
      />
      {label}
    </div>
  );
}

export type { Category };
