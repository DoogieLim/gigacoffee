import { NextRequest } from "next/server"
import { memberRepo } from "@/lib/db"
import { getAuthUser, requireAuth } from "@/lib/api/auth"
import { apiSuccess, apiError } from "@/lib/api/response"
import type { UpdateProfileData } from "@/lib/db/repositories/member.repository"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)

    if (!user) {
      return apiError("인증이 필요합니다", 401)
    }

    const profile = await memberRepo.findById(user.id)

    if (!profile) {
      return apiError("프로필을 찾을 수 없습니다", 404)
    }

    return apiSuccess(profile)
  } catch (error) {
    return apiError(`프로필 조회 실패: ${String(error)}`, 500)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const body = await request.json()
    const updates: UpdateProfileData = {}

    if ("name" in body) updates.name = body.name
    if ("phone" in body) updates.phone = body.phone
    if ("avatar_url" in body) updates.avatar_url = body.avatar_url
    if ("fcm_token" in body) updates.fcm_token = body.fcm_token

    if (Object.keys(updates).length === 0) {
      return apiError("수정할 필드가 없습니다", 400)
    }

    await memberRepo.update(user.id, updates)

    const updatedProfile = await memberRepo.findById(user.id)
    return apiSuccess(updatedProfile)
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    return apiError(`프로필 수정 실패: ${String(error)}`, 500)
  }
}
