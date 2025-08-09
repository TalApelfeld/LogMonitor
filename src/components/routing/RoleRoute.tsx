import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export function RoleRoute({
  roles,
}: {
  roles: Array<"admin" | "user" | "viewer">;
}) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  return roles.includes(user.role) ? (
    <Outlet />
  ) : (
    <Navigate to="/dashboard" replace />
  );
}
