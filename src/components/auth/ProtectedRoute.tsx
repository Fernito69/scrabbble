import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { OverlayWithLoader } from "../OverlayWithLoader/OverlayWithLoader";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <OverlayWithLoader>
          <p className="text-muted-foreground">Loading...</p>
        </OverlayWithLoader>
      </div>
    );
  }

  if (!user) {
    // Save the current location they were trying to access
    const returnUrl = location.pathname + location.search;
    return (
      <Navigate
        to={`/login?returnUrl=${encodeURIComponent(returnUrl)}`}
        replace
      />
    );
  }

  // Check if user's email is verified (Google users are auto-verified)
  if (user.providerData[0]?.providerId === 'password' && !user.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return <>{children}</>;
};
