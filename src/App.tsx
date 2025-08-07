import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Layout } from "./components/Layout/Layout";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LogsPage } from "./pages/LogsPage";
import { useAuth } from "./hooks/useAuth";
import { setUser } from "./store/slices/authSlice";
import { AppDispatch } from "./store";

export default function App() {
  const { isAuthenticated, token } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Simulate token validation and user info retrieval
    if (token && !isAuthenticated) {
      // In a real app, you'd validate the token with your backend
      const mockUser = {
        id: "1",
        email: "admin@logmonitor.com",
        name: "Admin User",
        role: "admin" as const,
        createdAt: new Date().toISOString(),
      };
      dispatch(setUser(mockUser));
    }
  }, [token, isAuthenticated, dispatch]);

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/analytics" element={<DashboardPage />} />
          <Route
            path="/users"
            element={<div>Users Management (Admin Only)</div>}
          />
          <Route path="/settings" element={<div>Settings Page</div>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
