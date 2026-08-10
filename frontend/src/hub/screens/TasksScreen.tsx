import { useState } from 'react';
import { Check, Plus, X } from 'lucide-react';

import { api } from '../../api/client';
import { useStore } from '../../api/store';
import { BUCKETS } from '../../design/category';

export function TasksScreen() {
  const { data, refresh } = useStore();
  const [addingTo, setAddingTo] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [meta, setMeta] = useState('');
  if (!data) return null;

  const open = data.tasks.filter((task) => !task.done).length;

  const toggle = async (id: string, done: boolean) => {
    await api.setTaskDone(id, done);
    await refresh();
  };

  const add = async (bucket: number) => {
    if (!title.trim()) return;
    await api.addTask(title.trim(), meta.trim(), bucket);
    setTitle('');
    setMeta('');
    setAddingTo(null);
    await refresh();
  };

  return (
    <div style={{ padding: '30px 34px', height: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <header>
        <h1 className="display-title" style={{ fontSize: 36, color: '#FAF3E9', margin: 0 }}>
          Household
        </h1>
        <div style={{ fontSize: 16, color: '#8E8073', marginTop: 4 }}>
          {open === 0 ? 'All clear' : `${open} open`} · tap a card to check it off
        </div>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 18,
          flex: 1,
          minHeight: 0,
        }}
      >
        {BUCKETS.map((bucket, index) => {
          const tasks = data.tasks
            .filter((task) => task.bucket === index)
            .sort((a, b) => Number(a.done) - Number(b.done) || a.position - b.position);
          const openCount = tasks.filter((task) => !task.done).length;

          return (
            <section
              key={bucket.name}
              style={{
                background: '#241F1B',
                border: '1px solid rgba(252,247,239,0.08)',
                borderRadius: 22,
                padding: '18px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                minHeight: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
                <span className="overline" style={{ color: bucket.color }}>
                  {bucket.name}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="mono" style={{ fontSize: 14, color: '#8E8073' }}>
                    {openCount}
                  </span>
                  <button
                    type="button"
                    className="pressable"
                    aria-label={`Add to ${bucket.name}`}
                    onClick={() => {
                      setAddingTo(addingTo === index ? null : index);
                      setTitle('');
                      setMeta('');
                    }}
                    style={
                      {
                        width: 30,
                        height: 30,
                        borderRadius: 999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#8E8073',
                        '--bg-press': '#332C27',
                      } as React.CSSProperties
                    }
                  >
                    {addingTo === index ? <X size={16} strokeWidth={2.2} /> : <Plus size={17} strokeWidth={2.2} />}
                  </button>
                </span>
              </div>

              {addingTo === index && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input
                    autoFocus
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    onKeyDown={(event) => event.key === 'Enter' && add(index)}
                    placeholder="What needs doing"
                    style={{
                      background: '#1C1815',
                      border: '1px solid rgba(252,247,239,0.16)',
                      borderRadius: 12,
                      padding: '12px 14px',
                      fontSize: 16,
                      color: '#FAF3E9',
                      outline: 'none',
                    }}
                  />
                  <input
                    value={meta}
                    onChange={(event) => setMeta(event.target.value)}
                    onKeyDown={(event) => event.key === 'Enter' && add(index)}
                    placeholder="A note — when, who, where"
                    style={{
                      background: '#1C1815',
                      border: '1px solid rgba(252,247,239,0.16)',
                      borderRadius: 12,
                      padding: '10px 14px',
                      fontSize: 14,
                      color: '#BFB0A0',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="button"
                    className="pressable"
                    onClick={() => add(index)}
                    style={
                      {
                        height: 44,
                        borderRadius: 12,
                        color: '#FFF8F2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 15,
                        fontWeight: 600,
                        opacity: title.trim() ? 1 : 0.5,
                        '--bg': '#C8553D',
                        '--bg-press': '#A23F29',
                      } as React.CSSProperties
                    }
                  >
                    Add
                  </button>
                </div>
              )}

              <div
                className="scroll-none"
                style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', minHeight: 0 }}
              >
                {tasks.length === 0 && !addingTo && (
                  <div style={{ fontSize: 15, color: '#8E8073', padding: '6px 4px', lineHeight: 1.5 }}>
                    Nothing here.
                  </div>
                )}
                {tasks.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    className="pressable"
                    onClick={() => toggle(task.id, !task.done)}
                    style={
                      {
                        display: 'flex',
                        gap: 14,
                        alignItems: 'center',
                        borderRadius: 16,
                        padding: '14px 16px',
                        minHeight: 76,
                        opacity: task.done ? 0.42 : 1,
                        flex: '0 0 auto',
                        '--bg': '#2E2823',
                        '--bg-press': '#3A322C',
                      } as React.CSSProperties
                    }
                  >
                    <span
                      style={{
                        width: 34,
                        height: 34,
                        flex: '0 0 34px',
                        borderRadius: 999,
                        border: `2px solid ${task.done ? '#6E8B57' : 'rgba(252,247,239,0.28)'}`,
                        background: task.done ? '#6E8B57' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: task.done ? '#FBFCF7' : 'transparent',
                      }}
                    >
                      <Check size={18} strokeWidth={3} />
                    </span>
                    <span style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                      <span
                        style={{
                          display: 'block',
                          fontSize: 19,
                          fontWeight: 600,
                          color: '#FAF3E9',
                          lineHeight: 1.28,
                          textDecoration: task.done ? 'line-through' : 'none',
                          textWrap: 'pretty',
                        }}
                      >
                        {task.title}
                      </span>
                      {task.meta && (
                        <span style={{ display: 'block', fontSize: 14, color: '#8E8073', marginTop: 3 }}>
                          {task.meta}
                        </span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
