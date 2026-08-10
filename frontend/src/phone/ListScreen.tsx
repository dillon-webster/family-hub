import { useEffect, useState } from 'react';
import { Check, Plus } from 'lucide-react';

import { api } from '../api/client';
import { useStore } from '../api/store';
import type { ListItem, ShoppingList } from '../api/types';
import { isoDate } from '../lib/week';
import { PhoneKeyboard } from './PhoneKeyboard';
import { ReviewScreen } from './ReviewScreen';

export function ListScreen({ flash }: { flash: (message: string) => void }) {
  const { data, weekStart, refresh, connected } = useStore();
  const weekKey = isoDate(weekStart);

  const [list, setList] = useState<ShoppingList | null>(data?.shopping ?? null);
  const [reviewing, setReviewing] = useState(false);
  const [keyboardAisle, setKeyboardAisle] = useState<string | null>(null);

  // Follow the store, which the live stream keeps current.
  useEffect(() => {
    if (data?.shopping) setList(data.shopping);
  }, [data?.shopping]);

  if (!list || !data) return null;

  const members = new Map(data.members.map((member) => [member.id, member]));
  const approved = list.approved;

  const pending = list.groups.flatMap((g) => g.items).filter((i) => !i.hand);
  const pendingCount = pending.length;

  // Before review the list shows only what someone has typed in; the generated
  // items are still a proposal sitting behind the banner.
  const visible = (items: ListItem[]) =>
    items.filter((item) => item.hand || (approved && !item.skipped));

  const groups = list.groups
    .map((group) => ({ ...group, items: visible(group.items) }))
    .filter((group) => group.items.length > 0);

  const left = groups.flatMap((g) => g.items).filter((i) => !i.bought).length;
  const handCount = list.groups.flatMap((g) => g.items).filter((i) => i.hand).length;

  const toggle = async (item: ListItem) => {
    setList((current) =>
      current
        ? {
            ...current,
            groups: current.groups.map((group) => ({
              ...group,
              items: group.items.map((entry) =>
                entry.key === item.key ? { ...entry, bought: !entry.bought } : entry,
              ),
            })),
          }
        : current,
    );
    setList(await api.setItem(weekKey, item.key, { bought: !item.bought }));
    void refresh();
  };

  const addExtra = async (name: string, aisle: string) => {
    setList(await api.addExtra({ week_start: weekKey, name, aisle }));
    setKeyboardAisle(null);
    flash('Added to the list');
    void refresh();
  };

  if (reviewing) {
    return (
      <ReviewScreen
        list={list}
        weekKey={weekKey}
        onChange={setList}
        onClose={() => setReviewing(false)}
        onApproved={() => {
          setReviewing(false);
          flash('Added to the list');
        }}
      />
    );
  }

  return (
    <>
      <div
        className="scroll-none"
        style={{
          position: 'absolute',
          inset: 0,
          overflowY: 'auto',
          padding: 'calc(14px + env(safe-area-inset-top)) 20px 170px',
        }}
      >
        <h1 className="display-title" style={{ fontSize: 32, margin: 0 }}>
          Shopping list
        </h1>
        <div style={{ fontSize: 15, color: '#6F6357', marginTop: 3 }}>
          {approved
            ? `${left} left · from this week's dinners`
            : `${handCount} added by hand · ${pendingCount} waiting to be checked`}
        </div>

        {!approved && pendingCount > 0 && (
          <button
            type="button"
            className="pressable"
            onClick={() => setReviewing(true)}
            style={
              {
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                border: '1px solid #EBC9B8',
                borderRadius: 18,
                padding: '14px 16px',
                marginTop: 16,
                minHeight: 74,
                width: '100%',
                '--bg': '#F7E4D9',
                '--bg-press': '#F0D6C7',
              } as React.CSSProperties
            }
          >
            <span
              className="mono"
              style={{
                width: 42,
                height: 42,
                flex: '0 0 42px',
                borderRadius: 999,
                background: '#C8553D',
                color: '#FFF8F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 500,
              }}
            >
              {pendingCount}
            </span>
            <span style={{ flex: 1, textAlign: 'left' }}>
              <span style={{ display: 'block', fontSize: 16, fontWeight: 600 }}>
                Items from this week's dinners
              </span>
              <span style={{ display: 'block', fontSize: 14, color: '#6F6357', marginTop: 2 }}>
                Check them before they're added
              </span>
            </span>
            <span style={{ color: '#C8553D', fontSize: 20 }}>›</span>
          </button>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: '#F6EDDE',
            borderRadius: 14,
            padding: '12px 14px',
            marginTop: 12,
          }}
        >
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: 999,
              background: connected ? '#6E8B57' : '#D9962B',
              flex: '0 0 9px',
            }}
          />
          <span style={{ fontSize: 14, color: '#6F6357' }}>
            {connected ? 'Synced with the kitchen hub' : 'Offline — will sync when you reconnect'}
          </span>
        </div>

        {groups.length === 0 ? (
          <div style={{ fontSize: 16, color: '#6F6357', lineHeight: 1.5, marginTop: 26 }}>
            Nothing on the list yet. Plan a few dinners on the hub and their ingredients turn up here.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginTop: 22 }}>
            {groups.map((group) => (
              <section key={group.aisle} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 2px' }}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      background: group.phone_color,
                    }}
                  />
                  <span className="overline">{group.label}</span>
                </div>

                {group.items.map((item) => {
                  const other = item.added_by ? members.get(item.added_by) : undefined;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      className="pressable"
                      onClick={() => toggle(item)}
                      style={
                        {
                          display: 'flex',
                          gap: 14,
                          alignItems: 'center',
                          border: '1px solid #E9DDCA',
                          borderRadius: 16,
                          padding: '12px 14px',
                          minHeight: 60,
                          opacity: item.bought ? 0.45 : 1,
                          boxShadow: '0 1px 3px rgba(67,47,28,0.08)',
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
                          border: `2px solid ${item.bought ? '#6E8B57' : '#DBCBB1'}`,
                          background: item.bought ? '#6E8B57' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: item.bought ? '#FBFCF7' : 'transparent',
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
                            textDecoration: item.bought ? 'line-through' : 'none',
                          }}
                        >
                          {item.name}
                        </span>
                        <span
                          className="mono"
                          style={{ display: 'block', fontSize: 13, color: '#9C8E7E', marginTop: 2 }}
                        >
                          {item.qtys.filter(Boolean).join(' + ')}
                          {item.meals > 1 ? `  ·  ${item.meals} meals` : ''}
                        </span>
                      </span>
                      {other && (
                        <span
                          style={{
                            width: 26,
                            height: 26,
                            flex: '0 0 26px',
                            borderRadius: 999,
                            background: other.color,
                            color: '#FFF8F2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {other.initial}
                        </span>
                      )}
                    </button>
                  );
                })}

                <button
                  type="button"
                  className="pressable"
                  onClick={() => setKeyboardAisle(group.label)}
                  style={
                    {
                      display: 'flex',
                      gap: 14,
                      alignItems: 'center',
                      border: '1px dashed #DBCBB1',
                      borderRadius: 16,
                      padding: '12px 14px',
                      minHeight: 60,
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
                      background: '#F7E4D9',
                      color: '#C8553D',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Plus size={19} strokeWidth={2.2} />
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#6F6357' }}>Add item</span>
                </button>
              </section>
            ))}
          </div>
        )}
      </div>

      {keyboardAisle && (
        <PhoneKeyboard
          aisle={keyboardAisle}
          onCancel={() => setKeyboardAisle(null)}
          onSubmit={(value) => addExtra(value, keyboardAisle)}
        />
      )}
    </>
  );
}
