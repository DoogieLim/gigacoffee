import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { apiError } from "./response"
import type { AuthUser } from "@/lib/auth/types"

export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profileData } = await supabase
      .from("profiles")
      .select("name, phone, avatar_url, fcm_token")
      .eq("id", user.id)
      .single()

    type ProfileData = {
      name: string
      phone: string | null
      avatar_url: string | null
      fcm_token: string | null
    }
    const profile = profileData as unknown as ProfileData | null

    return {
      id: user.id,
      email: user.email ?? "",
      name: profile?.name ?? user.email ?? "",
      phone: profile?.phone ?? null,
      avatar_url: profile?.avatar_url ?? null,
      fcm_token: profile?.fcm_token ?? null,
    }
  } catch {
    return null
  }
}

export async function requireAuth(request: NextRequest): Promise<AuthUser> {
  const user = await getAuthUser(request)
  if (!user) {
    throw apiError("인증이 필요합니다", 401)
  }
  return user
}

export async function requireRole(
  request: NextRequest,
  roles: string[]
): Promise<AuthUser> {
  const user = await requireAuth(request)
  const supabase = await createClient()

  const { data: roleData } = await supabase
    .from("roles")
    .select("role")
    .eq("user_id", user.id)
    .single()

  type RoleData = { role: string }
  const userRole = (roleData as unknown as RoleData | null)?.role

  if (!userRole || !roles.includes(userRole)) {
    throw apiError("권한이 없습니다", 403)
  }

  return user
}
