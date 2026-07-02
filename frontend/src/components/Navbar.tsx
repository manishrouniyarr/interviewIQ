import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {LogOut, Menu, X, LayoutDashboard, Mic, BarChart2, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { to: '/dashboard',      label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/mock-interview', label: 'Mock Interview', icon: Mic },
  { to: '/analytics',      label: 'Analytics',      icon: BarChart2 },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(() => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('theme') === 'dark';
  }
  return false;
});

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="container mx-auto px-6 h-16 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center">
            <span className="text-white dark:text-slate-900 text-xs font-black tracking-tight">IQ</span>
          </div>
          <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">InterviewIQ</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(to)
                  ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              {label}
              {isActive(to) && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
              )}
            </Link>
          ))}
        </div>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={() => setDark(!dark)}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
            title="Toggle theme"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User pill */}
          <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5">
            <div className="w-7 h-7 bg-slate-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-slate-900 text-xs font-bold">
              {initials}
            </div>
            <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">{user?.name}</span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Logout"
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:border-red-200 dark:hover:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile right */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => setDark(!dark)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-slate-900 text-xs font-bold">
            {initials}
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-4 flex flex-col gap-1">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive(to)
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-slate-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-slate-900 text-xs font-bold">
                {initials}
              </div>
              <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-medium transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}


// import { useState } from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { Sparkles, LogOut, Menu, X } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';

// export default function Navbar() {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [menuOpen, setMenuOpen] = useState(false);

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   const initials = user?.name
//     ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
//     : '?';

//   const isActive = (path: string) => location.pathname === path;

//   const navLinkClass = (path: string) =>
//     `font-medium transition ${
//       isActive(path)
//         ? 'text-slate-100 font-semibold'
//         : 'text-slate-400 hover:text-slate-100'
//     }`;

//   return (
//     <nav className="bg-slate-900 border-b border-slate-800">
//       <div className="container mx-auto px-6 py-4 flex justify-between items-center">
//         {/* Logo */}
//         <Link to="/" className="flex items-center gap-2 flex-shrink-0">
//           <Sparkles className="w-6 h-6 text-white" />
//           <span className="text-xl font-semibold text-slate-100">InterviewIQ</span>
//         </Link>

//         {/* Desktop Nav */}
//         <div className="hidden md:flex items-center gap-8">
//           <Link to="/dashboard" className={navLinkClass('/dashboard')}>Dashboard</Link>
//           <Link to="/mock-interview" className={navLinkClass('/mock-interview')}>Mock Interview</Link>
//           <Link to="/analytics" className={navLinkClass('/analytics')}>Analytics</Link>

//           <div className="w-px h-5 bg-slate-700" />

//           <div className="flex items-center gap-3">
//             <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
//               {initials}
//             </div>
//             <span className="text-slate-300 text-sm font-medium">{user?.name}</span>
//             <button
//               onClick={handleLogout}
//               className="w-9 h-9 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center hover:bg-red-900/40 hover:border-red-700 transition"
//               title="Logout"
//             >
//               <LogOut className="w-4 h-4 text-slate-400" />
//             </button>
//           </div>
//         </div>

//         {/* Mobile: avatar + hamburger */}
//         <div className="flex md:hidden items-center gap-3">
//           <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
//             {initials}
//           </div>
//           <button
//             onClick={() => setMenuOpen(!menuOpen)}
//             className="text-slate-300 hover:text-slate-100 transition"
//           >
//             {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//           </button>
//         </div>
//       </div>

//       {/* Mobile Dropdown Menu */}
//       {menuOpen && (
//         <div className="md:hidden bg-slate-800 border-t border-slate-700 px-6 py-4 flex flex-col gap-4">
//           <Link
//             to="/dashboard"
//             className={navLinkClass('/dashboard')}
//             onClick={() => setMenuOpen(false)}
//           >
//             Dashboard
//           </Link>
//           <Link
//             to="/mock-interview"
//             className={navLinkClass('/mock-interview')}
//             onClick={() => setMenuOpen(false)}
//           >
//             Mock Interview
//           </Link>
//           <Link
//             to="/analytics"
//             className={navLinkClass('/analytics')}
//             onClick={() => setMenuOpen(false)}
//           >
//             Analytics
//           </Link>

//           <div className="border-t border-slate-700 pt-4 flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
//                 {initials}
//               </div>
//               <span className="text-slate-300 text-sm font-medium">{user?.name}</span>
//             </div>
//             <button
//               onClick={handleLogout}
//               className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-medium transition"
//             >
//               <LogOut className="w-4 h-4" />
//               Logout
//             </button>
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// }