import { useState } from 'react';
import { Check, Plus, X } from 'lucide-react';

import { api } from '../../api/client';
import { useStore } from '../../api/store';

/**
 * One list of one-off jobs.
 *
 * This was three columns — short, medium and long-term — which turned out to be
 * a taxonomy for a thing that does not need one. Anything that recurs belongs
 * on the calendar with a date on it; what is left is a flat list of jobs nobody
 * has got to yet, and sorting those into horizons was a decision to make every
 * time something was added, for no benefit when reading it.
 *
 * The `bucket` column is still in the database and still written as 0. Nothing
 * was migrated away, so bringing the columns back is a UI change rather than a
 * recovery.
 */
export function TasksScreen() {
  const { data, refresh } = useStore();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [meta, setMeta] = useState('');
  const [busy, setBusy] = useState(false);
  if (!data) return null;

  // Open first, then done, each by insertion order. A job ticked off stays
  // visible — the satisfaction is the point, and it is how you notice someone
  // else has already done it.
  const tasks = [...data.tasks].sort(
    (a, b) => Number(a.done) - Number(b.done) || a.position - b.position,
  );
  const open = tasks.filter((task) => !task.done).length;

  const toggle = async (id: string, done: boolean) => {
    await api.setTaskDone(id, done);
    await refresh();
  };

  const add = async () => {
    if (!title.trim() || busy) return;
    setBusy(true);
    try {
      await api.addTask(title.trim(), meta.trim(), 0);
      setTitle('');
      setMeta('');
      setAdding(false);
      await refresh();
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    await api.deleteTask(id);
    await refresh();
  };

  const field = {
    background: '#1C1815',
    border: '1px solid rgba(252,247,239,0.16)',
    borderRadius: 12,
    padding: '13px 15px',
    color: '#FAF3E9',
    outline: 'none',
    width: '100%',
    fontFamily: 'inherit',
  } as const;

  return (
    <div style={{ padding: '30px 34px', height: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20 }}>
        <div>
          <h1 className="display-title" style={{ fontSize: 36, color: '#FAF3E9', margin: 0 }}>
            Household
          </h1>
          <div style={{ fontSize: 16, color: '#8E8073', marginTop: 4 }}>
            {open === 0 ? 'All clear' : `${open} open`} · anything that repeats belongs on the
            calendar
          </div>
        </div>

        <button
          type="button"
          className="pressable"
          onClick={() => {
            setAdding((on) => !on);
            setTitle('');
            setMeta('');
          }}
          style={
            {
              height: 52,
              padding: '0 22px 0 18px',
              borderRadius: 999,
              color: '#FFF8F2',
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              fontSize: 16,
              fontWeight: 600,
              '--bg': '#C8553D',
              '--bg-press': '#A23F29',
            } as React.CSSProperties
          }
        >
          {adding ? <X size={20} strokeWidth={2.2} /> : <Plus size={20} strokeWidth={2.2} />}
          {adding ? 'Cancel' : 'Add a job'}
        </button>
      </header>

      {adding && (
        <div
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            background: '#241F1B',
            border: '1px solid rgba(200,85,61,0.45)',
            borderRadius: 18,
            padding: 14,
            flex: '0 0 auto',
          }}
        >
          <input
            autoFocus
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && add()}
            placeholder="What needs doing"
            style={{ ...field, flex: 2, fontSize: 17 }}
          />
          <input
            value={meta}
            onChange={(event) => setMeta(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && add()}
            placeholder="A note — when, who, where"
            style={{ ...field, flex: 1, fontSize: 15, color: '#BFB0A0' }}
          />
          <button
            type="button"
            className="pressable"
            onClick={add}
            style={
              {
                height: 50,
                padding: '0 28px',
                borderRadius: 12,
                color: '#FFF8F2',
                display: 'flex',
                alignItems: 'center',
                fontSize: 16,
                fontWeight: 600,
                flex: '0 0 auto',
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

      {tasks.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            color: '#8E8073',
          }}
        >
          <div className="serif" style={{ fontSize: 28, color: '#BFB0A0' }}>
            Nothing on the board
          </div>
          <div style={{ fontSize: 17 }}>One-off jobs go here. Repeating ones go on the calendar.</div>
        </div>
      ) : (
        <div
          className="scroll-none"
          style={{
            // Two columns on a display this wide: one long list would leave
            // half the screen empty and push the bottom of it out of reach.
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gridAutoRows: 'min-content',
            gap: 12,
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            alignContent: 'start',
          }}
        >
          {tasks.map((task) => (
            <div
              key={task.id}
              style={{
                display: 'flex',
                gap: 14,
                alignItems: 'center',
                background: '#2E2823',
                borderRadius: 16,
                padding: '14px 16px',
                minHeight: 76,
                opacity: task.done ? 0.42 : 1,
              }}
            >
              <button
                type="button"
                className="pressable"
                aria-pressed={task.done}
                onClick={() => toggle(task.id, !task.done)}
                style={
                  {
                    display: 'flex',
                    gap: 14,
                    alignItems: 'center',
                    flex: 1,
                    minWidth: 0,
                    borderRadius: 12,
                    padding: 4,
                    margin: -4,
                    textAlign: 'left',
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
                <span style={{ flex: 1, minWidth: 0 }}>
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

              {/* A done job is finished with; clearing it is the only thing
                  left to do to it, and it was previously impossible here. */}
              {task.done && (
                <button
                  type="button"
                  className="pressable"
                  aria-label={`Clear ${task.title}`}
                  onClick={() => remove(task.id)}
                  style={
                    {
                      width: 40,
                      height: 40,
                      borderRadius: 999,
                      flex: '0 0 40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#8E8073',
                      '--bg-press': '#3A322C',
                    } as React.CSSProperties
                  }
                >
                  <X size={18} strokeWidth={2.2} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
