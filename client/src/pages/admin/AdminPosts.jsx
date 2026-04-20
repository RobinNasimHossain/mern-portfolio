import { useEffect, useState } from 'react';
import { postsApi } from '../../api/endpoints.js';

const blank = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  tags: '',
  coverImage: '',
  published: false,
};

function toPayload(form) {
  return {
    ...form,
    tags: form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
  };
}

function toForm(post) {
  return {
    ...blank,
    ...post,
    tags: (post.tags || []).join(', '),
  };
}

export function AdminPosts() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const refresh = () => postsApi.list({ includeDrafts: 'true' }).then(setItems);

  useEffect(() => {
    refresh();
  }, []);

  const reset = () => {
    setForm(blank);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const payload = toPayload(form);
      if (editingId) {
        await postsApi.update(editingId, payload);
      } else {
        await postsApi.create(payload);
      }
      reset();
      await refresh();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save');
    } finally {
      setBusy(false);
    }
  };

  const handleEdit = (p) => {
    setEditingId(p._id);
    setForm(toForm(p));
  };

  const handleDelete = async (p) => {
    // eslint-disable-next-line no-alert
    if (!confirm(`Delete post "${p.title}"?`)) return;
    await postsApi.remove(p._id);
    await refresh();
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="card space-y-4">
        <h2 className="text-xl font-semibold text-white">
          {editingId ? 'Edit post' : 'New post'}
        </h2>
        {error && <p className="text-sm text-red-400">{error}</p>}

        <div>
          <label className="label">Title</label>
          <input
            required
            className="input"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Slug (optional)</label>
            <input
              className="input"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Tags (comma separated)</label>
            <input
              className="input"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="label">Excerpt</label>
          <input
            className="input"
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Content (markdown-ish)</label>
          <textarea
            rows={10}
            required
            className="input resize-y"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Cover image URL</label>
          <input
            className="input"
            value={form.coverImage}
            onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
          />
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={!!form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
          />
          Publish
        </label>

        <div className="flex gap-2">
          <button type="submit" disabled={busy} className="btn-primary">
            {editingId ? 'Save changes' : 'Create post'}
          </button>
          {editingId && (
            <button type="button" onClick={reset} className="btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div>
        <h2 className="text-xl font-semibold text-white">All posts</h2>
        <div className="mt-4 space-y-3">
          {items.map((p) => (
            <div key={p._id} className="card flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-white">
                  {p.title}{' '}
                  {!p.published && (
                    <span className="chip ml-2 bg-amber-500/20 text-amber-200">Draft</span>
                  )}
                </p>
                <p className="text-sm text-slate-400">
                  /{p.slug} {p.tags?.length > 0 && `· ${p.tags.join(', ')}`}
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => handleEdit(p)} className="btn-secondary">
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p)}
                  className="btn border border-red-500/40 bg-red-500/10 text-red-200 hover:bg-red-500/20"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-slate-400">No posts yet.</p>}
        </div>
      </div>
    </div>
  );
}
