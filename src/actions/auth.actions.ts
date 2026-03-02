"use server"

import { createClient } from "@/lib/supabase/server"
import { memberRepo } from "@/lib/db"
import { redirect } from "next/navigation"
import { ROUTES } from "@/lib/constants/routes"

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect(ROUTES.LOGIN)
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const profile = await memberRepo.findById(user.id)

  // 역할 정보 조회: user_roles JOIN roles (신 스키마)
  const { data: roleRows } = await supabase
    .from("user_roles")
    .select("role:roles(name)")
    .eq("user_id", user.id)

  type RoleRow = { role: { name: string } | null }
  const roleNames = ((roleRows ?? []) as unknown as RoleRow[])
    .map((r) => r.role?.name ?? "")
    .filter(Boolean)

  const PRIORITY_ROLES = ["admin", "franchise_admin", "staff", "kiosk"]
  const role = PRIORITY_ROLES.find((r) => roleNames.includes(r)) ?? roleNames[0] ?? undefined

  const kioskEmail = process.env.KIOSK_EMAIL ?? undefined
  const isKiosk = role === "kiosk" || (kioskEmail ? user.email === kioskEmail : false)

  return { ...user, ...(profile ?? {}), role, isKiosk }
}
