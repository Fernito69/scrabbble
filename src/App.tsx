import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Login } from "@/pages/Login";
import { Lobby } from "@/pages/Lobby";
import { Playfield } from "@/pages/Playfield";
import { useAuth } from "@/contexts/AuthContext";
import { LanguageInitializer } from "@/components/LanguageInitializer/LanguageInitializer";

function App() {
  return (
    <LanguageInitializer>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
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
