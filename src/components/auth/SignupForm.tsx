"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { PixelButton, PixelCard, useToast } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";

export const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, isAuthenticated } = useAuth();
  const router = useRouter();
  const toast = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      const errorMsg = "Passwords do not match";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      const errorMsg = "Password must be at least 6 characters long";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const errorMsg = "Please enter a valid email address";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsLoading(true);

    try {
      await signUp(email, password, fullName);
      toast.success("Account created successfully! Welcome aboard!");
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create account. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Signup error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background-muted to-background p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="mb-8 text-center">
          <h1 className="font-mono text-4xl font-black uppercase tracking-tight text-foreground">
            Trial Manager
          </h1>
          <p className="mt-2 font-mono text-sm uppercase tracking-widest text-foreground-soft">
            Create Your Account
          </p>
        </div>

        <PixelCard className="p-8">
          <h2 className="mb-6 font-mono text-2xl font-black uppercase tracking-tight text-foreground">
            Sign Up
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="border-2 border-accent-danger bg-accent-danger/10 p-4">
                <p className="font-mono text-xs text-accent-danger">{error}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block font-mono text-[0.65rem] uppercase tracking-[0.3em] text-foreground-soft"
              >
                Full Name (Optional)
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                className="pixel-input w-full"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block font-mono text-[0.65rem] uppercase tracking-[0.3em] text-foreground-soft"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                className="pixel-input w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block font-mono text-[0.65rem] uppercase tracking-[0.3em] text-foreground-soft"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  className="pixel-input w-full pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-soft transition-colors hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="mt-1 font-mono text-[0.6rem] text-foreground-soft">
                Minimum 6 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block font-mono text-[0.65rem] uppercase tracking-[0.3em] text-foreground-soft"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  className="pixel-input w-full pr-12"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-soft transition-colors hover:text-foreground"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <PixelButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading}
              isLoading={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </PixelButton>
          </form>

          <div className="mt-6 border-t-2 border-outline-soft pt-6 text-center">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-foreground-soft">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-accent-primary transition-colors hover:text-accent-secondary"
              >
                Sign In
              </Link>
            </p>
          </div>
        </PixelCard>

        <div className="mt-6 text-center">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-foreground-soft">
            Powered by Supabase
          </p>
        </div>
      </div>
    </div>
  );
};

