export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-slate-400 sm:flex-row">
        <p>© {year} Robin Nasim Hossain. All rights reserved.</p>
        <p>
          Built with <span className="text-brand-300">React · Express · MongoDB</span>
        </p>
      </div>
    </footer>
  );
}
