import React from "react";
import { useLocation } from "react-router-dom";
import {
  Activity,
  BarChart3,
  FileText,
  Settings,
  Users,
  LogOut,
  Shield,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useDispatch } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import clsx from "clsx";
import { LogFileUpload } from "../Logss/LogFileUpload";
import { NavLink } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, canAccess } = useAuth();
  const dispatch = useDispatch();

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: BarChart3,
      roles: ["admin", "user", "viewer"],
    },
    {
      name: "Logs",
      href: "/logs",
      icon: FileText,
      roles: ["admin", "user", "viewer"],
    },
    // {
    //   name: "Analytics",
    //   href: "/analytics",
    //   icon: Activity,
    //   roles: ["admin", "user"],
    // },
    { name: "Users", href: "/users", icon: Users, roles: ["admin"] },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      roles: ["admin", "user"],
    },
  ];

  const handleLogout = () => {
    dispatch(logout());
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-gray-800">
            <Shield className="w-8 h-8 text-blue-500" />
            <span className="ml-2 text-xl font-bold text-white">
              LogMonitor
            </span>
          </div>

          {/* User info */}
          <div className="px-6 py-4 border-b border-gray-800">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              if (!canAccess(item.roles)) return null;

              const isActive = location.pathname === item.href;
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    )
                  }
                  onClick={onClose}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </NavLink>
              );
            })}
            <LogFileUpload />
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
