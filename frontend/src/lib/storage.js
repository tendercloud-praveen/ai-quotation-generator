// Tiny localStorage-backed data layer with pub/sub so React can react to changes.
const PREFIX = 'quotaai:';
const listeners = new Set();

export function read(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function write(key, value) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
  listeners.forEach((fn) => fn(key));
}

export function remove(key) {
  localStorage.removeItem(PREFIX + key);
  listeners.forEach((fn) => fn(key));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
