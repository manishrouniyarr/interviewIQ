import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard, MessageSquare, BarChart2,
  Settings, LogOut, ChevronLeft, ChevronRight, Menu, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

const navItems = [
  { path: '/dashboard',      label: 'Dashboard',     icon: LayoutDashboard },
  { path: '/mock-interview', label: 'Mock Interview', icon: MessageSquare },
  { path: '/analytics',      label: 'Analytics',      icon: BarChart2 },
  { path: '/settings',       label: 'Settings',       icon: Settings },
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
      <div className={`flex items-center gap-2.5 px-5 py-5 border-b border-slate-100 dark:border-slate-800 ${collapsed ? 'justify-center px-3' : ''}`}>
        <div className="w-7 h-7 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center flex-shrink-0">
  <span className="text-white dark:text-slate-900 text-xs font-black tracking-tight">IQ</span>
</div>
        {!collapsed && (
          <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">InterviewIQ</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? label : ''}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                collapsed ? 'justify-center' : ''
              } ${
                isActive
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-500' : ''}`} />
              {!collapsed && <span>{label}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 bg-blue-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className={`px-3 py-4 border-t border-slate-100 dark:border-slate-800 ${collapsed ? 'flex flex-col items-center gap-3' : ''}`}>
        {!collapsed ? (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="w-7 h-7 bg-slate-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-slate-900 text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition flex-shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="w-7 h-7 bg-slate-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-slate-900 text-xs font-bold">
              {initials}
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors">

      {/* Desktop Sidebar */}
      <aside className={`relative hidden md:flex flex-col h-screen bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex-shrink-0 ${collapsed ? 'w-[72px]' : 'w-60'}`}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-8 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition z-10 shadow-sm"
        >
          {collapsed
            ? <ChevronRight className="w-3 h-3 text-slate-500" />
            : <ChevronLeft className="w-3 h-3 text-slate-500" />
          }
        </button>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex flex-col w-60 h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 z-50">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-900 dark:bg-white rounded-md flex items-center justify-center">
              <span className="text-white dark:text-slate-900 text-xs font-black tracking-tight">IQ</span>
            </div>
            <span className="text-base font-bold text-slate-900 dark:text-white">InterviewIQ</span>
          </div>
          <div className="w-7 h-7 bg-slate-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-slate-900 text-xs font-bold">
            {initials}
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}