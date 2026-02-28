"use server"

import { createClient } from "@/lib/supabase/server"
import { roleRepo } from "@/lib/db"
import { revalidatePath } from "next/cache"

const ADMIN_ROLE_ID = "adff1713-3ccb-40f9-b7e7-53a832636613"

async function getCurrentUserId(): Promise<string> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("로그인이 필요합니다.")
  return user.id
}

async function assertIsAdmin(userId: string): Promise<void> {
  const userRoles = await roleRepo.findUserRoles()
  const isAdmin = userRoles.some((r) => r.userId === userId && r.role?.name === "admin")
  if (!isAdmin) throw new Error("관리자 권한이 필요합니다.")
}

export async function requestAdminAccess(reason: string): Promise<{ error?: string }> {
  try {
    const userId = await getCurrentUserId()

    // 이미 요청이 있는지 확인
    const existing = await roleRepo.findMyAdminRequest(userId)
    if (existing && existing.status === "pending") {
      return { error: "이미 승인 대기 중인 요청이 있습니다." }
    }
    if (existing && existing.status === "approved") {
      return { error: "이미 관리자 권한이 부여되었습니다." }
    }

    await roleRepo.createAdminRequest(userId, reason)
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : "요청에 실패했습니다." }
  }
}

export async function approveAdminRequest(requestId: string): Promise<{ error?: string }> {
  try {
    const userId = await getCurrentUserId()
    await assertIsAdmin(userId)
    await roleRepo.approveAdminRequest(requestId, userId, ADMIN_ROLE_ID)
    revalidatePath("/admin/roles")
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : "승인에 실패했습니다." }
  }
}

export async function rejectAdminRequest(requestId: string): Promise<{ error?: string }> {
  try {
    const userId = await getCurrentUserId()
    await assertIsAdmin(userId)
    await roleRepo.rejectAdminRequest(requestId, userId)
    revalidatePath("/admin/roles")
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : "거절에 실패했습니다." }
  }
}

export async function getMyAdminRequestStatus(): Promise<{
  status: "none" | "pending" | "approved" | "rejected"
}> {
  try {
    const userId = await getCurrentUserId()
    const req = await roleRepo.findMyAdminRequest(userId)
    if (!req) return { status: "none" }
    return { status: req.status }
  } catch {
    return { status: "none" }
  }
}
