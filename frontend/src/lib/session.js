// Session helpers for the currently logged-in user.
// Only the minimal session object is stored (id, fullName, email, role).
import {
  STORAGE_KEYS,
  readJSON,
  writeJSON,
  removeKey,
} from "./storage";

export function getCurrentUser() {
  return readJSON(STORAGE_KEYS.CURRENT_USER, null);
}

export function setCurrentUser(session) {
  return writeJSON(STORAGE_KEYS.CURRENT_USER, session);
}

// Logout: remove only the current session, keep all registered users intact.
export function clearCurrentUser() {
  return removeKey(STORAGE_KEYS.CURRENT_USER);
}
