import { useEffect, useState } from 'react';
import { properties as fallbackProperties, getPropertyBySlug as getLocal } from '../data/properties.js';
import { apiRequest } from './useApi.js';

const DEFAULT_IMAGE =
  'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1200';
const PROPERTY_CACHE_TTL_MS = 5 * 60 * 1000;

export function mapApiProperty(row) {
  if (!row) return null;
  const primaryImage = row.images?.find?.((i) => i.is_primary) || row.images?.[0];
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    region: row.province || 'Mindanao',
    location: [row.address, row.city].filter(Boolean).join(', '),
    category: row.type ? row.type.charAt(0).toUpperCase() + row.type.slice(1) : 'Property',
    tag: row.type || 'Listing',
    price: row.price ? `PHP ${Number(row.price).toLocaleString('en-PH')}/mo` : 'Contact for rates',
    status: row.status
      ? row.status.charAt(0).toUpperCase() + row.status.slice(1)
      : 'Available',
    beds: row.bedrooms ?? 0,
    sqft: row.area_sqm ? String(Math.round(row.area_sqm)) : '—',
    image: primaryImage?.url || row.image || DEFAULT_IMAGE,
    description: row.description || '',
    featured: Boolean(row.featured),
    amenities: typeof row.amenities === 'string' ? JSON.parse(row.amenities || '[]') : row.amenities || [],
  };
}

export function useProperties(filters = {}) {
  const [properties, setProperties] = useState(fallbackProperties);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams(filters).toString();
    const path = params ? `/properties?${params}` : '/properties';

    apiRequest(path, { cacheTtlMs: PROPERTY_CACHE_TTL_MS })
      .then((rows) => {
        if (cancelled || !Array.isArray(rows) || rows.length === 0) return;
        setProperties(rows.map(mapApiProperty).filter(Boolean));
      })
      .catch(() => {
        if (!cancelled) setProperties(fallbackProperties);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(filters)]);

  return { properties, loading };
}

export function useProperty(slug) {
  const [property, setProperty] = useState(() => getLocal(slug));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);

    apiRequest(`/properties/${slug}`, { cacheTtlMs: PROPERTY_CACHE_TTL_MS })
      .then((row) => {
        if (!cancelled && row) setProperty(mapApiProperty(row));
      })
      .catch(() => {
        if (!cancelled) setProperty(getLocal(slug));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { property, loading };
}

export default useProperties;
