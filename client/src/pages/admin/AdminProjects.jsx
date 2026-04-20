import { useEffect, useState } from 'react';
import { projectsApi } from '../../api/endpoints.js';

const blank = {
  title: '',
  slug: '',
  summary: '',
  description: '',
  tech: '',
  coverImage: '',
  repoUrl: '',
  liveUrl: '',
  featured: false,
  order: 0,
};

function toPayload(form) {
  return {
    ...form,
    tech: form.tech
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    order: Number(form.order) || 0,
  };
}

function toForm(project) {
  return {
    ...blank,
    ...project,
    tech: (project.tech || []).join(', '),
    order: project.order ?? 0,
  };
}

export function AdminProjects() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const refresh = () => projectsApi.list().then(setItems);

  useEffect(() => {
    refresh();
  }, []);

  const resetForm = () => {
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
        await projectsApi.update(editingId, payload);
      } else {
        await projectsApi.create(payload);
      }
      resetForm();
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
    if (!confirm(`Delete project "${p.title}"?`)) return;
    await projectsApi.remove(p._id);
    await refresh();
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="card space-y-4">
        <h2 className="text-xl font-semibold text-white">
          {editingId ? 'Edit project' : 'New project'}
        </h2>
        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Title</label>
            <input
              required
              className="input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Slug (optional)</label>
            <input
              className="input"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="label">Summary</label>
          <input
            required
            className="input"
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            rows={5}
            className="input"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Tech (comma separated)</label>
          <input
            className="input"
            value={form.tech}
            onChange={(e) => setForm({ ...form, tech: e.target.value })}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Repo URL</label>
            <input
              className="input"
              value={form.repoUrl}
              onChange={(e) => setForm({ ...form, repoUrl: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Live URL</label>
            <input
              className="input"
              value={form.liveUrl}
              onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
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
          <div>
            <label className="label">Order</label>
            <input
              type="number"
              className="input"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: e.target.value })}
            />
          </div>
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={!!form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
          />
          Featured on homepage
        </label>

        <div className="flex gap-2">
          <button type="submit" disabled={busy} className="btn-primary">
            {editingId ? 'Save changes' : 'Create project'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div>
        <h2 className="text-xl font-semibold text-white">All projects</h2>
        <div className="mt-4 space-y-3">
          {items.map((p) => (
            <div key={p._id} className="card flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-white">
                  {p.title}
                  {p.featured && (
                    <span className="chip ml-2 bg-brand-500/20 text-brand-200">Featured</span>
                  )}
                </p>
                <p className="text-sm text-slate-400">{p.summary}</p>
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
          {items.length === 0 && <p className="text-slate-400">No projects yet.</p>}
        </div>
      </div>
    </div>
  );
}
