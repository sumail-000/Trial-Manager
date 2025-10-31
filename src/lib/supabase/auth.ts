import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "./types";

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
}

export class AuthService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async signIn(email: string, password: string) {
    // First verify the admin credentials against the admin_users table
    const { data: passwordMatch, error: passwordError } = await this.supabase.rpc(
      "verify_admin_password",
      {
        admin_email: email,
        admin_password: password,
      }
    );

    if (passwordError || !passwordMatch) {
      throw new Error("Invalid credentials");
    }

    // If the admin credentials are valid, sign in with Supabase Auth using the same password
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error("Invalid credentials");
    }

    return {
      user: data.user,
      session: data.session,
    };
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    return user;
  }

  async getSession() {
    const {
      data: { session },
    } = await this.supabase.auth.getSession();
    return session;
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    return this.supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
  }
}

