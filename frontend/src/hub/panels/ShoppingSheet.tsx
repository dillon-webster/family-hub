import { useEffect, useState } from 'react';
import { Check, Plus } from 'lucide-react';

import { api } from '../../api/client';
import { useStore } from '../../api/store';
import type { ListItem, ShoppingList } from '../../api/types';
import { isoDate, weekRange } from '../../lib/week';
import { CloseButton } from './AssignPanel';
import { HubKeyboard } from './HubKeyboard';

/**
 * The week's shopping, in two acts.
 *
 * Before anyone has been through it, the list is a *proposal*: what the week's
 * dinners imply, with everything already in the cupboard still on it. Review
 * strikes those out. After that it is the list proper, and tapping means bought.
 */
export function ShoppingSheet({ onClose }: { onClose: () => void }) {
  const { data, weekStart, refresh } = useStore();
  const weekKey = isoDate(weekStart);

  const [list, setList] = useState<ShoppingList | null>(data?.shopping ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyboardAisle, setKeyboardAisle] = useState<string | null>(null);

  // Refetch on open. The pulse below covers a real request rather than a
  // staged delay, so a fast hub simply shows the list immediately.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .shopping(weekKey)
      .then((next) => {
        if (!cancelled) setList(next);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [weekKey]);

  const plannedDinners = data
    ? data.plan.filter((entry) => entry.kind === 'cook').length
    : 0;

  const setItem = async (key: string, change: { bought?: boolean; skipped?: boolean }) => {
    // Optimistic: a tap on a wall display should land instantly, and the
    // server's reply replaces this a moment later either way.
    setList((current) =>
      current
        ? {
            ...current,
            groups: current.groups.map((group) => ({
              ...group,
              items: group.items.map((item) =>
                item.key === key ? { ...item, ...change } : item,
              ),
            })),
          }
        : current,
    );
    const next = await api.setItem(weekKey, key, change);
    setList(next);
    void refresh();
  };

  const addExtra = async (name: string, aisle: string) => {
    const next = await api.addExtra({ week_start: weekKey, name, aisle });
    setList(next);
    setKeyboardAisle(null);
    void refresh();
  };

  const approve = async () => {
    setList(await api.approve(weekKey));
    void refresh();
  };

  const unapprove = async () => {
    setList(await api.unapprove(weekKey));
    void refresh();
  };

  const approved = list?.approved ?? false;

  // Before approval the visible list is the generated proposal; afterwards it
  // is the committed list, and skipped items are gone from it entirely.
  const visible = (items: ListItem[]) =>
    approved ? items.filter((item) => item.hand || !item.skipped) : items.filter((item) => !item.hand);

  const groups = (list?.groups ?? [])
    .map((group) => ({ ...group, items: visible(group.items) }))
    .filter((group) => group.items.length > 0);

  const toBuy = groups.flatMap((g) => g.items).filter((i) => !i.bought).length;
  const toAdd = (list?.groups ?? [])
    .flatMap((g) => g.items)
    .filter((i) => !i.hand && !i.skipped).length;

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
          width: loading ? 640 : 720,
          maxWidth: '100%',
          height: '100%',
          background: '#241F1B',
          borderLeft: '1px solid rgba(252,247,239,0.12)',
          padding: '28px 26px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          boxShadow: '-24px 0 48px rgba(0,0,0,0.35)',
          animation: 'fh-sheet-in .22s cubic-bezier(0.32, 0.72, 0, 1)',
          position: 'relative',
          transition: 'width .2s',
        }}
      >
        <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            {approved ? (
              <>
                <div className="overline">Shopping list · {weekRange(weekStart)}</div>
                <div className="serif" style={{ fontSize: 30, color: '#FAF3E9', marginTop: 6 }}>
                  {toBuy} left to buy
                </div>
                <div style={{ fontSize: 15, color: '#8E8073', marginTop: 4 }}>
                  From {plannedDinners} planned dinner{plannedDinners === 1 ? '' : 's'} · tap once it's in
                  the cart
                </div>
              </>
            ) : (
              <>
                <div className="overline" style={{ color: '#E3A85C' }}>
                  Check before adding
                </div>
                <div className="serif" style={{ fontSize: 30, color: '#FAF3E9', marginTop: 6 }}>
                  {toAdd} item{toAdd === 1 ? '' : 's'} from this week
                </div>
                <div style={{ fontSize: 15, color: '#8E8073', marginTop: 4 }}>
                  Tap anything you already have to leave it off the list.
                </div>
              </>
            )}
          </div>
          <CloseButton onClose={onClose} />
        </header>

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#8E8073', fontSize: 18 }}>
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: 999,
                background: '#E37A57',
                animation: 'fh-pulse 1.1s ease-in-out infinite',
              }}
            />
            Reading {plannedDinners} dinner{plannedDinners === 1 ? '' : 's'} and merging what repeats…
          </div>
        )}

        {error && !loading && (
          <div style={{ fontSize: 16, color: '#E37A57', lineHeight: 1.5 }}>{error}</div>
        )}

        {!loading && !error && groups.length === 0 && (
          <div style={{ fontSize: 17, color: '#8E8073', lineHeight: 1.5, paddingTop: 8 }}>
            Nothing to buy yet. Plan a few dinners and their ingredients land here.
          </div>
        )}

        {!loading && groups.length > 0 && (
          <div
            className="scroll-none"
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px 18px',
              alignContent: 'start',
            }}
          >
            {groups.map((group) => (
              <div key={group.aisle} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="overline" style={{ color: group.hub_color, padding: '0 4px' }}>
                  {group.label}
                </div>

                {group.items.map((item) => {
                  const on = approved ? item.bought : !item.skipped;
                  const dim = approved ? item.bought : item.skipped;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      className="pressable"
                      onClick={() =>
                        setItem(
                          item.key,
                          approved ? { bought: !item.bought } : { skipped: !item.skipped },
                        )
                      }
                      style={
                        {
                          display: 'flex',
                          gap: 12,
                          alignItems: 'center',
                          borderRadius: 14,
                          padding: '9px 14px',
                          minHeight: 52,
                          opacity: dim ? 0.42 : 1,
                          '--bg': '#2E2823',
                          '--bg-press': '#3A322C',
                        } as React.CSSProperties
                      }
                    >
                      <span
                        style={{
                          width: 26,
                          height: 26,
                          flex: '0 0 26px',
                          borderRadius: 999,
                          border: `2px solid ${on ? '#6E8B57' : 'rgba(252,247,239,0.28)'}`,
                          background: on ? '#6E8B57' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: on ? '#FBFCF7' : 'transparent',
                        }}
                      >
                        <Check size={15} strokeWidth={3} />
                      </span>
                      <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                        <span
                          style={{
                            display: 'block',
                            fontSize: 16,
                            fontWeight: 600,
                            color: '#FAF3E9',
                            lineHeight: 1.25,
                            textDecoration: dim ? 'line-through' : 'none',
                          }}
                        >
                          {item.name}
                        </span>
                        <span
                          className="mono"
                          style={{ display: 'block', fontSize: 13, color: '#8E8073', marginTop: 1 }}
                        >
                          {item.qtys.filter(Boolean).join(' + ')}
                          {!approved && item.skipped
                            ? '  ·  already have it'
                            : item.meals > 1
                              ? `  ·  ${item.meals} meals`
                              : ''}
                        </span>
                      </span>
                    </button>
                  );
                })}

                {approved && (
                  <button
                    type="button"
                    className="pressable"
                    onClick={() => setKeyboardAisle(group.label)}
                    style={
                      {
                        display: 'flex',
                        gap: 12,
                        alignItems: 'center',
                        border: '1px dashed rgba(252,247,239,0.20)',
                        borderRadius: 14,
                        padding: '9px 14px',
                        minHeight: 52,
                        color: '#8E8073',
                        '--bg-press': '#2E2823',
                      } as React.CSSProperties
                    }
                  >
                    <span
                      style={{
                        width: 26,
                        height: 26,
                        flex: '0 0 26px',
                        borderRadius: 999,
                        background: 'rgba(200,85,61,0.18)',
                        color: '#E37A57',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Plus size={17} strokeWidth={2.4} />
                    </span>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>Add item</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && (
          <footer style={{ display: 'flex', gap: 12, flex: '0 0 auto' }}>
            {approved ? (
              <>
                <button
                  type="button"
                  className="pressable"
                  onClick={unapprove}
                  style={
                    {
                      flex: 1,
                      height: 58,
                      borderRadius: 16,
                      border: '1px solid rgba(252,247,239,0.18)',
                      color: '#BFB0A0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 17,
                      fontWeight: 600,
                      '--bg-press': 'rgba(252,247,239,0.06)',
                    } as React.CSSProperties
                  }
                >
                  Check it again
                </button>
                <button
                  type="button"
                  className="pressable"
                  onClick={onClose}
                  style={
                    {
                      flex: 1,
                      height: 58,
                      borderRadius: 16,
                      color: '#FFF8F2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 17,
                      fontWeight: 600,
                      '--bg': '#C8553D',
                      '--bg-press': '#A23F29',
                    } as React.CSSProperties
                  }
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="pressable"
                  onClick={onClose}
                  style={
                    {
                      flex: 1,
                      height: 58,
                      borderRadius: 16,
                      border: '1px solid rgba(252,247,239,0.18)',
                      color: '#BFB0A0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
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
                  onClick={approve}
                  style={
                    {
                      flex: 2,
                      height: 58,
                      borderRadius: 16,
                      color: '#FFF8F2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 17,
                      fontWeight: 600,
                      '--bg': '#C8553D',
                      '--bg-press': '#A23F29',
                    } as React.CSSProperties
                  }
                >
                  Add {toAdd} to the list
                </button>
              </>
            )}
          </footer>
        )}

        {keyboardAisle && (
          <HubKeyboard
            aisle={keyboardAisle}
            onCancel={() => setKeyboardAisle(null)}
            onSubmit={(value) => addExtra(value, keyboardAisle)}
          />
        )}
      </div>
    </div>
  );
}
