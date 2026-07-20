import { read, write, remove } from './storage';
import { findUserByEmail, findUserById, updateUser } from './users';
import { verifyPassword } from './crypto';

const SESSION_KEY = 'session';
const RESET_KEY = 'reset_tokens';

export function getSession() {
  return read(SESSION_KEY, null);
}

export function setSession(userId) {
  write(SESSION_KEY, { userId, at: Date.now() });
}

export function clearSession() {
  remove(SESSION_KEY);
}

export function getCurrentUser() {
  const s = getSession();
  if (!s) return null;
  return findUserById(s.userId) || null;
}

export function login(email, password) {
  const user = findUserByEmail(email);
  if (!user) return { ok: false, error: 'No account found with this email.' };
  if (!verifyPassword(password, user.password)) return { ok: false, error: 'Incorrect password.' };
  if (user.status !== 'active') return { ok: false, error: 'Your account has been disabled. Contact your admin.' };
  setSession(user.id);
  return { ok: true, user };
}

export function requestPasswordReset(email) {
  const user = findUserByEmail(email);
  if (!user) return { ok: false, error: 'No account found with this email.' };
  const token = Math.random().toString(36).slice(2, 10).toUpperCase();
  const tokens = read(RESET_KEY, {});
  tokens[email.toLowerCase()] = { token, userId: user.id, expires: Date.now() + 1000 * 60 * 30 };
  write(RESET_KEY, tokens);
  return { ok: true, token };
}

export function resetPassword(email, token, newPassword) {
  const tokens = read(RESET_KEY, {});
  const entry = tokens[email.toLowerCase()];
  if (!entry || entry.token !== token) return { ok: false, error: 'Invalid or expired reset token.' };
  if (Date.now() > entry.expires) return { ok: false, error: 'Reset token has expired.' };
  updateUser(entry.userId, { password: newPassword });
  delete tokens[email.toLowerCase()];
  write(RESET_KEY, tokens);
  return { ok: true };
}
