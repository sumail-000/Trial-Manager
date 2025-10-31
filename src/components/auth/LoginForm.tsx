"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PixelButton, PixelCard } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signIn(email, password);
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError("Invalid email or password. Please try again.");
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
            Admin Portal
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
                placeholder="admin@trialmanager.com"
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
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="pixel-input w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
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

