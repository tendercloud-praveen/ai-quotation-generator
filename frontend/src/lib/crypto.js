// Password hashing — lightweight (non-crypto) obfuscation for localStorage demo only.
// This is NOT secure for real apps; the prompt explicitly says localStorage, no backend.
export function hashPassword(password) {
  let h = 5381;
  for (let i = 0; i < password.length; i++) {
    h = ((h << 5) + h) ^ password.charCodeAt(i);
    h = h >>> 0;
  }
  return `h${h.toString(36)}`;
}

export function verifyPassword(password, stored) {
  return hashPassword(password) === stored;
}
