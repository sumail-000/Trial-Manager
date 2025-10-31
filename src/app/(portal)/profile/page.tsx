"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PixelButton, PixelCard } from "@/components/ui";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
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
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-mono text-xl font-black uppercase tracking-tight text-foreground">
            Account Information
          </h2>
          <PixelButton
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Cancel" : "Edit"}
          </PixelButton>
        </div>

        <div className="space-y-6">
          <div>
            <label className="mb-2 block font-mono text-[0.65rem] uppercase tracking-[0.3em] text-foreground-soft">
              Email
            </label>
            <div className="border-2 border-outline-soft bg-surface-soft px-4 py-3 font-mono text-sm text-foreground">
              {user.email}
            </div>
          </div>

          <div>
            <label className="mb-2 block font-mono text-[0.65rem] uppercase tracking-[0.3em] text-foreground-soft">
              User ID
            </label>
            <div className="border-2 border-outline-soft bg-surface-soft px-4 py-3 font-mono text-xs text-foreground-soft">
              {user.id}
            </div>
          </div>

          <div>
            <label className="mb-2 block font-mono text-[0.65rem] uppercase tracking-[0.3em] text-foreground-soft">
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                defaultValue={user.user_metadata?.full_name || ""}
                className="pixel-input w-full"
              />
            ) : (
              <div className="border-2 border-outline-soft bg-surface-soft px-4 py-3 font-mono text-sm text-foreground">
                {user.user_metadata?.full_name || "Not set"}
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block font-mono text-[0.65rem] uppercase tracking-[0.3em] text-foreground-soft">
              Account Created
            </label>
            <div className="border-2 border-outline-soft bg-surface-soft px-4 py-3 font-mono text-sm text-foreground">
              {new Date(user.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-4">
              <PixelButton type="button" variant="primary" size="md">
                Save Changes
              </PixelButton>
              <PixelButton
                type="button"
                variant="ghost"
                size="md"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </PixelButton>
            </div>
          )}
        </div>
      </PixelCard>

      {/* Statistics */}
      <PixelCard className="p-8">
        <h2 className="mb-6 font-mono text-xl font-black uppercase tracking-tight text-foreground">
          Account Statistics
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <div className="mb-2 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-foreground-soft">
              Total Trials
            </div>
            <div className="font-mono text-3xl font-bold text-accent-primary">
              --
            </div>
          </div>
          <div>
            <div className="mb-2 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-foreground-soft">
              Active Trials
            </div>
            <div className="font-mono text-3xl font-bold text-accent-positive">
              --
            </div>
          </div>
          <div>
            <div className="mb-2 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-foreground-soft">
              Money Saved
            </div>
            <div className="font-mono text-3xl font-bold text-accent-warning">
              $--
            </div>
          </div>
        </div>
      </PixelCard>

      {/* Danger Zone */}
      <PixelCard className="border-accent-danger p-8">
        <h2 className="mb-4 font-mono text-xl font-black uppercase tracking-tight text-accent-danger">
          Danger Zone
        </h2>
        <p className="mb-6 font-mono text-sm text-foreground-soft">
          Once you delete your account, there is no going back. This action cannot be undone.
        </p>
        <PixelButton variant="secondary" size="md">
          Delete Account
        </PixelButton>
      </PixelCard>
    </div>
  );
}

