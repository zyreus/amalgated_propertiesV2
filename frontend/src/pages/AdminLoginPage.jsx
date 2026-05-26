import React, { useState } from 'react';
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import logo from '../assets/apmc.png';

const AdminLoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const username = email.includes('@') ? email.split('@')[0] : email;
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, remember }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed.');
        setLoading(false);
        return;
      }

      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_username', data.admin.username);
      localStorage.setItem('admin_email', email);
      onLogin(data.token, data.admin);
    } catch {
      setError('Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#071426] px-4 py-10 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,124,255,0.28),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.18),transparent_34%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/60 to-transparent" />

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1fr_0.86fr] lg:items-center">
          <section className="hidden lg:block">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-sky-200 backdrop-blur">
              <ShieldCheck className="h-4 w-4" />
              Secure Admin Access
            </div>
            <h1 className="mt-8 max-w-2xl text-5xl font-bold leading-tight tracking-tight">
              Enterprise command center for APMC operations.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
              Dedicated administrator authentication for portfolio, CRM, analytics, leasing, and maintenance controls.
            </p>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {[
                ['Isolated', 'Admin session'],
                ['Protected', 'Route access'],
                ['Audited', 'Operations UI'],
              ].map(([label, detail]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
                  <p className="text-lg font-bold text-white">{label}</p>
                  <p className="mt-1 text-xs text-slate-400">{detail}</p>
                </div>
              ))}
            </div>
          </section>

          <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-white/[0.08] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
            <div className="mb-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                <img src={logo} alt="APMC" className="h-11 w-11 object-contain" />
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.26em] text-sky-200">APMC Admin</p>
              <h2 className="mt-2 text-3xl font-bold">Administrator Login</h2>
              <p className="mt-2 text-sm text-slate-400">Secure access for authorized APMC personnel only.</p>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300 ring-1 ring-red-500/20">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {error}
              </div>
            )}

            <div className="mb-5">
              <label className="mb-1.5 block text-sm font-medium text-slate-200">Admin email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoFocus
                  placeholder="admin@theamalgatedproperties.com"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/35 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300/70 focus:ring-2 focus:ring-sky-300/20"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="mb-1.5 block text-sm font-medium text-slate-200">Password</label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/35 py-3 pl-10 pr-11 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300/70 focus:ring-2 focus:ring-sky-300/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-200"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="mb-6 flex items-center justify-between gap-4 text-sm">
              <label className="inline-flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-slate-950 text-sky-500 focus:ring-sky-400"
                />
                Remember me
              </label>
              <a href="mailto:support@theamalgatedproperties.com?subject=Admin%20password%20reset" className="font-semibold text-sky-200 transition hover:text-white">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-400 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-sky-500/20 transition hover:bg-sky-300 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Access admin dashboard'
              )}
            </button>

            <p className="mt-5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-xs leading-5 text-slate-400">
              Access is restricted to authorized APMC administrators. All administrative sessions are isolated from the client portal.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
