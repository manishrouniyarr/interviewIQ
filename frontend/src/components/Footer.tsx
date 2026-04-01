export default function Footer() {
  return (
    <footer className="text-center py-3 text-xs text-slate-500 border-t border-slate-800 flex-shrink-0">
  {'© '}{new Date().getFullYear()}{' Manish Rouniyar '}
  <span className="mx-1">·</span>

  <a
    href="https://github.com/manishrouniyarr"
    target="_blank"
    rel="noopener noreferrer"
    className="hover:text-slate-300 transition"
  >
    GitHub
  </a>
</footer>
  );
}