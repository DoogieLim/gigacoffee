/**
 * GET  /api/members/me — 내 프로필 조회
 * PATCH /api/members/me — 내 프로필 수정
 *
 * 로그인 사용자가 자신의 프로필을 조회하거나 일부 필드를 수정한다.
 *
 * **PATCH 설계:** PUT(전체 교체) 대신 PATCH(부분 수정)를 사용한다.
 * 변경할 필드만 body에 포함하면 된다 (`"key" in body` 패턴으로 undefined 구분).
 *
 * **fcm_token 처리:** FCM 웹 푸시 초기화 시 브라우저가 자동으로 PATCH를 호출해 토큰을 갱신한다.
 * 사용자가 직접 입력하는 값이 아니므로 UI에는 표시하지 않는다.
 *
 * 인증: 로그인 사용자 필요
 * OpenAPI 스펙: src/lib/api/openapi.ts → /api/members/me
 */
import { NextRequest } from "next/server"
import { memberRepo } from "@/lib/db"
import { getAuthUser, requireAuth } from "@/lib/api/auth"
import { apiSuccess, apiError } from "@/lib/api/response"
import type { UpdateProfileData } from "@/lib/db/repositories/member.repository"

/** GET /api/members/me */
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

/** PATCH /api/members/me — 부분 수정 (변경할 필드만 포함) */
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth(request)

    const body = await request.json()
    const updates: UpdateProfileData = {}

    // undefined가 아닌 "키 포함 여부"로 판단: `body.phone = undefined`와 `body에 phone 없음`을 구분
    if ("name" in body) updates.name = body.name
    if ("phone" in body) updates.phone = body.phone
    if ("avatar_url" in body) updates.avatar_url = body.avatar_url
    // fcm_token: Firebase FCM SDK가 자동으로 갱신 (users/me 페이지 방문 시 호출됨)
    if ("fcm_token" in body) updates.fcm_token = body.fcm_token

    if (Object.keys(updates).length === 0) {
      return apiError("수정할 필드가 없습니다", 400)
    }

    await memberRepo.update(user.id, updates)

    // 수정 후 최신 프로필을 다시 조회하여 반환 (업데이트 결과 즉시 반영)
    const updatedProfile = await memberRepo.findById(user.id)
    return apiSuccess(updatedProfile)
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    return apiError(`프로필 수정 실패: ${String(error)}`, 500)
  }
}
