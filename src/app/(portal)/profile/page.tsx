"use client";

import { useState } from "react";
import { User, Mail, Calendar, Shield, Bell, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PixelButton, PixelCard } from "@/components/ui";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useTrials, useTrialSummary } from "@/features/trials/hooks/useTrials";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user } = useAuth();
  const { data: trials } = useTrials();
  const summary = useTrialSummary(trials);
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-6 py-12 sm:px-10">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="font-mono text-3xl font-black uppercase tracking-tight text-foreground">
          Profile Settings
        </h1>
        <p className="font-mono text-sm text-foreground-soft">
          Manage your account information and preferences
        </p>
      </div>

      {/* Account Information */}
      <PixelCard className="p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center bg-accent-primary/20">
            <User className="h-6 w-6 text-accent-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-mono text-xl font-black uppercase tracking-tight text-foreground">
              Account Information
            </h2>
            <p className="font-mono text-xs text-foreground-soft">
              Your personal details
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-4 border-b border-outline-soft/30 pb-4">
            <div className="flex h-10 w-10 items-center justify-center bg-foreground/5">
              <Mail className="h-5 w-5 text-foreground-soft" />
            </div>
            <div className="flex-1">
              <label className="mb-1 block font-mono text-[0.65rem] uppercase tracking-[0.3em] text-foreground-soft">
                Email Address
              </label>
              <div className="font-mono text-sm text-foreground">
                {user.email}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 border-b border-outline-soft/30 pb-4">
            <div className="flex h-10 w-10 items-center justify-center bg-foreground/5">
              <Calendar className="h-5 w-5 text-foreground-soft" />
            </div>
            <div className="flex-1">
              <label className="mb-1 block font-mono text-[0.65rem] uppercase tracking-[0.3em] text-foreground-soft">
                Member Since
              </label>
              <div className="font-mono text-sm text-foreground">
                {new Date(user.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center bg-foreground/5">
              <Shield className="h-5 w-5 text-foreground-soft" />
            </div>
            <div className="flex-1">
              <label className="mb-1 block font-mono text-[0.65rem] uppercase tracking-[0.3em] text-foreground-soft">
                User ID
              </label>
              <div className="font-mono text-xs text-foreground-soft break-all">
                {user.id}
              </div>
            </div>
          </div>
        </div>
      </PixelCard>

      {/* Trial Statistics */}
      <PixelCard className="p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center bg-accent-secondary/20">
            <Bell className="h-6 w-6 text-accent-secondary" />
          </div>
          <div className="flex-1">
            <h2 className="font-mono text-xl font-black uppercase tracking-tight text-foreground">
              Trial Statistics
            </h2>
            <p className="font-mono text-xs text-foreground-soft">
              Your subscription tracking overview
            </p>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border-l-4 border-accent-primary bg-accent-primary/5 p-4">
            <div className="mb-2 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-foreground-soft">
              Total Trials
            </div>
            <div className="font-mono text-3xl font-bold text-accent-primary">
              {trials?.length || 0}
            </div>
          </div>
          <div className="border-l-4 border-accent-positive bg-accent-positive/5 p-4">
            <div className="mb-2 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-foreground-soft">
              Active
            </div>
            <div className="font-mono text-3xl font-bold text-accent-positive">
              {summary.active}
            </div>
          </div>
          <div className="border-l-4 border-accent-warning bg-accent-warning/5 p-4">
            <div className="mb-2 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-foreground-soft">
              Expiring Soon
            </div>
            <div className="font-mono text-3xl font-bold text-accent-warning">
              {summary.expiringSoon}
            </div>
          </div>
          <div className="border-l-4 border-accent-danger bg-accent-danger/5 p-4">
            <div className="mb-2 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-foreground-soft">
              Expired
            </div>
            <div className="font-mono text-3xl font-bold text-accent-danger">
              {summary.expired}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <PixelButton href="/trials" variant="secondary" size="sm">
            View All Trials
          </PixelButton>
        </div>
      </PixelCard>

      {/* Danger Zone */}
      <PixelCard className="border-2 border-accent-danger p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center bg-accent-danger/20">
            <Trash2 className="h-6 w-6 text-accent-danger" />
          </div>
          <div className="flex-1">
            <h2 className="font-mono text-xl font-black uppercase tracking-tight text-accent-danger">
              Danger Zone
            </h2>
            <p className="font-mono text-xs text-foreground-soft">
              Irreversible actions
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="border-l-4 border-accent-danger bg-accent-danger/5 p-4">
            <h3 className="mb-2 font-mono text-sm font-bold uppercase text-foreground">
              Delete Account
            </h3>
            <p className="mb-4 font-mono text-xs text-foreground-soft">
              Once you delete your account, there is no going back. All your trials and data will be permanently removed. This action cannot be undone.
            </p>
            <PixelButton variant="secondary" size="sm">
              Delete Account
            </PixelButton>
          </div>
        </div>
      </PixelCard>
    </div>
  );
}

