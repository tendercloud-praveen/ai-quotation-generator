import { read, write, uid } from './storage';
import { hashPassword } from './crypto';

const KEY = 'users';

export function getUsers() {
  return read(KEY, []);
}

export function saveUsers(users) {
  write(KEY, users);
}

export function findUserByEmail(email) {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id) {
  return getUsers().find((u) => u.id === id);
}

export function getManagers() {
  return getUsers().filter((u) => u.role === 'manager' && u.status === 'active');
}

export function isAdminPresent() {
  return getUsers().some((u) => u.role === 'admin');
}

export function createUser({ companyName, fullName, email, mobile, password, role = 'sales_rep' }) {
  const users = getUsers();
  const firstEver = users.length === 0;
  const finalRole = firstEver ? 'admin' : role;
  const user = {
    id: uid('usr'),
    companyName: companyName || users[0]?.companyName || 'Acme Manufacturing',
    fullName,
    email,
    mobile,
    password: hashPassword(password),
    role: finalRole,
    status: 'active',
    createdAt: new Date().toISOString(),
    avatarColor: pickColor(email),
  };
  users.push(user);
  saveUsers(users);
  return user;
}

export function updateUser(id, patch) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  if (patch.password) patch.password = hashPassword(patch.password);
  users[idx] = { ...users[idx], ...patch };
  saveUsers(users);
  return users[idx];
}

export function deleteUser(id) {
  const users = getUsers().filter((u) => u.id !== id);
  saveUsers(users);
}

const COLORS = ['#3385ff', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];
function pickColor(seed = '') {
  let n = 0;
  for (let i = 0; i < seed.length; i++) n = (n + seed.charCodeAt(i)) % COLORS.length;
  return COLORS[n];
}
