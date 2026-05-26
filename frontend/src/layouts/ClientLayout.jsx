import React, { Suspense, useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Bell,
  Building2,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Menu,
  Moon,
  Search,
  Sun,
  User,
  Wrench,
  X,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import useAuth from '../hooks/useAuth.js';

const navItems = [
  { label: 'Dashboard', to: '/client/dashboard', icon: LayoutDashboard },
  { label: 'My Properties', to: '/client/properties', icon: Building2 },
  { label: 'Maintenance', to: '/client/maintenance', icon: Wrench },
  { label: 'Documents', to: '/client/documents', icon: FileText },
  { label: 'Support', to: '/client/support', icon: HelpCircle },
  { label: 'Profile', to: '/client/profile', icon: User },
];

function Sidebar({ onNavigate }) {
  return (
    <aside className="flex h-full flex-col border-r border-brand-100/80 bg-white/90 px-4 py-5 backdrop-blur-xl dark:border-brand-700/50 dark:bg-brand-surface-dark/95">
      <div className="px-3">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-accent">APMC</p>
        <h1 className="mt-1 text-xl font-bold text-brand-primary dark:text-white">Client Portal</h1>
      </div>
      <nav className="mt-8 space-y-1">
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) => `dashboard-sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto rounded-2xl bg-gradient-brand p-4 text-white shadow-brand-primary">
        <p className="text-sm font-semibold">Need help?</p>
        <p className="mt-1 text-xs text-white/75">Submit requests and track updates in Support.</p>
      </div>
    </aside>
  );
}

export default function ClientLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { logout, verify } = useAuth('client');
  const navigate = useNavigate();

  useEffect(() => {
    verify('client').then((isClient) => {
      if (!isClient) navigate('/portal', { replace: true });
    });
  }, [navigate, verify]);

  const handleLogout = () => {
    logout('client');
    navigate('/portal', { replace: true });
  };

  return (
    <div className="min-h-screen bg-brand-background-alt text-brand-text dark:bg-brand-dark dark:text-slate-100">
      <div className="fixed inset-y-0 left-0 z-30 hidden w-72 lg:block">
        <Sidebar />
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
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-brand-100/80 bg-white/80 px-4 py-3 backdrop-blur-xl dark:border-brand-700/50 dark:bg-brand-dark/85 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="rounded-full p-2 text-brand-primary hover:bg-brand-50 dark:text-brand-accent dark:hover:bg-brand-800/50 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative max-w-xl flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-muted" />
              <input
                type="search"
                placeholder="Search requests, documents, properties..."
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
          <Suspense fallback={<div className="flex min-h-[40vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" /></div>}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
