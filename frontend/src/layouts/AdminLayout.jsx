import React, { Suspense, useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  Building2,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Moon,
  Newspaper,
  Search,
  Settings,
  Sun,
  Users,
  Wrench,
  X,
  FileText,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import useAuth from '../hooks/useAuth.js';

const navItems = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Properties', to: '/admin/properties', icon: Building2 },
  { label: 'News', to: '/admin/news', icon: Newspaper },
  { label: 'Leases', to: '/admin/leases', icon: FileText },
  { label: 'Maintenance', to: '/admin/maintenance', icon: Wrench },
  { label: 'CRM & Chat', to: '/admin/crm', icon: MessageSquare },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

function Sidebar({ collapsed = false, menuLabel = 'Toggle navigation', onNavigate, onToggle }) {
  return (
    <aside className="flex h-full flex-col border-r border-brand-100/80 bg-white/90 px-4 py-5 backdrop-blur-xl dark:border-brand-700/50 dark:bg-brand-surface-dark/95">
      <div className={`flex items-start ${collapsed ? 'justify-center' : 'justify-between px-3'}`}>
        {!collapsed && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">APMC</p>
            <h1 className="mt-1 text-xl font-bold text-brand-primary dark:text-white">Admin Portal</h1>
          </div>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="rounded-full p-2 text-brand-primary transition hover:bg-brand-50 dark:text-brand-accent dark:hover:bg-brand-800/50"
          aria-label={menuLabel}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
      <nav className="mt-8 space-y-1">
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) => `dashboard-sidebar-link ${collapsed ? 'justify-center px-3' : ''} ${isActive ? 'active' : ''}`}
            title={collapsed ? label : undefined}
          >
            <Icon className="h-4 w-4" />
            {!collapsed && label}
          </NavLink>
        ))}
      </nav>
      {!collapsed && (
        <div className="mt-auto rounded-2xl bg-brand-primary p-4 text-white shadow-brand-primary">
          <p className="text-sm font-semibold">Portfolio Health</p>
          <p className="mt-1 text-xs text-white/75">94.2% occupied across managed assets.</p>
        </div>
      )}
    </aside>
  );
}

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth('admin');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin', { replace: true });
      return;
    }

    fetch('/api/admin/verify', {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      if (!res.ok) navigate('/admin', { replace: true });
    }).catch(() => navigate('/admin', { replace: true }));
  }, [navigate]);

  const handleLogout = () => {
    logout('admin');
    localStorage.removeItem('admin_username');
    navigate('/admin', { replace: true });
  };

  return (
    <div className="min-h-screen bg-brand-background-alt text-brand-text dark:bg-brand-dark dark:text-slate-100">
      <div className={`fixed inset-y-0 left-0 z-30 hidden transition-[width] duration-200 lg:block ${sidebarCollapsed ? 'w-20' : 'w-72'}`}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((current) => !current)}
        />
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-brand-dark/50" onClick={() => setDrawerOpen(false)} aria-label="Close menu" />
          <div className="relative h-full w-72">
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 text-brand-primary shadow-card dark:bg-brand-surface-dark dark:text-white"
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </button>
            <Sidebar
              menuLabel="Close navigation"
              onNavigate={() => setDrawerOpen(false)}
              onToggle={() => setDrawerOpen(false)}
            />
          </div>
        </div>
      )}

      <div className={`transition-[padding] duration-200 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        <header className="sticky top-0 z-20 border-b border-brand-100/80 bg-white/80 px-4 py-3 backdrop-blur-xl dark:border-brand-700/50 dark:bg-brand-dark/85 sm:px-6">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="rounded-full p-2 text-brand-primary hover:bg-brand-50 dark:text-brand-accent dark:hover:bg-brand-800/50 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative w-full max-w-xl flex-none">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-muted" />
              <input
                type="search"
                placeholder="Search properties, tenants, requests..."
                className="w-full rounded-full border border-brand-100 bg-white py-2 pl-10 pr-4 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15 dark:border-brand-700 dark:bg-brand-surface-dark"
              />
            </div>
            <button className="relative rounded-full p-2 text-brand-primary hover:bg-brand-50 dark:text-brand-accent dark:hover:bg-brand-800/50" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
            </button>
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-brand-primary hover:bg-brand-50 dark:text-brand-accent dark:hover:bg-brand-800/50"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button onClick={handleLogout} className="hidden rounded-full border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-primary hover:bg-brand-50 dark:border-brand-700 dark:text-brand-accent dark:hover:bg-brand-800/50 sm:inline-flex">
              Logout
            </button>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Suspense
            fallback={(
              <div className="flex min-h-[40vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
              </div>
            )}
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
