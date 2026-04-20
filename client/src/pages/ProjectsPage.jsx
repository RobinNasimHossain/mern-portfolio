import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectsApi } from '../api/endpoints.js';

export function ProjectsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectsApi
      .list()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="section">
      <h1 className="text-4xl font-bold text-white">Projects</h1>
      <p className="mt-2 text-slate-400">Everything I've built and open-sourced.</p>

      {loading ? (
        <p className="mt-8 text-slate-400">Loading…</p>
      ) : items.length === 0 ? (
        <p className="mt-8 text-slate-400">No projects yet.</p>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <Link
              key={p._id}
              to={`/projects/${p.slug}`}
              className="card group transition hover:border-brand-500/60"
            >
              {p.featured && (
                <span className="chip mb-3 bg-brand-500/20 text-brand-200">Featured</span>
              )}
              <h3 className="text-lg font-semibold text-white group-hover:text-brand-300">
                {p.title}
              </h3>
              <p className="mt-2 text-sm text-slate-400">{p.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {p.tech.map((t) => (
                  <span key={t} className="chip">
                    {t}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
