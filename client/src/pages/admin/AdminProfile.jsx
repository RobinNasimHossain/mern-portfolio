import { useEffect, useState } from 'react';
import { profileApi } from '../../api/endpoints.js';

const emptySocials = { github: '', linkedin: '', twitter: '', website: '' };

export function AdminProfile() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    profileApi.get().then((p) =>
      setForm({
        ...p,
        socials: { ...emptySocials, ...(p.socials || {}) },
        skills: (p.skills || []).join(', '),
      }),
    );
  }, []);

  if (!form) return <p className="text-slate-400">Loading…</p>;

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setSocial = (k, v) =>
    setForm((f) => ({ ...f, socials: { ...f.socials, [k]: v } }));

  const save = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);
    try {
      const payload = {
        ...form,
        skills: form.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };
      delete payload._id;
      delete payload.key;
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.__v;
      await profileApi.update(payload);
      setMessage('Profile saved');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="card space-y-4">
      {error && <p className="text-sm text-red-400">{error}</p>}
      {message && <p className="text-sm text-emerald-400">{message}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Name</label>
          <input
            className="input"
            value={form.name || ''}
            onChange={(e) => setField('name', e.target.value)}
          />
        </div>
        <div>
          <label className="label">Headline</label>
          <input
            className="input"
            value={form.headline || ''}
            onChange={(e) => setField('headline', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="label">Summary</label>
        <textarea
          rows={2}
          className="input"
          value={form.summary || ''}
          onChange={(e) => setField('summary', e.target.value)}
        />
      </div>

      <div>
        <label className="label">About (longer)</label>
        <textarea
          rows={6}
          className="input"
          value={form.about || ''}
          onChange={(e) => setField('about', e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Location</label>
          <input
            className="input"
            value={form.location || ''}
            onChange={(e) => setField('location', e.target.value)}
          />
        </div>
        <div>
          <label className="label">Public email</label>
          <input
            className="input"
            value={form.email || ''}
            onChange={(e) => setField('email', e.target.value)}
          />
        </div>
        <div>
          <label className="label">Avatar URL</label>
          <input
            className="input"
            value={form.avatarUrl || ''}
            onChange={(e) => setField('avatarUrl', e.target.value)}
          />
        </div>
        <div>
          <label className="label">Resume URL</label>
          <input
            className="input"
            value={form.resumeUrl || ''}
            onChange={(e) => setField('resumeUrl', e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {Object.keys(emptySocials).map((k) => (
          <div key={k}>
            <label className="label">{k}</label>
            <input
              className="input"
              value={form.socials[k] || ''}
              onChange={(e) => setSocial(k, e.target.value)}
            />
          </div>
        ))}
      </div>

      <div>
        <label className="label">Skills (comma separated)</label>
        <textarea
          rows={2}
          className="input"
          value={form.skills}
          onChange={(e) => setField('skills', e.target.value)}
        />
      </div>

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? 'Saving…' : 'Save profile'}
      </button>
    </form>
  );
}
