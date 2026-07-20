import { useEffect, useState, useCallback } from 'react';
import { subscribe } from './storage';

// Re-renders the component when any localStorage key under our prefix changes.
export function useStore(selector) {
  const [, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);
  return selector();
}

export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : initial; }
    catch { return initial; }
  });
  const set = useCallback((v) => {
    const next = typeof v === 'function' ? v(value) : v;
    localStorage.setItem(key, JSON.stringify(next));
    setValue(next);
  }, [key, value]);
  return [value, set];
}
