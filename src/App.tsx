import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useSearchParams,
} from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Login } from "@/pages/Login";
import { Lobby } from "@/pages/Lobby";
import { Playfield } from "@/pages/Playfield";
import { VerifyEmail } from "@/pages/VerifyEmail";
import { ForgotPassword } from "@/pages/ForgotPassword";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageInitializer } from "@/components/LanguageInitializer/LanguageInitializer";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useVersionCheck } from "@/hooks/useVersionCheck";
import { toast } from "sonner";

function App() {
  const { reloadPage } = useVersionCheck({
    checkInterval: 5 * 60 * 1000, // Check every 5 minutes
    onNewVersion: () => {
      toast.info("A new version is available!", {
        description: "Click to refresh and get the latest updates",
        action: {
          label: "Refresh",
          onClick: reloadPage,
        },
        duration: Infinity, // Don't auto-dismiss
      });
    },
  });

  return (
    <TooltipProvider>
      <LanguageInitializer>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Lobby />
                </ProtectedRoute>
              }
            />
            <Route
              path="/game/:gameId"
              element={
                <ProtectedRoute>
                  <Playfield />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </LanguageInitializer>
    </TooltipProvider>
  );
}

function LoginRoute() {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={returnUrl} replace />;
  }

  return <Login />;
}

export default App;
