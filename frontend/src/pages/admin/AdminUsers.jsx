import React, { useEffect, useMemo, useState } from 'react';
import { Trash2, UserPlus, X } from 'lucide-react';
import { adminTables } from '../../data/mockPortal.js';
import useApi from '../../hooks/useApi.js';

const initialForm = {
  name: '',
  email: '',
  username: '',
  phone: '',
  role: 'client',
  status: 'active',
  password: '',
};

function formatLabel(value) {
  if (!value) return 'Unknown';
  return String(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatLastSeen(value) {
  if (!value) return 'Never';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function normalizeUser(row) {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    email: row.email,
    status: row.status,
    lastSeen: row.last_login_at || row.lastSeen,
  };
}

function statusClass(status) {
  if (status === 'active') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300';
  if (status === 'suspended') return 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300';
  return 'bg-brand-100 text-brand-primary dark:bg-brand-800 dark:text-brand-accent';
}

export default function AdminUsers() {
  const [token] = useState(() => (typeof window === 'undefined' ? null : localStorage.getItem('admin_token')));
  const api = useApi(token);
  const [users, setUsers] = useState(adminTables.users);
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');

  const rows = useMemo(() => users.map(normalizeUser), [users]);

  const loadUsers = () => {
    setLoading(true);
    api.get('/users')
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setUsers(adminTables.users);
        setMessage('Showing preview users because the user API is unavailable.');
        setMessageType('info');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, [api]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const openForm = () => {
    setForm(initialForm);
    setMessage('');
    setShowForm(true);
  };

  const closeForm = () => {
    setForm(initialForm);
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await api.post('/users', {
        name: form.name.trim(),
        email: form.email.trim(),
        username: form.username.trim() || undefined,
        phone: form.phone.trim() || undefined,
        role: form.role,
        status: form.status,
        password: form.password,
      });

      closeForm();
      setMessage('User access created. The user can now sign in with the temporary password.');
      setMessageType('success');
      loadUsers();
    } catch (error) {
      setMessage(error.message || 'Unable to create user access.');
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (!user?.id) {
      setMessage('This preview user cannot be deleted until the API data is available.');
      setMessageType('error');
      return;
    }

    const confirmed = window.confirm(`Delete access for ${user.name}? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(user.id);
    setMessage('');

    try {
      await api.delete(`/users/${user.id}`);
      setMessage('User access deleted.');
      setMessageType('success');
      loadUsers();
    } catch (error) {
      setMessage(error.message || 'Unable to delete user access.');
      setMessageType('error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent">Access Control</p>
          <h2 className="mt-2 text-3xl font-bold text-brand-primary dark:text-white">Users</h2>
          <p className="mt-2 text-sm text-brand-text-muted dark:text-slate-400">
            Manage who can access the admin and client portals.
          </p>
        </div>
        <button className="btn-primary" onClick={openForm}>
          <UserPlus className="h-4 w-4" /> Invite User
        </button>
      </div>

      {message && (
        <p className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
          messageType === 'error'
            ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
            : 'bg-brand-50 text-brand-primary dark:bg-brand-800/40 dark:text-brand-accent'
        }`}
        >
          {message}
        </p>
      )}

      {showForm && (
        <div className="glass-card p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-brand-primary dark:text-white">Invite User</h3>
              <p className="text-sm text-brand-text-muted dark:text-slate-400">
                Create portal access with a role, status, and temporary password.
              </p>
            </div>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-full p-2 text-brand-primary hover:bg-brand-50 dark:text-brand-accent dark:hover:bg-brand-800/50"
              aria-label="Close invite user form"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Name</span>
              <input
                required
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Email</span>
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Username</span>
              <input
                value={form.username}
                onChange={(event) => updateField('username', event.target.value)}
                placeholder="Defaults to email"
                className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-brand-text-muted focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Phone</span>
              <input
                value={form.phone}
                onChange={(event) => updateField('phone', event.target.value)}
                className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Role</span>
              <select
                value={form.role}
                onChange={(event) => updateField('role', event.target.value)}
                className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
              >
                <option value="client">Client</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Status</span>
              <select
                value={form.status}
                onChange={(event) => updateField('status', event.target.value)}
                className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </label>
            <label className="block md:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Temporary Password</span>
              <input
                required
                type="password"
                value={form.password}
                onChange={(event) => updateField('password', event.target.value)}
                className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
              />
            </label>
            <div className="flex justify-end gap-3 md:col-span-2">
              <button type="button" onClick={closeForm} className="btn-outline">
                Cancel
              </button>
              <button disabled={saving} className="btn-primary disabled:opacity-60" type="submit">
                {saving ? 'Creating...' : 'Create Access'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-brand-50 text-xs uppercase tracking-wide text-brand-text-muted dark:bg-brand-800/40 dark:text-slate-400">
              <tr>{['Name', 'Role', 'Email', 'Status', 'Last Seen', 'Actions'].map((head) => <th key={head} className="px-5 py-3">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-brand-100 dark:divide-brand-700/50">
              {rows.map((row) => (
                <tr key={row.id || row.email} className="hover:bg-brand-50/70 dark:hover:bg-brand-800/30">
                  <td className="px-5 py-4 font-semibold text-brand-primary dark:text-white">{row.name}</td>
                  <td className="px-5 py-4">{formatLabel(row.role)}</td>
                  <td className="px-5 py-4 text-brand-text-muted dark:text-slate-400">{row.email}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(row.status?.toLowerCase())}`}>
                      {formatLabel(row.status)}
                    </span>
                  </td>
                  <td className="px-5 py-4">{formatLastSeen(row.lastSeen)}</td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => handleDelete(row)}
                      disabled={deletingId === row.id}
                      className="inline-flex items-center gap-1 rounded-full border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-500/40 dark:text-rose-300 dark:hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {deletingId === row.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td className="px-5 py-6 text-center text-brand-text-muted dark:text-slate-400" colSpan={6}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {loading && (
            <p className="px-5 py-4 text-sm text-brand-text-muted dark:text-slate-400">Loading users...</p>
          )}
        </div>
      </div>
    </div>
  );
}
