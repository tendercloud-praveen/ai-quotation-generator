import { read, write, uid } from './storage';

const NKEY = 'notifications';

export function getNotifications() {
  return read(NKEY, []);
}

export function saveNotifications(list) {
  write(NKEY, list);
}

export function getNotificationsFor(userId) {
  return getNotifications()
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getUnreadCount(userId) {
  return getNotifications().filter((n) => n.userId === userId && !n.read).length;
}

export function addNotification({ userId, type, title, desc, quotationId }) {
  const list = getNotifications();
  const item = {
    id: uid('ntf'),
    userId,
    type,            // 'assigned' | 'approved' | 'rejected' | 'changes_requested'
    title,
    desc,
    quotationId,
    read: false,
    createdAt: new Date().toISOString(),
  };
  list.push(item);
  saveNotifications(list);
  return item;
}

export function markNotificationRead(id) {
  const list = getNotifications();
  const i = list.findIndex((n) => n.id === id);
  if (i === -1) return;
  list[i] = { ...list[i], read: true };
  saveNotifications(list);
}

export function markAllRead(userId) {
  const list = getNotifications();
  const next = list.map((n) => (n.userId === userId ? { ...n, read: true } : n));
  saveNotifications(next);
}

export function clearNotifications(userId) {
  saveNotifications(getNotifications().filter((n) => n.userId !== userId));
}
