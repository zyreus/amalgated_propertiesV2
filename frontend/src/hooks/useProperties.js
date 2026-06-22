import { useEffect, useState } from 'react';
import { usePropertiesList } from '../context/PropertiesContext.jsx';
import { apiRequest } from './useApi.js';
import { mapApiProperty } from '../utils/propertyMappers.js';

export { mapApiProperty } from '../utils/propertyMappers.js';

export function useProperties() {
  return usePropertiesList();
}

export function useProperty(slug) {
  const { properties, loading: listLoading } = usePropertiesList();
  const fromList = properties.find((property) => property.slug === slug);
  const [property, setProperty] = useState(fromList || null);
  const [loading, setLoading] = useState(!fromList);

  useEffect(() => {
    if (fromList) {
      setProperty(fromList);
      setLoading(false);
      return undefined;
    }

    if (!slug) {
      setProperty(null);
      setLoading(false);
      return undefined;
    }

    if (listLoading) return undefined;

    let cancelled = false;
    setLoading(true);

    apiRequest(`/properties/${slug}`, { cacheTtlMs: 0 })
      .then((row) => {
        if (!cancelled) setProperty(row ? mapApiProperty(row) : null);
      })
      .catch(() => {
        if (!cancelled) setProperty(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, fromList, listLoading]);

  return { property, loading: listLoading || loading };
}

export default useProperties;
