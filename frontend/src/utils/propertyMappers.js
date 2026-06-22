const DEFAULT_IMAGE =
  'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1200';

function mapListingStatus(row) {
  const dbStatus = String(row.status || 'available').toLowerCase();
  if (dbStatus === 'leased') return Number(row.price) > 0 ? 'Occupied' : 'Leased';
  if (dbStatus === 'maintenance') return 'Maintenance';
  if (dbStatus === 'inactive') return 'Inactive';
  return Number(row.price) > 0 ? 'For Lease' : 'Available';
}

function formatPropertyType(type) {
  if (!type) return 'Property';
  if (String(type).toLowerCase() === 'lot') return 'LOT';
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function mapApiProperty(row) {
  if (!row) return null;
  const primaryImage = row.images?.find?.((i) => i.is_primary) || row.images?.[0];
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    region: row.province || 'Mindanao',
    location: [row.address, row.city].filter(Boolean).join(', '),
    category: formatPropertyType(row.type),
    tag: row.type || 'Listing',
    price: row.price ? `PHP ${Number(row.price).toLocaleString('en-PH')}/mo` : 'Contact for rates',
    status: mapListingStatus(row),
    beds: row.bedrooms ?? 0,
    bathrooms: row.bathrooms ?? 0,
    parking_slots: row.parking_slots ?? 0,
    parking: row.parking_slots ? `${row.parking_slots} slots` : 'Available',
    sqft: row.area_sqm ? String(Math.round(row.area_sqm)) : '—',
    image: primaryImage?.url || row.image || DEFAULT_IMAGE,
    gallery: row.images?.map?.((image) => image.url).filter(Boolean) || [],
    description: row.description || '',
    featured: row.featured === 1 || row.featured === true,
    amenities: (() => {
      try {
        return typeof row.amenities === 'string' ? JSON.parse(row.amenities || '[]') : row.amenities || [];
      } catch {
        return [];
      }
    })(),
  };
}

export { DEFAULT_IMAGE };
