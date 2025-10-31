import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "./types";

export class AuthService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Sign up a new user with email and password
   */
  async signUp(email: string, password: string, fullName?: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;

    return {
      user: data.user,
      session: data.session,
    };
  }

  /**
   * Sign in an existing user with email and password
   */
  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return {
      user: data.user,
      session: data.session,
    };
  }

  /**
   * Sign out the current user
   */
  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    return user;
  }

  /**
   * Get the current session
   */
  async getSession() {
    const {
      data: { session },
    } = await this.supabase.auth.getSession();
    return session;
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    return this.supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
  }

  /**
   * Reset password for a user
   */
  async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  }

  /**
   * Update user password
   */
  async updatePassword(newPassword: string) {
    const { error } = await this.supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  }
}
