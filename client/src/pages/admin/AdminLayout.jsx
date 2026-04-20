import { NavLink, Outlet } from 'react-router-dom';

const tabs = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/profile', label: 'Profile' },
  { to: '/admin/projects', label: 'Projects' },
  { to: '/admin/posts', label: 'Blog posts' },
  { to: '/admin/messages', label: 'Messages' },
  { to: '/admin/password', label: 'Password' },
];

export function AdminLayout() {
  return (
    <div className="section">
      <h1 className="text-3xl font-bold text-white">Admin dashboard</h1>
      <nav className="mt-6 flex flex-wrap gap-2 border-b border-slate-800 pb-4">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm font-medium ${
                isActive
                  ? 'bg-brand-500 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}
