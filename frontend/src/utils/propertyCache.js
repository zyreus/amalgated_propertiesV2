export function clearPropertiesCache() {
  if (typeof window === 'undefined') return;

  Object.keys(localStorage)
    .filter((key) => key.startsWith('api-cache:/api/pm/properties'))
    .forEach((key) => localStorage.removeItem(key));

  window.dispatchEvent(new Event('properties-updated'));
}
