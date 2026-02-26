import { createClient } from "@/lib/supabase/client"
import type { AuthProvider, AuthUser } from "../types"

export class SupabaseAuthProvider implements AuthProvider {
  private get supabase() {
    return createClient()
  }

  async getUser(): Promise<AuthUser | null> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser()

    if (!user) return null

    const { data: profileData } = await this.supabase
      .from("profiles")
      .select("name, phone, avatar_url, fcm_token")
      .eq("id", user.id)
      .single()

    type ProfileData = { name: string; phone: string | null; avatar_url: string | null; fcm_token: string | null }
    const profile = profileData as unknown as ProfileData | null

    return {
      id: user.id,
      email: user.email ?? "",
      name: profile?.name ?? user.email ?? "",
      phone: profile?.phone ?? null,
      avatar_url: profile?.avatar_url ?? null,
      fcm_token: profile?.fcm_token ?? null,
    }
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
    const user = await this.getUser()
    if (!user) throw new Error("사용자 정보를 불러올 수 없습니다.")
    return user
  }

  async signUp(email: string, password: string, name: string): Promise<AuthUser> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) throw new Error(error.message)
    const user = await this.getUser()
    if (!user) throw new Error("사용자 정보를 불러올 수 없습니다.")
    return user
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut()
    if (error) throw new Error(error.message)
  }

  async signInWithOAuth(provider: "kakao" | "google"): Promise<void> {
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) throw new Error(error.message)
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })
    if (error) throw new Error(error.message)
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    const { data } = this.supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        callback(null)
        return
      }
      const user = await this.getUser()
      callback(user)
    })
    return () => data.subscription.unsubscribe()
  }
}
