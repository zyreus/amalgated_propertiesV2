import React, { useEffect, useMemo, useState } from 'react';
import { FilePlus2, Pencil, Trash2, X } from 'lucide-react';
import useApi from '../../hooks/useApi.js';
import { clearPropertiesCache } from '../../utils/propertyCache.js';

const initialForm = {
  property_id: '',
  tenant: '',
  lease_number: '',
  start_date: '',
  end_date: '',
  rent_amount: '',
  security_deposit: '',
  payment_frequency: 'monthly',
  status: 'active',
  terms: '',
};

function formatStatus(status) {
  if (!status) return 'Active';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatCurrency(value) {
  const amount = Number(value);
  if (!amount) return 'PHP 0';
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value) {
  if (!value) return 'Pending';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateInput(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

function formatTerm(startDate, endDate) {
  if (!startDate || !endDate) return 'Term pending';
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'Term pending';
  const months = Math.max(1, ((end.getFullYear() - start.getFullYear()) * 12) + end.getMonth() - start.getMonth());
  return `${months} months`;
}

function normalizeLeaseStatus(status) {
  const value = String(status || 'active').toLowerCase();
  if (['current', 'active'].includes(value)) return 'active';
  if (['review', 'draft'].includes(value)) return 'draft';
  if (['renewed', 'expired', 'terminated'].includes(value)) return value;
  return 'active';
}

function mapLease(row) {
  return {
    id: row.id,
    tenant: row.tenant_name || row.user_name || 'Unassigned',
    property: row.property_name || `Property #${row.property_id}`,
    term: formatTerm(row.start_date, row.end_date),
    renewal: formatDate(row.end_date),
    value: formatCurrency(row.rent_amount),
    status: formatStatus(row.status),
    source: row,
  };
}

function leaseToForm(lease) {
  return {
    property_id: lease.property_id ? String(lease.property_id) : '',
    tenant: lease.tenant_name || lease.user_name || lease.tenant || '',
    lease_number: lease.lease_number || '',
    start_date: formatDateInput(lease.start_date),
    end_date: formatDateInput(lease.end_date),
    rent_amount: lease.rent_amount ? String(lease.rent_amount) : '',
    security_deposit: lease.security_deposit ? String(lease.security_deposit) : '',
    payment_frequency: lease.payment_frequency || 'monthly',
    status: normalizeLeaseStatus(lease.status),
    terms: lease.terms || '',
  };
}

export default function AdminLeases() {
  const [token] = useState(() => (typeof window === 'undefined' ? null : localStorage.getItem('admin_token')));
  const api = useApi(token);
  const [leases, setLeases] = useState([]);
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [editingLease, setEditingLease] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [message, setMessage] = useState('');

  const rows = useMemo(() => leases.map(mapLease), [leases]);

  const loadLeases = () => {
    setLoading(true);
    api.get('/leases')
      .then((data) => {
        if (Array.isArray(data)) setLeases(data);
      })
      .catch(() => {
        setLeases([]);
      })
      .finally(() => setLoading(false));
  };

  const loadProperties = () => {
    api.get('/properties')
      .then((data) => {
        if (Array.isArray(data)) setProperties(data);
      })
      .catch(() => setProperties([]));
  };

  useEffect(() => {
    loadLeases();
    loadProperties();
  }, [api]);

  useEffect(() => {
    if (!showForm && !deleteTarget) return undefined;

    const handleEscape = (event) => {
      if (event.key !== 'Escape') return;
      if (deleteTarget && !deletingId) {
        setDeleteTarget(null);
        setMessage('');
      } else if (showForm && !saving) {
        closeForm();
      }
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
    setEditingLease(null);
    setForm(initialForm);
    setMessage('');
    setShowForm(true);
  };

  const openEditForm = (lease) => {
    if (!lease?.id) {
      setMessage('This lease cannot be edited until the API data is available.');
      return;
    }

    setEditingLease(lease);
    setForm(leaseToForm(lease));
    setMessage('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingLease(null);
    setForm(initialForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const payload = {
        property_id: Number(form.property_id),
        tenant_name: form.tenant.trim() || undefined,
        lease_number: form.lease_number.trim() || undefined,
        start_date: form.start_date,
        end_date: form.end_date,
        rent_amount: Number(form.rent_amount) || 0,
        security_deposit: Number(form.security_deposit) || 0,
        payment_frequency: form.payment_frequency,
        status: form.status,
        terms: form.terms.trim() || undefined,
      };

      if (editingLease?.id) {
        await api.patch(`/leases/${editingLease.id}`, payload);
      } else {
        await api.post('/leases', payload);
      }

      clearPropertiesCache();
      closeForm();
      setMessage(editingLease?.id ? 'Lease updated successfully.' : 'Lease added successfully.');
      loadLeases();
      loadProperties();
    } catch (error) {
      setMessage(error.message || 'Unable to save lease.');
    } finally {
      setSaving(false);
    }
  };

  const getLeaseLabel = (lease) => {
    if (!lease) return 'this lease';
    if (lease.lease_number) return lease.lease_number;
    if (lease.tenant_name || lease.user_name) return `${lease.tenant_name || lease.user_name} lease`;
    return 'this lease';
  };

  const handleDelete = (lease) => {
    if (!lease?.id) {
      setMessage('This lease cannot be deleted until the API data is available.');
      return;
    }

    setMessage('');
    setDeleteTarget(lease);
  };

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return;

    setDeletingId(deleteTarget.id);
    setMessage('');

    try {
      await api.delete(`/leases/${deleteTarget.id}`);
      clearPropertiesCache();

      if (editingLease?.id === deleteTarget.id) {
        closeForm();
      }

      setDeleteTarget(null);
      setMessage('Lease deleted permanently. Linked property status has been updated.');
      loadLeases();
      loadProperties();
    } catch (error) {
      setMessage(error.message || 'Unable to delete lease.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent">Lease Operations</p>
          <h2 className="mt-2 text-3xl font-bold text-brand-primary dark:text-white">Leases</h2>
        </div>
        <button className="btn-primary" onClick={openAddForm} disabled={properties.length === 0}>
          <FilePlus2 className="h-4 w-4" /> New Lease
        </button>
      </div>
      {properties.length === 0 && !loading && (
        <p className="rounded-2xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-primary dark:bg-brand-800/40 dark:text-brand-accent">
          Add properties first before creating leases.
        </p>
      )}
      {message && !showForm && !deleteTarget && (
        <p className="rounded-2xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-primary dark:bg-brand-800/40 dark:text-brand-accent">
          {message}
        </p>
      )}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lease-form-title"
        >
          <div className="glass-card max-h-[90vh] w-full max-w-4xl overflow-y-auto p-5 shadow-xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 id="lease-form-title" className="text-lg font-bold text-brand-primary dark:text-white">
                  {editingLease ? 'Edit Lease' : 'New Lease'}
                </h3>
                <p className="text-sm text-brand-text-muted dark:text-slate-400">
                  Leases link tenants to properties and update property occupancy status.
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-full p-2 text-brand-primary hover:bg-brand-50 dark:text-brand-accent dark:hover:bg-brand-800/50"
                aria-label="Close lease form"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {message && (
              <p className="mb-4 rounded-2xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-primary dark:bg-brand-800/40 dark:text-brand-accent">
                {message}
              </p>
            )}
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Property</span>
                <select
                  required
                  value={form.property_id}
                  onChange={(event) => updateField('property_id', event.target.value)}
                  className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
                >
                  <option value="">Select property</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>{property.name}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Tenant</span>
                <input
                  required
                  value={form.tenant}
                  onChange={(event) => updateField('tenant', event.target.value)}
                  className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Lease Number</span>
                <input
                  value={form.lease_number}
                  onChange={(event) => updateField('lease_number', event.target.value)}
                  placeholder="Auto-generated if blank"
                  className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Start Date</span>
                <input
                  required
                  type="date"
                  value={form.start_date}
                  onChange={(event) => updateField('start_date', event.target.value)}
                  className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">End Date</span>
                <input
                  required
                  type="date"
                  value={form.end_date}
                  onChange={(event) => updateField('end_date', event.target.value)}
                  className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Monthly Rent</span>
                <input
                  required
                  type="number"
                  min="0"
                  value={form.rent_amount}
                  onChange={(event) => updateField('rent_amount', event.target.value)}
                  className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Security Deposit</span>
                <input
                  type="number"
                  min="0"
                  value={form.security_deposit}
                  onChange={(event) => updateField('security_deposit', event.target.value)}
                  className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Payment Frequency</span>
                <select
                  value={form.payment_frequency}
                  onChange={(event) => updateField('payment_frequency', event.target.value)}
                  className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Status</span>
                <select
                  value={form.status}
                  onChange={(event) => updateField('status', event.target.value)}
                  className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="terminated">Terminated</option>
                  <option value="renewed">Renewed</option>
                </select>
              </label>
              <label className="block md:col-span-2">
                <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Terms</span>
                <textarea
                  rows={3}
                  value={form.terms}
                  onChange={(event) => updateField('terms', event.target.value)}
                  className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
                />
              </label>
              <div className="flex justify-end gap-3 md:col-span-2">
                <button type="button" onClick={closeForm} className="btn-outline">
                  Cancel
                </button>
                <button disabled={saving} className="btn-primary disabled:opacity-60" type="submit">
                  {saving ? 'Saving...' : editingLease ? 'Update Lease' : 'Save Lease'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-lease-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-brand-surface-dark">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 id="delete-lease-title" className="text-lg font-bold text-brand-primary dark:text-white">
              Delete lease
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-brand-text-muted dark:text-slate-400">
              Delete <span className="font-semibold text-brand-primary dark:text-white">{getLeaseLabel(deleteTarget)}</span>? This permanently removes it and will not come back after refresh.
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
              <tr>{['Tenant', 'Property', 'Term', 'Renewal', 'Value', 'Status', 'Actions'].map((head) => <th key={head} className="px-5 py-3">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-brand-100 dark:divide-brand-700/50">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-brand-50/70 dark:hover:bg-brand-800/30">
                  <td className="px-5 py-4 font-semibold text-brand-primary dark:text-white">{row.tenant}</td>
                  <td className="px-5 py-4">{row.property}</td>
                  <td className="px-5 py-4 text-brand-text-muted dark:text-slate-400">{row.term}</td>
                  <td className="px-5 py-4">{row.renewal}</td>
                  <td className="px-5 py-4 font-semibold">{row.value}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-primary dark:bg-brand-800 dark:text-brand-accent">{row.status}</span></td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEditForm(row.source)}
                        className="inline-flex items-center gap-1 rounded-full border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-primary transition hover:bg-brand-50 dark:border-brand-700 dark:text-brand-accent dark:hover:bg-brand-800/50"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(row.source)}
                        className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/60 dark:hover:bg-red-950/40"
                        disabled={deletingId === row.source?.id}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {deletingId === row.source?.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td className="px-5 py-6 text-center text-brand-text-muted dark:text-slate-400" colSpan={7}>
                    No leases found. Run <code className="text-xs">npm run db:seed</code> or create a lease linked to a property.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {loading && (
            <p className="px-5 py-4 text-sm text-brand-text-muted dark:text-slate-400">Loading leases...</p>
          )}
        </div>
      </div>
    </div>
  );
}
