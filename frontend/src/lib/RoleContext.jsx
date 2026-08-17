import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getCurrentUser } from "../lib/auth";
import { subscribe } from "../lib/storage";

const RoleCtx = createContext(null);

export function RoleProvider({ children }) {
  const [tick, setTick] = useState(0);

  // Re-read user whenever any localStorage key under our prefix changes
  // (login, logout, user creation, user edits, session restore on refresh).
  useEffect(() => subscribe(() => setTick((t) => t + 1)), []);

  // tick is read so the memo recomputes on storage changes.
  const user = useMemo(() => getCurrentUser(), [tick]);

  const normalizedRole = user?.role?.toLowerCase();

  const value = useMemo(
    () => ({
      user,
      actualRole: normalizedRole,
      effectiveRole: normalizedRole,
    }),
    [user, normalizedRole],
  );

  return <RoleCtx.Provider value={value}>{children}</RoleCtx.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleCtx);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
