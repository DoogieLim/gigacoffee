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

    // 역할 정보 조회: user_roles(중간 테이블) JOIN roles(역할 정의)
    // 구 스키마: roles.user_id + roles.role → 신 스키마: user_roles.role_id → roles.name
    // 한 사용자에게 복수 역할이 있을 수 있으므로 배열로 조회
    const { data: roleRows } = await this.supabase
      .from("user_roles")
      .select("role:roles(name)")
      .eq("user_id", user.id)

    type RoleRow = { role: { name: string } | null }
    const roleNames = ((roleRows ?? []) as unknown as RoleRow[])
      .map((r) => r.role?.name ?? "")
      .filter(Boolean)

    // 우선순위: admin > franchise_admin > staff > kiosk > member
    // 관리자 라우트(/admin) 접근 허용 여부는 layout.tsx에서 재검증함
    const PRIORITY_ROLES = ["admin", "franchise_admin", "staff", "kiosk"]
    const role = PRIORITY_ROLES.find((r) => roleNames.includes(r)) ?? roleNames[0] ?? undefined

    // kiosk 계정 여부: "kiosk" 역할 우선, 없으면 환경변수 이메일 비교 (fallback)
    const kioskEmail = process.env.NEXT_PUBLIC_KIOSK_EMAIL ?? undefined
    const isKiosk = role === "kiosk" || (kioskEmail ? user.email === kioskEmail : false)

    return {
      id: user.id,
      email: user.email ?? "",
      name: profile?.name ?? user.email ?? "",
      role,
      isKiosk,
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

  async signInWithOAuth(provider: "kakao" | "google", next?: string): Promise<void> {
    const redirectTo = `${window.location.origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""}`
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        scopes: provider === "kakao" ? "profile_nickname profile_image" : undefined,
      },
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
