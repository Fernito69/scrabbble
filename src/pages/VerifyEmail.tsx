import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth";
import { useAuth } from "@/contexts/AuthContext";

export const VerifyEmail = () => {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // If email is already verified or user logged in with Google, redirect to home
    if (!user) {
      navigate("/login");
    } else if (user.emailVerified || user.providerData[0]?.providerId !== 'password') {
      navigate("/");
    }
  }, [user, navigate]);

  const handleResendEmail = async () => {
    setError("");
    setMessage("");
    setSending(true);

    try {
      await authService.sendVerificationEmail();
      setMessage("Verification email sent! Please check your inbox.");
    } catch (err) {
      setError("Failed to send verification email. Please try again.");
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleCheckVerification = async () => {
    if (user) {
      await user.reload();
      if (user.emailVerified) {
        navigate("/");
      } else {
        setError("Email not verified yet. Please check your inbox and click the verification link.");
      }
    }
  };

  const handleSignOut = async () => {
    await authService.signOut();
    navigate("/login");
  };

  if (!user) {
    return null;
  }

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
          <h2 className="text-2xl font-bold mt-4">Verify Your Email</h2>
          <p className="text-muted-foreground mt-2">
            We've sent a verification email to
          </p>
          <p className="font-medium mt-1">{user.email}</p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-900">
              Please check your inbox and click the verification link to activate your account.
              Don't forget to check your spam folder!
            </p>
          </div>

          {message && (
            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
              {message}
            </div>
          )}

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <button
            onClick={handleCheckVerification}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            I've verified my email
          </button>

          <button
            onClick={handleResendEmail}
            disabled={sending}
            className="w-full px-4 py-2 border border-input rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? "Sending..." : "Resend verification email"}
          </button>

          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 text-muted-foreground hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};
