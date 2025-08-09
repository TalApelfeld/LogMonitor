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
import { RoleRoute } from "./components/routing/RoleRoute";
import { AuthGuard } from "./components/routing/AuthGuard";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Private routes all under AuthGuard */}
        <Route element={<AuthGuard />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/logs" element={<LogsPage />} />

            {/* Role-specific */}
            <Route element={<RoleRoute roles={["admin"]} />}>
              <Route
                path="/users"
                element={<div>Users Management (Admin Only)</div>}
              />
            </Route>

            <Route path="/settings" element={<div>Settings Page</div>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
