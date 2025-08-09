// components/routing/AuthGuard.tsx
import { useEffect, useRef } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { verifyToken } from "../../store/slices/authSlice";

export function AuthGuard() {
  const { isAuthenticated, isLoading, token, user } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (!bootstrapped.current && token && !user) {
      bootstrapped.current = true;
      dispatch(verifyToken());
    }
  }, [token, user, dispatch]);

  if (isLoading) return <div>Loading...</div>;
  return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />;
}
