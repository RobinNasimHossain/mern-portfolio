import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { projectsApi } from '../api/endpoints.js';

export function ProjectDetailPage() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    projectsApi
      .get(slug)
      .then(setProject)
      .catch((e) => setError(e?.response?.data?.message || 'Not found'));
  }, [slug]);

  if (error) {
    return (
      <div className="section">
        <p className="text-slate-400">{error}</p>
        <Link to="/projects" className="mt-4 inline-block">
          ← Back to projects
        </Link>
      </div>
    );
  }

  if (!project) {
    return <div className="section text-slate-400">Loading…</div>;
  }

  return (
    <article className="section max-w-3xl">
      <Link to="/projects" className="text-sm">
        ← Back to projects
      </Link>
      <h1 className="mt-4 text-4xl font-bold text-white">{project.title}</h1>
      <p className="mt-2 text-slate-400">{project.summary}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {project.tech.map((t) => (
          <span key={t} className="chip">
            {t}
          </span>
        ))}
      </div>

      {project.description && (
        <div className="mt-8 whitespace-pre-line leading-7 text-slate-200">
          {project.description}
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        {project.repoUrl && (
          <a href={project.repoUrl} target="_blank" rel="noreferrer" className="btn-secondary">
            View repo
          </a>
        )}
        {project.liveUrl && (
          <a href={project.liveUrl} target="_blank" rel="noreferrer" className="btn-primary">
            Live demo
          </a>
        )}
      </div>
    </article>
  );
}
