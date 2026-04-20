import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="section text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand-300">404</p>
      <h1 className="mt-2 text-4xl font-bold text-white">Page not found</h1>
      <p className="mt-2 text-slate-400">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-6">
        Back home
      </Link>
    </div>
  );
}
