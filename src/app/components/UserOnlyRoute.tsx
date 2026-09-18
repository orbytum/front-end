import React from "react";
import { Navigate, useLocation } from "react-router";
import { AuthService } from "../services/auth/AuthService";

interface UserOnlyRouteProps {
  children: React.ReactNode;
}

export function UserOnlyRoute({ children }: UserOnlyRouteProps) {
  const location = useLocation();
  const authService = new AuthService();

  if (!authService.isAuthenticated()) {
    authService.logout();
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!authService.isUser()) {
    return <Navigate to="/grupos" replace />;
  }

  return <>{children}</>;
}
