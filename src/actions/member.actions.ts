"use server"

import { createClient } from "@/lib/supabase/server"
import { memberRepo } from "@/lib/db"
import { requireAdminAction } from "@/lib/auth/action-auth"

export async function getMyProfile() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  return memberRepo.findById(user.id)
}

export async function updateMyProfile(data: { name: string; phone: string }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("로그인이 필요합니다.")
  await memberRepo.update(user.id, { name: data.name, phone: data.phone || null })
}

export async function getAllMembers() {
  await requireAdminAction()
  return memberRepo.findAll()
}
