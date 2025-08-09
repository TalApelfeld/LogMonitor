// pages/AuthPage.tsx
import React, { useState, useEffect } from "react";
import { LoginForm } from "../components/Auth/LoginForm";
import { RegisterForm } from "../components/Auth/RegisterForm";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return isLogin ? (
    <LoginForm onToggleMode={() => setIsLogin(false)} />
  ) : (
    <RegisterForm onToggleMode={() => setIsLogin(true)} />
  );
};
