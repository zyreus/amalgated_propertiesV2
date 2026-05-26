import React, { useEffect, useMemo, useState } from 'react';
import { FilePlus2, Pencil, X } from 'lucide-react';
import { adminTables } from '../../data/mockPortal.js';
import useApi from '../../hooks/useApi.js';

const initialForm = {
  property_id: '',
  property_name: '',
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

function slugPreviewValue(value) {
  return `preview:${String(value || 'property').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function addMonths(date, months) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function inferTermMonths(term) {
  const match = String(term || '').match(/(\d+)/);
  return match ? Number(match[1]) : 12;
}

function formatInputDate(date) {
  return date.toISOString().slice(0, 10);
}

function parseCurrency(value) {
  const amount = Number(String(value || '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(amount) ? amount : 0;
}

function normalizeLeaseStatus(status) {
  const value = String(status || 'active').toLowerCase();
  if (['current', 'active'].includes(value)) return 'active';
  if (['review', 'draft'].includes(value)) return 'draft';
  if (['renewed', 'expired', 'terminated'].includes(value)) return value;
  return 'active';
}

function mapLease(row) {
  if (row.property) return { ...row, source: row };

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
  if (lease.property && !lease.property_id) {
    const start = new Date();
    const end = addMonths(start, inferTermMonths(lease.term));

    return {
      property_id: slugPreviewValue(lease.property),
      property_name: lease.property || '',
      tenant: lease.tenant || '',
      lease_number: lease.lease_number || '',
      start_date: formatInputDate(start),
      end_date: formatInputDate(end),
      rent_amount: parseCurrency(lease.value) ? String(parseCurrency(lease.value)) : '',
      security_deposit: '',
      payment_frequency: 'monthly',
      status: normalizeLeaseStatus(lease.status),
      terms: lease.terms || '',
    };
  }

  return {
    property_id: lease.property_id ? String(lease.property_id) : '',
    property_name: lease.property_name || lease.property || '',
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
  const [leases, setLeases] = useState(adminTables.leases);
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [editingLease, setEditingLease] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const rows = useMemo(() => leases.map(mapLease), [leases]);
  const propertyOptions = useMemo(() => {
    if (properties.length > 0) return properties;

    return rows
      .map((row) => row.property)
      .filter(Boolean)
      .filter((property, index, arr) => arr.indexOf(property) === index)
      .map((property) => ({ id: slugPreviewValue(property), name: property, preview: true }));
  }, [properties, rows]);

  const loadLeases = () => {
    setLoading(true);
    api.get('/leases')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setLeases(data);
      })
      .catch(() => {
        setLeases(adminTables.leases);
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
    setEditingLease(lease);
    setForm(leaseToForm(lease));
    setMessage(lease?.id ? '' : 'This preview lease can be edited locally. Connect the API data to save it permanently.');
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

    const isPreviewLease = editingLease && !editingLease.id;
    const isPreviewProperty = String(form.property_id).startsWith('preview:');

    try {
      if (isPreviewLease || isPreviewProperty) {
        const nextLease = {
          ...editingLease,
          tenant: form.tenant.trim() || editingLease?.tenant || 'Unassigned',
          property: form.property_name.trim() || propertyOptions.find((property) => String(property.id) === form.property_id)?.name || editingLease?.property || 'Property pending',
          term: formatTerm(form.start_date, form.end_date),
          renewal: formatDate(form.end_date),
          value: formatCurrency(form.rent_amount),
          status: formatStatus(form.status),
        };

        setLeases((current) => (
          editingLease
            ? current.map((lease) => (lease === editingLease ? nextLease : lease))
            : [nextLease, ...current]
        ));
        closeForm();
        setMessage(editingLease
          ? 'Preview lease updated locally. Use real API lease data to save it permanently.'
          : 'Preview lease added locally. Use real API lease data to save it permanently.');
        return;
      }

      const payload = {
        property_id: Number(form.property_id),
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

      closeForm();
      setMessage(editingLease?.id ? 'Lease updated successfully.' : 'Lease added successfully.');
      loadLeases();
    } catch (error) {
      setMessage(error.message || 'Unable to save lease.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent">Lease Operations</p>
          <h2 className="mt-2 text-3xl font-bold text-brand-primary dark:text-white">Leases</h2>
        </div>
        <button className="btn-primary" onClick={openAddForm}><FilePlus2 className="h-4 w-4" /> New Lease</button>
      </div>
      {message && (
        <p className="rounded-2xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-primary dark:bg-brand-800/40 dark:text-brand-accent">
          {message}
        </p>
      )}
      {showForm && (
        <div className="glass-card p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-brand-primary dark:text-white">
                {editingLease ? 'Edit Lease' : 'New Lease'}
              </h3>
              <p className="text-sm text-brand-text-muted dark:text-slate-400">
                Leases are saved to the portal lease API.
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
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Property</span>
              <select
                required
                value={form.property_id}
                onChange={(event) => {
                  const property = propertyOptions.find((item) => String(item.id) === event.target.value);
                  updateField('property_id', event.target.value);
                  updateField('property_name', property?.name || '');
                }}
                className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
              >
                <option value="">Select property</option>
                {propertyOptions.map((property) => (
                  <option key={property.id} value={property.id}>{property.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Tenant</span>
              <input
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
      )}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-brand-50 text-xs uppercase tracking-wide text-brand-text-muted dark:bg-brand-800/40 dark:text-slate-400">
              <tr>{['Tenant', 'Property', 'Term', 'Renewal', 'Value', 'Status', 'Actions'].map((head) => <th key={head} className="px-5 py-3">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-brand-100 dark:divide-brand-700/50">
              {rows.map((row) => (
                <tr key={row.id || `${row.tenant}-${row.property}`} className="hover:bg-brand-50/70 dark:hover:bg-brand-800/30">
                  <td className="px-5 py-4 font-semibold text-brand-primary dark:text-white">{row.tenant}</td>
                  <td className="px-5 py-4">{row.property}</td>
                  <td className="px-5 py-4 text-brand-text-muted dark:text-slate-400">{row.term}</td>
                  <td className="px-5 py-4">{row.renewal}</td>
                  <td className="px-5 py-4 font-semibold">{row.value}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-primary dark:bg-brand-800 dark:text-brand-accent">{row.status}</span></td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => openEditForm(row.source)}
                      className="inline-flex items-center gap-1 rounded-full border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-primary transition hover:bg-brand-50 dark:border-brand-700 dark:text-brand-accent dark:hover:bg-brand-800/50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td className="px-5 py-6 text-center text-brand-text-muted dark:text-slate-400" colSpan={7}>
                    No leases found.
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
