import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth";
import { FirebaseError } from "firebase/app";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case "auth/invalid-email":
          return "Invalid email address.";
        case "auth/user-not-found":
          return "No account found with this email address.";
        case "auth/too-many-requests":
          return "Too many requests. Please try again later.";
        default:
          return "An error occurred. Please try again.";
      }
    }
    return "An error occurred. Please try again.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      await authService.resetPassword(email);
      setSuccess(true);
      setEmail("");
    } catch (err) {
      setError(getErrorMessage(err));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-5xl font-black tracking-tight mb-1" style={{
            textShadow: '3px 3px 0px rgba(0, 0, 0, 0.1), 6px 6px 0px rgba(0, 0, 0, 0.05)',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            scrabbbbbble
          </h1>
          <h2 className="text-2xl font-bold mt-4">Reset Password</h2>
          <p className="text-muted-foreground mt-2">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
            <p className="font-medium mb-1">Password reset email sent!</p>
            <p>Check your inbox for instructions to reset your password. Don't forget to check your spam folder!</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="text-center space-y-2">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-sm text-primary hover:underline"
          >
            Back to sign in
          </button>
        </div>
      </div>
    </div>
  );
};
