import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "@/services/auth";
import { FirebaseError } from "firebase/app";
import { ScrabbbbbbleLogo } from "@/components/ScrabbbbbbleLogo/ScrabbbbbbleLogo";

export const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case "auth/email-already-in-use":
          return "This email is already registered. Please sign in instead.";
        case "auth/invalid-email":
          return "Invalid email address.";
        case "auth/weak-password":
          return "Password should be at least 6 characters.";
        case "auth/user-not-found":
        case "auth/wrong-password":
          return "Invalid email or password.";
        case "auth/invalid-credential":
          return "Invalid email or password.";
        case "auth/too-many-requests":
          return "Too many failed attempts. Please try again later.";
        default:
          return "An error occurred. Please try again.";
      }
    }
    return "An error occurred. Please try again.";
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError("Password should be at least 6 characters.");
          setLoading(false);
          return;
        }

        // Check if email is already registered with a different provider
        const signInMethods = await authService.checkEmailExists(email);
        if (signInMethods.length > 0) {
          if (signInMethods.includes("google.com")) {
            setError(
              "This email is already registered with Google. Please sign in with Google instead."
            );
            setLoading(false);
            return;
          } else if (signInMethods.includes("password")) {
            setError(
              "This email is already registered. Please sign in instead."
            );
            setLoading(false);
            return;
          }
        }

        await authService.signUp(email, password);
        navigate("/verify-email");
      } else {
        await authService.signIn(email, password);
        navigate(returnUrl);
      }
    } catch (err) {
      setError(getErrorMessage(err));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      await authService.signInWithGoogle();
      navigate(returnUrl);
    } catch (err) {
      if (err instanceof FirebaseError) {
        if (err.code === "auth/account-exists-with-different-credential") {
          setError(
            "An account already exists with this email address. Please sign in with email and password instead."
          );
        } else if (err.code === "auth/popup-closed-by-user") {
          setError("Sign-in cancelled.");
        } else {
          setError("Failed to sign in with Google.");
        }
      } else {
        setError("Failed to sign in with Google.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <ScrabbbbbbleLogo />
          <p className="text-muted-foreground mt-2">
            {isSignUp ? "Create an account" : "Sign in to continue"}
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {isSignUp && (
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? isSignUp
                ? "Creating account..."
                : "Signing in..."
              : isSignUp
              ? "Sign Up"
              : "Sign In"}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-muted-foreground">Or</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full px-4 py-2 border border-input rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sign in with Google
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
              setPassword("");
              setConfirmPassword("");
            }}
            className="text-sm text-primary hover:underline"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
};
