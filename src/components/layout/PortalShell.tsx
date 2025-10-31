"use client";

import type { ReactNode } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { PixelButton, useToast } from "@/components/ui";
import { PixelCubeLogo } from "@/components/scene/PixelCubeLogo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

type PortalShellProps = {
  children: ReactNode;
};

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Trials", href: "/trials" },
  { label: "Admin", href: "/admin" },
  { label: "Profile", href: "/profile" },
];

export const PortalShell = ({ children }: PortalShellProps) => {
  const pathname = usePathname();
  const { signOut, user } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully. See you soon!");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-outline-soft/40 bg-background/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 sm:px-10">
          <Link href="/dashboard" className="flex items-center gap-3">
            <PixelCubeLogo />
            <span className="text-xs font-semibold uppercase tracking-[0.5em] text-foreground">
              Trial Manager
            </span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-[0.6rem] uppercase tracking-[0.48em] transition-colors",
                    isActive
                      ? "text-accent-primary drop-shadow-glow"
                      : "text-foreground-soft hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden text-[0.6rem] uppercase tracking-widest text-foreground-soft sm:block">
                  {user.email}
                </span>
                <Suspense fallback={<div className="h-14 w-14" />}>
                  <ThemeToggle />
                </Suspense>
                <PixelButton variant="ghost" size="sm" href="/admin">
                  New Trial
                </PixelButton>
                <PixelButton size="sm" variant="ghost" onClick={handleLogout}>
                  Logout
                </PixelButton>
              </>
            ) : (
              <>
                <Suspense fallback={<div className="h-14 w-14" />}>
                  <ThemeToggle />
                </Suspense>
                <PixelButton
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/login")}
                >
                  New Trial
                </PixelButton>
                <PixelButton size="sm" href="/login">
                  Login
                </PixelButton>
              </>
            )}
          </div>
        </div>
      </header>
      <div className="relative flex flex-1 flex-col">
        <div className="pointer-events-none absolute inset-0 bg-pixel-radial opacity-60" />
        <div className="relative flex-1">{children}</div>
      </div>
    </div>
  );
};

