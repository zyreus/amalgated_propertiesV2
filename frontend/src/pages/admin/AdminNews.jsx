import React, { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import useApi, { apiRequest } from '../../hooks/useApi.js';
import { NEWS_UPDATED_EVENT } from '../../hooks/useNews.js';

const initialForm = {
  title: '',
  category: 'Company Update',
  excerpt: '',
  body: '',
  status: 'published',
  published_at: '',
};

const fallbackNews = [
  {
    title: 'APMC Expands Portfolio Visibility Across Key Regional Markets',
    category: 'Company Update',
    excerpt: 'The group continues to organize its real estate portfolio around better leasing access and stronger tenant support.',
    body: 'The group continues to organize its real estate portfolio around better leasing access and stronger tenant support.',
    status: 'published',
    published_at: 'May 2026',
  },
  {
    title: 'Why Strategic Property Management Matters for Growing Tenants',
    category: 'Insight',
    excerpt: 'Reliable property management helps businesses reduce downtime, plan occupancy, and protect long-term value.',
    body: 'Reliable property management helps businesses reduce downtime, plan occupancy, and protect long-term value.',
    status: 'published',
    published_at: 'April 2026',
  },
  {
    title: 'Commercial Leasing Demand Remains Active in Provincial Hubs',
    category: 'Market Notes',
    excerpt: 'Banks, service firms, and retail operators continue to seek dependable spaces in high-connectivity locations.',
    body: 'Banks, service firms, and retail operators continue to seek dependable spaces in high-connectivity locations.',
    status: 'published',
    published_at: 'March 2026',
  },
];

function clearNewsCache() {
  if (typeof window === 'undefined') return;

  Object.keys(localStorage)
    .filter((key) => key.startsWith('api-cache:/api/pm/announcements'))
    .forEach((key) => localStorage.removeItem(key));
  window.dispatchEvent(new Event(NEWS_UPDATED_EVENT));
}

function formatDate(value) {
  if (!value) return 'Not scheduled';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function toDateInput(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function newsToForm(item) {
  return {
    title: item.title || '',
    category: item.category || 'Company Update',
    excerpt: item.excerpt || '',
    body: item.body || '',
    status: item.status || 'published',
    published_at: toDateInput(item.published_at),
  };
}

function normalizeRow(item) {
  return {
    ...item,
    statusLabel: item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Published',
    publishedLabel: formatDate(item.published_at),
  };
}

export default function AdminNews() {
  const [token] = useState(() => (typeof window === 'undefined' ? null : localStorage.getItem('admin_token')));
  const api = useApi(token);
  const [items, setItems] = useState(fallbackNews);
  const [form, setForm] = useState(initialForm);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [message, setMessage] = useState('');

  const rows = useMemo(() => items.map(normalizeRow), [items]);

  const loadNews = () => {
    setLoading(true);
    api.get('/announcements')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setItems(data);
      })
      .catch(async () => {
        try {
          const publicNews = await apiRequest('/announcements/public');
          setItems(Array.isArray(publicNews) && publicNews.length > 0 ? publicNews : fallbackNews);
        } catch {
          setItems(fallbackNews);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNews();
  }, [api]);

  useEffect(() => {
    if (!showForm && !deleteTarget) return undefined;

    const handleEscape = (event) => {
      if (event.key !== 'Escape') return;
      if (deleteTarget && !deletingId) {
        setDeleteTarget(null);
        setMessage('');
      } else if (showForm && !saving) closeForm();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [showForm, deleteTarget, deletingId, saving]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const openAddForm = () => {
    setEditingItem(null);
    setForm(initialForm);
    setMessage('');
    setShowForm(true);
  };

  const openEditForm = (item) => {
    setEditingItem(item);
    setForm(newsToForm(item));
    setMessage(item?.id ? '' : 'This preview news item will be saved to the website news API when you click Save.');
    setShowForm(true);
  };

  const closeForm = () => {
    setEditingItem(null);
    setForm(initialForm);
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const payload = {
        title: form.title.trim(),
        category: form.category.trim() || 'Company Update',
        excerpt: form.excerpt.trim() || undefined,
        body: form.body.trim() || form.excerpt.trim(),
        status: form.status,
        audience: 'all',
        published_at: form.published_at ? new Date(form.published_at).toISOString() : undefined,
      };

      if (editingItem?.id) {
        await api.patch(`/announcements/${editingItem.id}`, payload);
      } else {
        await api.post('/announcements', payload);
      }

      clearNewsCache();
      closeForm();
      setMessage(editingItem?.id
        ? 'News updated. Published items will appear on the website news page.'
        : 'News added. Published items will appear on the website news page.');
      loadNews();
    } catch (error) {
      setMessage(error.message || 'Unable to save news.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item) => {
    if (!item?.id) {
      setMessage('This news item cannot be deleted until the API data is available.');
      return;
    }

    setMessage('');
    setDeleteTarget(item);
  };

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return;

    setDeletingId(deleteTarget.id);
    setMessage('');

    try {
      await api.delete(`/announcements/${deleteTarget.id}`);
      clearNewsCache();

      if (editingItem?.id === deleteTarget.id) {
        closeForm();
      }

      setDeleteTarget(null);
      setMessage('News deleted permanently. It will no longer appear on the website.');
      loadNews();
    } catch (error) {
      setMessage(error.message || 'Unable to delete news.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent">Website Content</p>
          <h2 className="mt-2 text-3xl font-bold text-brand-primary dark:text-white">News</h2>
        </div>
        <button className="btn-primary" onClick={openAddForm}>
          <Plus className="h-4 w-4" /> Add News
        </button>
      </div>

      {message && !showForm && !deleteTarget && (
        <p className="rounded-2xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-primary dark:bg-brand-800/40 dark:text-brand-accent">
          {message}
        </p>
      )}

      {showForm && (
        <div className="glass-card p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-brand-primary dark:text-white">
                {editingItem ? 'Edit Website News' : 'Add Website News'}
              </h3>
              <p className="text-sm text-brand-text-muted dark:text-slate-400">
                Published news appears on the homepage and news page.
              </p>
            </div>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-full p-2 text-brand-primary hover:bg-brand-50 dark:text-brand-accent dark:hover:bg-brand-800/50"
              aria-label="Close news form"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Title</span>
              <input
                required
                value={form.title}
                onChange={(event) => updateField('title', event.target.value)}
                className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Category</span>
              <input
                value={form.category}
                onChange={(event) => updateField('category', event.target.value)}
                className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Publish Date</span>
              <input
                type="date"
                value={form.published_at}
                onChange={(event) => updateField('published_at', event.target.value)}
                className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Status</span>
              <select
                value={form.status}
                onChange={(event) => updateField('status', event.target.value)}
                className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <label className="block md:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Excerpt</span>
              <textarea
                rows={2}
                value={form.excerpt}
                onChange={(event) => updateField('excerpt', event.target.value)}
                className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Body</span>
              <textarea
                required
                rows={5}
                value={form.body}
                onChange={(event) => updateField('body', event.target.value)}
                className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
              />
            </label>
            <div className="flex justify-end gap-3 md:col-span-2">
              <button type="button" onClick={closeForm} className="btn-outline">
                Cancel
              </button>
              <button disabled={saving} className="btn-primary disabled:opacity-60" type="submit">
                {saving ? 'Saving...' : editingItem?.id ? 'Update News' : 'Save News'}
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-news-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-brand-surface-dark">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 id="delete-news-title" className="text-lg font-bold text-brand-primary dark:text-white">
              Delete news
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-brand-text-muted dark:text-slate-400">
              Delete <span className="font-semibold text-brand-primary dark:text-white">"{deleteTarget.title}"</span>? This permanently removes it from the website and admin. It will not come back after refresh.
            </p>
            {message && (
              <p className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">
                {message}
              </p>
            )}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(null);
                  setMessage('');
                }}
                disabled={Boolean(deletingId)}
                className="btn-outline flex-1 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={Boolean(deletingId)}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deletingId ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-brand-50 text-xs uppercase tracking-wide text-brand-text-muted dark:bg-brand-800/40 dark:text-slate-400">
              <tr>{['Title', 'Category', 'Published', 'Status', 'Actions'].map((head) => <th key={head} className="px-5 py-3">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-brand-100 dark:divide-brand-700/50">
              {rows.map((row) => (
                <tr key={row.id || row.title} className="hover:bg-brand-50/70 dark:hover:bg-brand-800/30">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-brand-primary dark:text-white">{row.title}</p>
                    <p className="mt-1 max-w-xl text-xs text-brand-text-muted dark:text-slate-400">{row.excerpt || row.body}</p>
                  </td>
                  <td className="px-5 py-4">{row.category || 'Company Update'}</td>
                  <td className="px-5 py-4 text-brand-text-muted dark:text-slate-400">{row.publishedLabel}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">{row.statusLabel}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(row)}
                        className="inline-flex items-center gap-1 rounded-full border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-primary transition hover:bg-brand-50 dark:border-brand-700 dark:text-brand-accent dark:hover:bg-brand-800/50"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(row)}
                        className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/60 dark:hover:bg-red-950/40"
                        disabled={!row.id || deletingId === row.id}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {deletingId === row.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td className="px-5 py-6 text-center text-brand-text-muted dark:text-slate-400" colSpan={5}>
                    No news found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {loading && (
            <p className="px-5 py-4 text-sm text-brand-text-muted dark:text-slate-400">Loading news...</p>
          )}
        </div>
      </div>
    </div>
  );
}
