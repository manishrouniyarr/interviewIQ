import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
LayoutDashboard, MessageSquare, BarChart2,
  Settings, LogOut, ChevronLeft, ChevronRight, Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/mock-interview', label: 'Mock Interview', icon: MessageSquare },
  { path: '/analytics', label: 'Analytics', icon: BarChart2 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-5 py-6 border-b border-slate-800 ${collapsed ? 'justify-center px-3' : ''}`}>
        <svg width="40" height="40" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="28" height="28" rx="8" fill="#6366f1"/>
  <path d="M14 6L16.5 11.5H22L17.5 14.5L19.5 20L14 16.5L8.5 20L10.5 14.5L6 11.5H11.5L14 6Z" fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round"/>
  <circle cx="20" cy="8" r="2" fill="#a5b4fc"/>
</svg>
        {!collapsed && (
          <span className="text-lg font-bold text-slate-100">InterviewIQ</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? label : ''}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{label}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 bg-indigo-400 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className={`px-3 py-4 border-t border-slate-800 ${collapsed ? 'flex flex-col items-center gap-3' : ''}`}>
        {!collapsed ? (
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-100 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">

      {/* Desktop Sidebar */}
      <aside className={`relative hidden md:flex flex-col h-screen bg-slate-900 border-r border-slate-800 transition-all duration-300 flex-shrink-0 ${collapsed ? 'w-20' : 'w-64'}`}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-8 w-6 h-6 bg-slate-700 border border-slate-600 rounded-full flex items-center justify-center hover:bg-slate-600 transition z-10"
        >
          {collapsed
            ? <ChevronRight className="w-3 h-3 text-slate-300" />
            : <ChevronLeft className="w-3 h-3 text-slate-300" />
          }
        </button>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex flex-col w-64 h-full bg-slate-900 border-r border-slate-800 z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-4 bg-slate-900 border-b border-slate-800 flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="text-slate-300 hover:text-slate-100">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <svg width="40" height="40" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="28" height="28" rx="8" fill="#6366f1"/>
  <path d="M14 6L16.5 11.5H22L17.5 14.5L19.5 20L14 16.5L8.5 20L10.5 14.5L6 11.5H11.5L14 6Z" fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round"/>
  <circle cx="20" cy="8" r="2" fill="#a5b4fc"/>
</svg>
            <span className="text-base font-bold text-slate-100">InterviewIQ</span>
          </div>
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}