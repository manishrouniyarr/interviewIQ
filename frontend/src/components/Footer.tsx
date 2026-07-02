export default function Footer() {
  return (
    <footer className="text-center py-3 text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-800 flex-shrink-0 bg-white dark:bg-slate-950 transition-colors">
      {'© '}{new Date().getFullYear()}{' Manish Rouniyar '}
      <span className="mx-1">·</span>
      <a
        href="https://manishrouniyar.vercel.app"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-slate-600 dark:hover:text-slate-300 transition"
      >
        Portfolio
      </a>
    </footer>
  );
}