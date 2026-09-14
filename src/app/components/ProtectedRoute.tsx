import React from "react";
import { Navigate, useLocation } from "react-router";
import { AuthService } from "../services/auth/AuthService";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const authService = new AuthService();

  if (!authService.isAuthenticated()) {
    authService.logout();
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
