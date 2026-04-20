import { useEffect, useState } from 'react';
import { profileApi } from '../api/endpoints.js';

export function AboutPage() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    profileApi.get().then(setProfile).catch(() => {});
  }, []);

  if (!profile) {
    return (
      <div className="section text-slate-400">Loading profile…</div>
    );
  }

  return (
    <div className="section">
      <h1 className="text-4xl font-bold text-white">About me</h1>
      <p className="mt-4 max-w-3xl text-lg text-slate-300 whitespace-pre-line">
        {profile.about || profile.summary}
      </p>

      {profile.skills?.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-white">Skills</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.skills.map((s) => (
              <span key={s} className="chip">
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {profile.experience?.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-white">Experience</h2>
          <div className="mt-4 space-y-4">
            {profile.experience.map((e, i) => (
              <div key={i} className="card">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg font-semibold text-white">
                    {e.role} · <span className="text-brand-300">{e.company}</span>
                  </h3>
                  <span className="text-sm text-slate-400">
                    {e.start} — {e.end || 'Present'}
                  </span>
                </div>
                {e.description && (
                  <p className="mt-2 text-sm text-slate-300">{e.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {profile.education?.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-white">Education</h2>
          <div className="mt-4 space-y-4">
            {profile.education.map((e, i) => (
              <div key={i} className="card">
                <h3 className="text-lg font-semibold text-white">{e.school}</h3>
                <p className="text-sm text-slate-300">{e.degree}</p>
                <p className="mt-1 text-sm text-slate-400">
                  {e.start} — {e.end || 'Present'}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
