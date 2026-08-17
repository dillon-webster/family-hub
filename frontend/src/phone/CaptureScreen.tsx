import { useState } from 'react';
import { ChevronLeft, Link2, PencilLine } from 'lucide-react';

import { api } from '../api/client';
import { useStore } from '../api/store';
import type { ImportPreview } from '../api/types';
import { CameraFrame } from '../components/CameraFrame';
import { ManualRecipeForm } from '../components/ManualRecipeForm';

/** Mirrors MAX_PAGES on the server, which rejects more. */
const MAX_PAGES = 4;

type Mode = 'camera' | 'link' | 'manual';

export function CaptureScreen({
  flash,
  onDone,
}: {
  flash: (message: string) => void;
  onDone: () => void;
}) {
  const { refresh, data, categoryField } = useStore();
  const [mode, setMode] = useState<Mode>('camera');
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [found, setFound] = useState<ImportPreview | null>(null);
  /** Photos taken so far, in reading order. One recipe, however many pages. */
  const [pages, setPages] = useState<string[]>([]);

  const scanningEnabled = data?.scanning_enabled ?? false;

  const read = async (run: () => Promise<ImportPreview>) => {
    setBusy(true);
    setError(null);
    try {
      setFound(await run());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read that.');
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!found) return;
    setBusy(true);
    try {
      const { method, ...draft } = found;
      await api.saveRecipe(draft, method === 'scan' ? 'scan' : 'link');
      await refresh();
      flash('Saved to the hub');
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that recipe.');
      setBusy(false);
    }
  };

  const pad = 'calc(14px + env(safe-area-inset-top)) 20px 170px';

  if (busy && !found) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: 30,
        }}
      >
        <span
          style={{
            width: 16,
            height: 16,
            borderRadius: 999,
            background: '#C8553D',
            animation: 'fh-pulse 1.1s ease-in-out infinite',
          }}
        />
        <div style={{ fontSize: 18, color: '#6F6357' }}>Reading the page…</div>
      </div>
    );
  }

  if (found) {
    return (
      <div
        className="scroll-none"
        style={{
          position: 'absolute',
          inset: 0,
          overflowY: 'auto',
          padding: pad,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <button
          type="button"
          className="pressable"
          aria-label="Back"
          onClick={() => {
            setFound(null);
            setError(null);
            setPages([]);
          }}
          style={
            {
              width: 48,
              height: 48,
              borderRadius: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6F6357',
              flex: '0 0 auto',
              '--bg': '#F6EDDE',
              '--bg-press': '#EFE3D0',
            } as React.CSSProperties
          }
        >
          <ChevronLeft size={22} strokeWidth={2} />
        </button>

        <div className="overline" style={{ color: '#3F7D4F', marginTop: 14 }}>
          {found.method === 'structured' ? 'Recipe found' : 'Recipe read'}
        </div>

        <div
          style={{
            background: '#FFFDF9',
            border: '1px solid #E9DDCA',
            borderRadius: 22,
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(67,47,28,0.10)',
            marginTop: 16,
          }}
        >
          <div
            style={{
              height: 120,
              background: categoryField(found.category),
              display: 'flex',
              alignItems: 'flex-end',
              padding: 14,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'rgba(255,248,242,0.88)',
              }}
            >
              {found.category}
            </span>
          </div>
          <div style={{ padding: 18 }}>
            <div className="serif" style={{ fontSize: 26, lineHeight: 1.15 }}>
              {found.title}
            </div>
            <div className="mono" style={{ fontSize: 14, color: '#9C8E7E', marginTop: 8 }}>
              {[
                found.time_label,
                found.serves_label,
                `${found.ingredients.length} ingredient${found.ingredients.length === 1 ? '' : 's'}`,
              ]
                .filter(Boolean)
                .join(' · ')}
            </div>
            <div style={{ height: 1, background: '#E9DDCA', margin: '14px 0' }} />
            <div style={{ fontSize: 15, color: '#6F6357', lineHeight: 1.5 }}>
              {found.ingredients
                .slice(0, 5)
                .map((ingredient) => ingredient.name)
                .join(', ')}
              {found.ingredients.length > 5
                ? ` — plus ${found.ingredients.length - 5} more, all parsed and ready to edit.`
                : '.'}
            </div>
          </div>
        </div>

        {error && (
          <div style={{ fontSize: 15, color: '#BE3A2E', lineHeight: 1.5, marginTop: 14 }}>{error}</div>
        )}

        <div style={{ flex: 1, minHeight: 20 }} />

        <button
          type="button"
          className="pressable"
          onClick={save}
          style={
            {
              height: 62,
              borderRadius: 18,
              color: '#FFF8F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 600,
              marginTop: 16,
              flex: '0 0 auto',
              '--bg': '#C8553D',
              '--bg-press': '#A23F29',
            } as React.CSSProperties
          }
        >
          {busy ? 'Saving…' : 'Save to the hub'}
        </button>
        <button
          type="button"
          className="pressable"
          onClick={() => {
            setFound(null);
            setPages([]);
          }}
          style={
            {
              height: 56,
              borderRadius: 16,
              border: '1px solid #DBCBB1',
              color: '#6F6357',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 17,
              fontWeight: 600,
              marginTop: 10,
              flex: '0 0 auto',
              '--bg-press': '#F6EDDE',
            } as React.CSSProperties
          }
        >
          Not this one
        </button>
      </div>
    );
  }

  return (
    <div
      className="scroll-none"
      style={{ position: 'absolute', inset: 0, overflowY: 'auto', padding: pad }}
    >
      <h1 className="display-title" style={{ fontSize: 32, margin: 0 }}>
        Add a recipe
      </h1>
      <div style={{ fontSize: 15, color: '#6F6357', marginTop: 3 }}>
        It lands on the kitchen hub straight away.
      </div>

      {mode === 'camera' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 18 }}>
          {scanningEnabled ? (
            <>
              <CameraFrame
                height={300}
                theme="light"
                onCapture={(dataUrl) => setPages((taken) => [...taken, dataUrl].slice(0, MAX_PAGES))}
              />

              <div style={{ fontSize: 15, color: '#6F6357', lineHeight: 1.5 }}>
                {pages.length === 0
                  ? 'A card with its method on the back is two photos. Take them one after another and they are read as one recipe.'
                  : pages.length >= MAX_PAGES
                    ? `That is the most a recipe can be read from. Tap a page to drop it.`
                    : 'Take another photo for the next page, or read what you have.'}
              </div>

              {pages.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    {pages.map((page, index) => (
                      <button
                        key={page.slice(-32) + index}
                        type="button"
                        className="pressable"
                        aria-label={`Drop page ${index + 1}`}
                        onClick={() => setPages((taken) => taken.filter((_, at) => at !== index))}
                        style={
                          {
                            width: 74,
                            height: 74,
                            borderRadius: 14,
                            border: '1px solid #DBCBB1',
                            padding: 0,
                            overflow: 'hidden',
                            position: 'relative',
                            '--bg-press': '#F6EDDE',
                          } as React.CSSProperties
                        }
                      >
                        <img
                          src={page}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                        <span
                          className="mono"
                          style={{
                            position: 'absolute',
                            left: 0,
                            bottom: 0,
                            padding: '2px 6px',
                            fontSize: 12,
                            color: '#FFF8F2',
                            background: 'rgba(43,37,33,0.72)',
                            borderTopRightRadius: 8,
                          }}
                        >
                          {index + 1}
                        </span>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="pressable"
                    onClick={() => read(() => api.importScan(pages))}
                    style={
                      {
                        height: 54,
                        borderRadius: 16,
                        color: '#FFF8F2',
                        fontSize: 16,
                        fontWeight: 600,
                        '--bg': '#C8553D',
                        '--bg-press': '#A23F29',
                      } as React.CSSProperties
                    }
                  >
                    {pages.length === 1 ? 'Read this page' : `Read these ${pages.length} pages`}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div
              style={{
                background: '#F6EDDE',
                borderRadius: 18,
                padding: 18,
                fontSize: 15,
                color: '#6F6357',
                lineHeight: 1.5,
              }}
            >
              Scanning is switched off — the hub has no Anthropic API key. You can still paste a link or
              type a recipe in.
            </div>
          )}
        </div>
      )}

      {mode === 'link' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://…"
            inputMode="url"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            autoFocus
            className="mono"
            style={{
              background: '#FFFDF9',
              border: '1px solid #DBCBB1',
              borderRadius: 14,
              padding: '16px 18px',
              fontSize: 15,
              outline: 'none',
            }}
          />
          <button
            type="button"
            className="pressable"
            onClick={() => url.trim() && read(() => api.importLink(url.trim()))}
            style={
              {
                height: 62,
                borderRadius: 18,
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
        </div>
      )}

      {mode === 'manual' && (
        <div style={{ marginTop: 18 }}>
          <ManualRecipeForm
            theme="light"
            onSaved={async () => {
              await refresh();
              flash('Saved to the hub');
              onDone();
            }}
          />
        </div>
      )}

      {error && (
        <div style={{ fontSize: 15, color: '#BE3A2E', lineHeight: 1.5, marginTop: 14 }}>{error}</div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0 16px' }}>
        <div style={{ flex: 1, height: 1, background: '#E9DDCA' }} />
        <span className="overline">Or</span>
        <div style={{ flex: 1, height: 1, background: '#E9DDCA' }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {mode !== 'camera' && (
          <Route
            title="Scan a page"
            sub={scanningEnabled ? 'Use the camera' : 'Needs an API key on the hub'}
            tint="#E0EBDF"
            color="#3F7D4F"
            icon={<PencilLine size={24} strokeWidth={2} />}
            onClick={() => setMode('camera')}
          />
        )}
        {mode !== 'link' && (
          <Route
            title="Paste a link"
            sub="Or share straight from Safari"
            tint="#F7E4D9"
            color="#C8553D"
            icon={<Link2 size={24} strokeWidth={2} />}
            onClick={() => setMode('link')}
          />
        )}
        {mode !== 'manual' && (
          <Route
            title="Type it in"
            sub="Index cards, handwriting"
            tint="#F8ECD4"
            color="#D9962B"
            icon={<PencilLine size={24} strokeWidth={2} />}
            onClick={() => setMode('manual')}
          />
        )}
      </div>
    </div>
  );
}

function Route({
  title,
  sub,
  tint,
  color,
  icon,
  onClick,
}: {
  title: string;
  sub: string;
  tint: string;
  color: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="pressable"
      onClick={onClick}
      style={
        {
          display: 'flex',
          gap: 14,
          alignItems: 'center',
          border: '1px solid #E9DDCA',
          borderRadius: 18,
          padding: 16,
          minHeight: 76,
          '--bg': '#FFFDF9',
          '--bg-press': '#F6EDDE',
        } as React.CSSProperties
      }
    >
      <span
        style={{
          width: 48,
          height: 48,
          flex: '0 0 48px',
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
        <span style={{ display: 'block', fontSize: 18, fontWeight: 600 }}>{title}</span>
        <span style={{ display: 'block', fontSize: 14, color: '#9C8E7E', marginTop: 2 }}>{sub}</span>
      </span>
      <span style={{ color: '#9C8E7E', fontSize: 20 }}>›</span>
    </button>
  );
}
