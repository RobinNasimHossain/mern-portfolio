import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { messagesApi, postsApi, projectsApi } from '../../api/endpoints.js';

function Stat({ label, value, to }) {
  return (
    <Link to={to} className="card transition hover:border-brand-500/60">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </Link>
  );
}

export function AdminDashboard() {
  const [stats, setStats] = useState({ projects: 0, posts: 0, unread: 0 });

  useEffect(() => {
    Promise.all([
      projectsApi.list(),
      postsApi.list({ includeDrafts: 'true' }),
      messagesApi.list().catch(() => []),
    ]).then(([projects, posts, messages]) => {
      setStats({
        projects: projects.length,
        posts: posts.length,
        unread: messages.filter((m) => !m.read).length,
      });
    });
  }, []);

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      <Stat label="Projects" value={stats.projects} to="/admin/projects" />
      <Stat label="Blog posts" value={stats.posts} to="/admin/posts" />
      <Stat label="Unread messages" value={stats.unread} to="/admin/messages" />
    </div>
  );
}
