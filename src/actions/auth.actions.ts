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
  return { ...user, ...(profile ?? {}) }
}
