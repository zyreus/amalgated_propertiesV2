import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { apiRequest } from '../hooks/useApi.js';
import { mapApiProperty } from '../utils/propertyMappers.js';
import { clearPropertiesCache } from '../utils/propertyCache.js';

const PropertiesContext = createContext(null);

export function PropertiesProvider({ children }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasLoadedRef = useRef(false);

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError(null);

    try {
      const rows = await apiRequest('/properties', { cacheTtlMs: 0 });
      setProperties(Array.isArray(rows) ? rows.map(mapApiProperty).filter(Boolean) : []);
      hasLoadedRef.current = true;
    } catch (err) {
      setError(err);
      if (!hasLoadedRef.current) setProperties([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearPropertiesCache();
    load();
    const onUpdate = () => load({ silent: true });
    window.addEventListener('properties-updated', onUpdate);
    return () => window.removeEventListener('properties-updated', onUpdate);
  }, [load]);

  const value = useMemo(
    () => ({ properties, loading, error, reload: () => load({ silent: false }) }),
    [properties, loading, error, load],
  );

  return <PropertiesContext.Provider value={value}>{children}</PropertiesContext.Provider>;
}

export function usePropertiesList() {
  const context = useContext(PropertiesContext);
  if (!context) {
    throw new Error('usePropertiesList must be used within PropertiesProvider');
  }
  return context;
}
