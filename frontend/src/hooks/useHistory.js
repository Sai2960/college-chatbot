// Shared history hook used by all features
const MAX_ITEMS = 50;

export function useHistory(featureKey) {
  const storageKey = `history_${featureKey}`;

  const getAll = () => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); }
    catch { return []; }
  };

  const save = (item) => {
    const existing = getAll();
    const newItem  = {
      id:        Date.now(),
      timestamp: new Date().toISOString(),
      ...item,
    };
    const updated = [newItem, ...existing].slice(0, MAX_ITEMS);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    return newItem;
  };

  const remove = (id) => {
    const updated = getAll().filter(i => i.id !== id);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const clear = () => localStorage.removeItem(storageKey);

  return { getAll, save, remove, clear };
}