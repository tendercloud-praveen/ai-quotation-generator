import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getCurrentUser,
  setCurrentUser,
  clearCurrentUser,
} from "../lib/session";
import { authenticate, migrateCompanyIds } from "../lib/users";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on first mount so the user stays logged in after refresh.
  // Also backfill companyId on any pre-multi-tenancy users once.
  useEffect(() => {
    migrateCompanyIds();
    const stored = getCurrentUser();
    if (stored) setUser(stored);
    setLoading(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login(email, password) {
        const matched = authenticate(email, password);
        if (!matched) return null;
        const session = {
          id: matched.id,
          companyId: matched.companyId,
          fullName: matched.fullName,
          email: matched.email,
          role: matched.role,
        };
        setCurrentUser(session);
        setUser(session);
        return session;
      },
      logout() {
        clearCurrentUser();
        setUser(null);
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
