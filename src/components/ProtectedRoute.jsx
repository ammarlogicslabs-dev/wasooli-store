import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../admin/auth/AdminAuthContext";
import { useAuth } from "../auth/AuthContext";

export default function ProtectedRoute({ children, admin = false }) {
  const { isAuthenticated } = useAuth();
  const { isAuthenticated: isAdminAuthenticated } = useAdminAuth();
  const location = useLocation();
  const allowed = admin ? isAdminAuthenticated : isAuthenticated;

  if (!allowed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}