import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { postsApi } from '../api/endpoints.js';

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function BlogPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    postsApi
      .list()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="section">
      <h1 className="text-4xl font-bold text-white">Blog</h1>
      <p className="mt-2 text-slate-400">
        Notes on what I'm learning and building.
      </p>

      {loading ? (
        <p className="mt-8 text-slate-400">Loading…</p>
      ) : items.length === 0 ? (
        <p className="mt-8 text-slate-400">No posts yet.</p>
      ) : (
        <div className="mt-10 space-y-6">
          {items.map((p) => (
            <Link
              key={p._id}
              to={`/blog/${p.slug}`}
              className="card block transition hover:border-brand-500/60"
            >
              <h2 className="text-xl font-semibold text-white">{p.title}</h2>
              <p className="mt-1 text-sm text-slate-400">
                {formatDate(p.publishedAt || p.createdAt)}
                {p.tags?.length > 0 && <> · {p.tags.join(' · ')}</>}
              </p>
              {p.excerpt && <p className="mt-3 text-slate-300">{p.excerpt}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
