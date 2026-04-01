import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) =>
    `font-medium transition ${
      isActive(path)
        ? 'text-slate-100 font-semibold'
        : 'text-slate-400 hover:text-slate-100'
    }`;

  return (
    <nav className="bg-slate-900 border-b border-slate-800">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <Sparkles className="w-6 h-6 text-white" />
          <span className="text-xl font-semibold text-slate-100">InterviewIQ</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/dashboard" className={navLinkClass('/dashboard')}>Dashboard</Link>
          <Link to="/mock-interview" className={navLinkClass('/mock-interview')}>Mock Interview</Link>
          <Link to="/analytics" className={navLinkClass('/analytics')}>Analytics</Link>

          <div className="w-px h-5 bg-slate-700" />

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {initials}
            </div>
            <span className="text-slate-300 text-sm font-medium">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="w-9 h-9 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center hover:bg-red-900/40 hover:border-red-700 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Mobile: avatar + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-slate-300 hover:text-slate-100 transition"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700 px-6 py-4 flex flex-col gap-4">
          <Link
            to="/dashboard"
            className={navLinkClass('/dashboard')}
            onClick={() => setMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            to="/mock-interview"
            className={navLinkClass('/mock-interview')}
            onClick={() => setMenuOpen(false)}
          >
            Mock Interview
          </Link>
          <Link
            to="/analytics"
            className={navLinkClass('/analytics')}
            onClick={() => setMenuOpen(false)}
          >
            Analytics
          </Link>

          <div className="border-t border-slate-700 pt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
              <span className="text-slate-300 text-sm font-medium">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-medium transition"
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