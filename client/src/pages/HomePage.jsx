import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { profileApi, projectsApi } from '../api/endpoints.js';

export function HomePage() {
  const [profile, setProfile] = useState(null);
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    profileApi.get().then(setProfile).catch(() => {});
    projectsApi
      .list({ featured: 'true' })
      .then(setFeatured)
      .catch(() => {});
  }, []);

  return (
    <>
      <section className="section text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-brand-300">
          {profile?.headline || 'Full-Stack Software Engineer'}
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
          Hi, I'm{' '}
          <span className="text-brand-400">{profile?.name || 'Robin Nasim Hossain'}</span>.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
          {profile?.summary ||
            'Self-taught software engineer building production-grade web apps with the MERN stack.'}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/projects" className="btn-primary">
            View my work
          </Link>
          <Link to="/contact" className="btn-secondary">
            Get in touch
          </Link>
        </div>
        {profile?.skills?.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {profile.skills.slice(0, 10).map((s) => (
              <span key={s} className="chip">
                {s}
              </span>
            ))}
          </div>
        )}
      </section>

      {featured.length > 0 && (
        <section className="section">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white">Featured projects</h2>
              <p className="mt-2 text-slate-400">
                A few things I've built recently.
              </p>
            </div>
            <Link to="/projects" className="text-sm font-semibold">
              See all →
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <Link
                key={p._id}
                to={`/projects/${p.slug}`}
                className="card group transition hover:border-brand-500/60"
              >
                <h3 className="text-lg font-semibold text-white group-hover:text-brand-300">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm text-slate-400">{p.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {p.tech.slice(0, 4).map((t) => (
                    <span key={t} className="chip">
                      {t}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
