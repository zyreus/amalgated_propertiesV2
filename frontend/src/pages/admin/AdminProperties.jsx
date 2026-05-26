import React, { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, X } from 'lucide-react';
import { adminTables } from '../../data/mockPortal.js';
import useApi from '../../hooks/useApi.js';

const initialForm = {
  name: '',
  type: 'commercial',
  status: 'available',
  address: '',
  city: '',
  province: '',
  price: '',
  area_sqm: '',
  bedrooms: '',
  description: '',
  image_url: '',
  featured: false,
};

function clearPropertiesCache() {
  if (typeof window === 'undefined') return;

  Object.keys(localStorage)
    .filter((key) => key.startsWith('api-cache:/api/pm/properties'))
    .forEach((key) => localStorage.removeItem(key));
}

function formatStatus(status) {
  if (!status) return 'Available';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatPrice(price) {
  const amount = Number(price);
  if (!amount) return 'Contact for rates';
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(amount);
}

function mapAdminProperty(row) {
  if (row.location) return { ...row, source: row };

  return {
    id: row.id,
    name: row.name,
    type: row.type ? formatStatus(row.type) : 'Property',
    location: [row.address, row.city].filter(Boolean).join(', ') || row.province || 'Location pending',
    occupancy: row.status === 'leased' ? '100%' : '0%',
    revenue: formatPrice(row.price),
    status: formatStatus(row.status),
    source: row,
  };
}

function getPrimaryImage(property) {
  return property?.images?.find?.((image) => image.is_primary)?.url || property?.images?.[0]?.url || '';
}

function propertyToForm(property) {
  return {
    name: property.name || '',
    type: property.type || 'commercial',
    status: property.status || 'available',
    address: property.address || property.location || '',
    city: property.city || '',
    province: property.province || '',
    price: property.price ? String(property.price) : '',
    area_sqm: property.area_sqm ? String(property.area_sqm) : '',
    bedrooms: property.bedrooms ? String(property.bedrooms) : '',
    description: property.description || '',
    image_url: getPrimaryImage(property),
    featured: Boolean(property.featured),
  };
}

export default function AdminProperties() {
  const [token] = useState(() => (typeof window === 'undefined' ? null : localStorage.getItem('admin_token')));
  const api = useApi(token);
  const [properties, setProperties] = useState(adminTables.properties);
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const rows = useMemo(() => properties.map(mapAdminProperty), [properties]);

  const loadProperties = () => {
    setLoading(true);
    api.get('/properties')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setProperties(data);
      })
      .catch(() => {
        setProperties(adminTables.properties);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProperties();
  }, [api]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const openAddForm = () => {
    setEditingProperty(null);
    setForm(initialForm);
    setMessage('');
    setShowForm(true);
  };

  const openEditForm = (property) => {
    if (!property?.id) {
      setMessage('This property cannot be edited until the API data is available.');
      return;
    }

    setEditingProperty(property);
    setForm(propertyToForm(property));
    setMessage('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProperty(null);
    setForm(initialForm);
  };

  const handlePictureChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      updateField('image_url', '');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateField('image_url', reader.result || '');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        status: form.status,
        address: form.address.trim(),
        city: form.city.trim() || undefined,
        province: form.province.trim() || undefined,
        price: Number(form.price) || 0,
        area_sqm: Number(form.area_sqm) || 0,
        bedrooms: Number(form.bedrooms) || 0,
        description: form.description.trim() || undefined,
        image_url: form.image_url || undefined,
        featured: form.featured,
      };

      if (editingProperty?.id) {
        await api.patch(`/properties/${editingProperty.id}`, payload);
      } else {
        await api.post('/properties', payload);
      }

      clearPropertiesCache();
      setForm(initialForm);
      setShowForm(false);
      setEditingProperty(null);
      setMessage(editingProperty?.id
        ? 'Property updated. The website properties page will show the changes.'
        : 'Property added. It will now appear on the website properties page.');
      loadProperties();
    } catch (error) {
      setMessage(error.message || 'Unable to add property.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent">Portfolio</p>
          <h2 className="mt-2 text-3xl font-bold text-brand-primary dark:text-white">Properties</h2>
        </div>
        <button className="btn-primary" onClick={openAddForm}>
          <Plus className="h-4 w-4" /> Add Property
        </button>
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
                {editingProperty ? 'Edit Website Property' : 'Add Website Property'}
              </h3>
              <p className="text-sm text-brand-text-muted dark:text-slate-400">
                Properties are saved to the website listings API.
              </p>
            </div>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-full p-2 text-brand-primary hover:bg-brand-50 dark:text-brand-accent dark:hover:bg-brand-800/50"
              aria-label="Close add property form"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Property Name</span>
              <input
                required
                value={form.name}
                onChange={(event) => updateField('name', event.target.value)}
                className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Type</span>
              <select
                value={form.type}
                onChange={(event) => updateField('type', event.target.value)}
                className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
              >
                <option value="commercial">Commercial</option>
                <option value="office">Office</option>
                <option value="residential">Residential</option>
                <option value="industrial">Industrial</option>
                <option value="condominium">Condominium</option>
              </select>
            </label>
            <label className="block md:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Address</span>
              <input
                required
                value={form.address}
                onChange={(event) => updateField('address', event.target.value)}
                className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">City</span>
              <input
                value={form.city}
                onChange={(event) => updateField('city', event.target.value)}
                className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Province / Region</span>
              <input
                value={form.province}
                onChange={(event) => updateField('province', event.target.value)}
                className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Monthly Price</span>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(event) => updateField('price', event.target.value)}
                className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Area (sqm)</span>
              <input
                type="number"
                min="0"
                value={form.area_sqm}
                onChange={(event) => updateField('area_sqm', event.target.value)}
                className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Bedrooms</span>
              <input
                type="number"
                min="0"
                value={form.bedrooms}
                onChange={(event) => updateField('bedrooms', event.target.value)}
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
                <option value="available">Available</option>
                <option value="leased">Leased</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <label className="block md:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Property Picture</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePictureChange}
                className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-brand-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-primary-hover focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
              />
              {form.image_url && (
                <img
                  src={form.image_url}
                  alt="Property preview"
                  className="mt-3 h-44 w-full rounded-2xl object-cover"
                />
              )}
            </label>
            <label className="block md:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-brand-text dark:text-slate-300">Description</span>
              <textarea
                rows={3}
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
                className="w-full rounded-xl border border-brand-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 dark:border-brand-700 dark:bg-brand-surface-dark dark:text-white"
              />
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary dark:text-brand-accent">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => updateField('featured', event.target.checked)}
                className="h-4 w-4 rounded border-brand-300 text-brand-primary focus:ring-brand-primary"
              />
              Feature on homepage
            </label>
            <div className="flex justify-end gap-3 md:col-span-2">
              <button type="button" onClick={closeForm} className="btn-outline">
                Cancel
              </button>
              <button disabled={saving} className="btn-primary disabled:opacity-60" type="submit">
                {saving ? 'Saving...' : editingProperty ? 'Update Property' : 'Save Property'}
              </button>
            </div>
          </form>
        </div>
      )}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-brand-50 text-xs uppercase tracking-wide text-brand-text-muted dark:bg-brand-800/40 dark:text-slate-400">
              <tr>{['Property', 'Type', 'Location', 'Occupancy', 'Revenue', 'Status', 'Actions'].map((head) => <th key={head} className="px-5 py-3">{head}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-brand-100 dark:divide-brand-700/50">
              {rows.map((row) => (
                <tr key={row.id || row.name} className="hover:bg-brand-50/70 dark:hover:bg-brand-800/30">
                  <td className="px-5 py-4 font-semibold text-brand-primary dark:text-white">{row.name}</td>
                  <td className="px-5 py-4">{row.type}</td>
                  <td className="px-5 py-4 text-brand-text-muted dark:text-slate-400">{row.location}</td>
                  <td className="px-5 py-4">{row.occupancy}</td>
                  <td className="px-5 py-4 font-semibold">{row.revenue}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">{row.status}</span></td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => openEditForm(row.source)}
                      className="inline-flex items-center gap-1 rounded-full border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-primary transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-brand-700 dark:text-brand-accent dark:hover:bg-brand-800/50"
                      disabled={!row.source?.id}
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
                    No properties found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {loading && (
            <p className="px-5 py-4 text-sm text-brand-text-muted dark:text-slate-400">Loading properties...</p>
          )}
        </div>
      </div>
    </div>
  );
}
