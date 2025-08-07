import { useSelector } from "react-redux";
import { RootState } from "../store";

export function useAuth() {
  const auth = useSelector((state: RootState) => state.auth);

  return {
    ...auth,
    isAuthenticated: !!auth.token && !!auth.user,
    hasRole: (role: string) => auth.user?.role === role,
    canAccess: (roles: string[]) =>
      auth.user ? roles.includes(auth.user.role) : false,
  };
}
