"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { PixelButton, PixelCard, useToast } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = searchParams.get("redirect") || "/dashboard";
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, searchParams]);

  // Show message if redirected from protected route
  useEffect(() => {
    const message = searchParams.get("message");
    if (message === "unauthenticated") {
      toast.warning("Please sign in to continue");
    }
  }, [searchParams, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signIn(email, password);
      const redirectTo = searchParams.get("redirect") || "/dashboard";
      toast.success("Welcome back! Signed in successfully");
      router.push(redirectTo);
      router.refresh();
    } catch (err: any) {
      const errorMessage = err?.message || "Invalid email or password. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Login error:", err);
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
            Welcome Back
          </p>
        </div>

        <PixelCard className="p-8">
          <h2 className="mb-6 font-mono text-2xl font-black uppercase tracking-tight text-foreground">
            Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="border-2 border-accent-danger bg-accent-danger/10 p-4">
                <p className="font-mono text-xs text-accent-danger">{error}</p>
              </div>
            )}

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
                  autoComplete="current-password"
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
            </div>

            <PixelButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading}
              isLoading={isLoading}
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </PixelButton>
          </form>

          <div className="mt-6 border-t-2 border-outline-soft pt-6 text-center">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-foreground-soft">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-accent-primary transition-colors hover:text-accent-secondary"
              >
                Sign Up
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

