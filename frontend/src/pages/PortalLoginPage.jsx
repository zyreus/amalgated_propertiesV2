import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Lock, Mail, ShieldCheck } from 'lucide-react';
import useAuth from '../hooks/useAuth.js';

export default function PortalLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const auth = useAuth('client');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    const result = await auth.login({ email, password, role: 'client' });
    if (result.ok) {
      navigate('/client/dashboard', { replace: true });
      return;
    }
    setMessage('Unable to sign in. Please check your credentials.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 px-4 py-10 dark:from-brand-dark dark:via-brand-surface-dark dark:to-brand-900">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 shadow-soft backdrop-blur-xl dark:border-brand-700/50 dark:bg-brand-surface-dark/80 lg:grid-cols-[1fr_0.9fr]">
          <section className="hidden bg-gradient-brand p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                <Building2 className="h-7 w-7" />
              </div>
              <h1 className="mt-8 text-4xl font-bold leading-tight">One secure portal for property operations.</h1>
              <p className="mt-4 max-w-md text-white/75">
                Access lease records, maintenance requests, invoices, announcements, operational updates,
                and support services through the APMC client workspace.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-2xl font-bold">88.5%</p>
                <p className="text-white/70">Occupancy</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-2xl font-bold">100+</p>
                <p className="text-white/70">Contracts</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-2xl font-bold">24h</p>
                <p className="text-white/70">SLA</p>
              </div>
            </div>
          </section>

          <section className="flex items-center p-6 sm:p-10 lg:min-h-[620px]">
            <div className="mx-auto max-w-md">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-primary dark:bg-brand-accent/10 dark:text-brand-accent">
                <ShieldCheck className="h-4 w-4" />
                Client Portal
              </div>
              <h2 className="mt-5 text-3xl font-bold text-brand-primary dark:text-white">Client Login</h2>
              <p className="mt-3 text-sm leading-6 text-brand-text-muted dark:text-slate-300">
                Access lease records, maintenance requests, invoices, announcements, operational updates,
                and support services through the APMC client workspace.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Email</span>
                  <span className="relative block">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-muted" />
                    <input
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      type="email"
                      required
                      placeholder="client@apmc.test"
                      className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 pl-10 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
                    />
                  </span>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Password</span>
                  <span className="relative block">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-muted" />
                    <input
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      type="password"
                      required
                      placeholder="Enter password"
                      className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 pl-10 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
                    />
                  </span>
                </label>
                {message && <p className="text-sm text-rose-600">{message}</p>}
                {auth.error && (
                  <p className="rounded-xl bg-brand-50 px-4 py-3 text-xs text-brand-text-muted dark:bg-brand-800/40 dark:text-slate-300">
                    API login unavailable, using mock portal session for preview.
                  </p>
                )}
                <button disabled={auth.loading} className="btn-primary mt-2 w-full disabled:opacity-60" type="submit">
                  {auth.loading ? 'Signing in...' : 'Sign in to your client workspace'}
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
