import { useEffect, useState } from 'react';
import { messagesApi } from '../../api/endpoints.js';

export function AdminMessages() {
  const [items, setItems] = useState([]);

  const refresh = () => messagesApi.list().then(setItems);

  useEffect(() => {
    refresh();
  }, []);

  const markRead = async (id) => {
    await messagesApi.markRead(id);
    await refresh();
  };
  const remove = async (id) => {
    // eslint-disable-next-line no-alert
    if (!confirm('Delete this message?')) return;
    await messagesApi.remove(id);
    await refresh();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-white">Inbox</h2>
      <div className="mt-4 space-y-3">
        {items.map((m) => (
          <div
            key={m._id}
            className={`card ${m.read ? '' : 'border-brand-500/60'}`}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold text-white">
                {m.name}{' '}
                <span className="text-sm font-normal text-slate-400">
                  &lt;{m.email}&gt;
                </span>
                {!m.read && (
                  <span className="chip ml-2 bg-brand-500/20 text-brand-200">New</span>
                )}
              </p>
              <p className="text-xs text-slate-500">
                {new Date(m.createdAt).toLocaleString()}
              </p>
            </div>
            {m.subject && (
              <p className="mt-1 text-sm font-medium text-slate-200">{m.subject}</p>
            )}
            <p className="mt-2 whitespace-pre-line text-sm text-slate-300">{m.body}</p>
            <div className="mt-3 flex gap-2">
              {!m.read && (
                <button
                  type="button"
                  onClick={() => markRead(m._id)}
                  className="btn-secondary"
                >
                  Mark read
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(m._id)}
                className="btn border border-red-500/40 bg-red-500/10 text-red-200 hover:bg-red-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-slate-400">No messages yet.</p>}
      </div>
    </div>
  );
}
