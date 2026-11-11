import React from "react";
import { Navigate, useLocation } from "react-router";
import { AuthService } from "../services/auth/AuthService";

interface AdminOnlyRouteProps {
  children: React.ReactNode;
}

export function AdminOnlyRoute({ children }: AdminOnlyRouteProps) {
  const location = useLocation();
  const authService = new AuthService();

  if (!authService.isAuthenticated()) {
    authService.logout();
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!authService.isAdminOrInitialAdmin()) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
