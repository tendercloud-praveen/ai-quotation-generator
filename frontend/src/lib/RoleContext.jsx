// import {
//   createContext,
//   useContext,
//   useMemo,
//   useState,
//   useCallback,
// } from "react";
// import { getCurrentUser } from "./auth";

// const RoleCtx = createContext(null);

// export function RoleProvider({ children }) {
//   const [user, setUser] = useState(() => getCurrentUser());

//   const refreshUser = useCallback(() => {
//     const currentUser = getCurrentUser();
//     setUser(currentUser);
//     return currentUser;
//   }, []);

//   const normalizedRole = user?.role?.toLowerCase() || null;

//   const value = useMemo(
//     () => ({
//       user,
//       actualRole: normalizedRole,
//       effectiveRole: normalizedRole,
//       refreshUser,
//       setUser,
//     }),
//     [user, normalizedRole, refreshUser],
//   );

//   return <RoleCtx.Provider value={value}>{children}</RoleCtx.Provider>;
// }

// export function useRole() {
//   const ctx = useContext(RoleCtx);

//   if (!ctx) {
//     throw new Error("useRole must be used within RoleProvider");
//   }

//   return ctx;
// }

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from "react";
import { getCurrentUser } from "./auth";

const RoleCtx = createContext(null);

export function RoleProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());

  const refreshUser = useCallback(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    return currentUser;
  }, []);

  const normalizedRole = user?.role?.toLowerCase() || null;

  const value = useMemo(
    () => ({
      user,
      actualRole: normalizedRole,
      effectiveRole: normalizedRole,
      refreshUser,
      setUser,
    }),
    [user, normalizedRole, refreshUser],
  );

  return <RoleCtx.Provider value={value}>{children}</RoleCtx.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleCtx);

  if (!ctx) {
    throw new Error("useRole must be used within RoleProvider");
  }

  return ctx;
}
