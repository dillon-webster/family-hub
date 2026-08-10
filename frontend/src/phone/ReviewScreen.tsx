import { Check, X } from 'lucide-react';

import { api } from '../api/client';
import { useStore } from '../api/store';
import type { ShoppingList } from '../api/types';

/**
 * "Check before adding."
 *
 * The generated list assumes an empty kitchen. This is where someone who knows
 * what is in the cupboard strikes out the half of it they already have, before
 * any of it becomes a real shopping list.
 */
export function ReviewScreen({
  list,
  weekKey,
  onChange,
  onClose,
  onApproved,
}: {
  list: ShoppingList;
  weekKey: string;
  onChange: (next: ShoppingList) => void;
  onClose: () => void;
  onApproved: () => void;
}) {
  const { refresh } = useStore();

  const groups = list.groups
    .map((group) => ({ ...group, items: group.items.filter((item) => !item.hand) }))
    .filter((group) => group.items.length > 0);

  const keeping = groups.flatMap((g) => g.items).filter((i) => !i.skipped).length;

  const toggle = async (key: string, skipped: boolean) => {
    onChange({
      ...list,
      groups: list.groups.map((group) => ({
        ...group,
        items: group.items.map((item) => (item.key === key ? { ...item, skipped } : item)),
      })),
    });
    onChange(await api.setItem(weekKey, key, { skipped }));
    void refresh();
  };

  const approve = async () => {
    onChange(await api.approve(weekKey));
    await refresh();
    onApproved();
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 45,
        background: '#FCF7EF',
        display: 'flex',
        flexDirection: 'column',
        padding: 'calc(14px + env(safe-area-inset-top)) 20px calc(24px + env(safe-area-inset-bottom))',
        animation: 'fh-fade .15s ease-out',
      }}
    >
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div className="overline" style={{ color: '#D9962B' }}>
            Check before adding
          </div>
          <div className="serif" style={{ fontSize: 28, marginTop: 5 }}>
            This week's ingredients
          </div>
          <div style={{ fontSize: 14, color: '#6F6357', marginTop: 3 }}>
            Tap anything you already have.
          </div>
        </div>
        <button
          type="button"
          className="pressable"
          aria-label="Close"
          onClick={onClose}
          style={
            {
              width: 48,
              height: 48,
              flex: '0 0 48px',
              borderRadius: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6F6357',
              '--bg': '#F6EDDE',
              '--bg-press': '#EFE3D0',
            } as React.CSSProperties
          }
        >
          <X size={20} strokeWidth={2} />
        </button>
      </header>

      <div
        className="scroll-none"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          marginTop: 18,
        }}
      >
        {groups.map((group) => (
          <section key={group.aisle} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 2px' }}>
              <span style={{ width: 10, height: 10, borderRadius: 999, background: group.phone_color }} />
              <span className="overline">{group.label}</span>
            </div>

            {group.items.map((item) => {
              const keep = !item.skipped;
              return (
                <button
                  key={item.key}
                  type="button"
                  className="pressable"
                  onClick={() => toggle(item.key, keep)}
                  style={
                    {
                      display: 'flex',
                      gap: 14,
                      alignItems: 'center',
                      border: '1px solid #E9DDCA',
                      borderRadius: 16,
                      padding: '12px 14px',
                      minHeight: 60,
                      opacity: keep ? 1 : 0.42,
                      '--bg': '#FFFDF9',
                      '--bg-press': '#F6EDDE',
                    } as React.CSSProperties
                  }
                >
                  <span
                    style={{
                      width: 30,
                      height: 30,
                      flex: '0 0 30px',
                      borderRadius: 999,
                      border: `2px solid ${keep ? '#6E8B57' : '#DBCBB1'}`,
                      background: keep ? '#6E8B57' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: keep ? '#FBFCF7' : 'transparent',
                    }}
                  >
                    <Check size={16} strokeWidth={3} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <span
                      style={{
                        display: 'block',
                        fontSize: 17,
                        fontWeight: 600,
                        lineHeight: 1.25,
                        textDecoration: keep ? 'none' : 'line-through',
                      }}
                    >
                      {item.name}
                    </span>
                    <span
                      className="mono"
                      style={{ display: 'block', fontSize: 13, color: '#9C8E7E', marginTop: 2 }}
                    >
                      {item.qtys.filter(Boolean).join(' + ')}
                      {keep
                        ? item.meals > 1
                          ? `  ·  ${item.meals} meals`
                          : ''
                        : '  ·  already have it'}
                    </span>
                  </span>
                </button>
              );
            })}
          </section>
        ))}
      </div>

      <button
        type="button"
        className="pressable"
        onClick={approve}
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
        Add {keeping} item{keeping === 1 ? '' : 's'} to the list
      </button>
    </div>
  );
}
