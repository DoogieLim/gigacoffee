/**
 * POST /api/posts/upload — 게시글 이미지 업로드
 *
 * 게시글 에디터에서 이미지를 Supabase Storage에 업로드하고 공개 URL을 반환한다.
 *
 * **저장 경로:** `post-images/{userId}/{timestamp}_{원본파일명}`
 * 사용자별 폴더 분리: 다른 사용자 파일과 충돌 방지 + 사용자별 파일 관리 용이
 * timestamp 접두사: 동일 파일명 중복 업로드 방지
 *
 * **upsert: false 이유:** 중복 파일을 덮어쓰지 않음.
 * timestamp가 있어 사실상 항상 새 파일이지만, 혹시 모를 충돌 시 에러로 명확히 처리.
 *
 * 인증: 로그인 사용자 필요
 * OpenAPI 스펙: src/lib/api/openapi.ts → /api/posts/upload POST
 */
import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/api/auth"
import { apiSuccess, apiError } from "@/lib/api/response"

// 5MB: Supabase Storage 무료 플랜의 실용적 상한선
const MAX_FILE_SIZE = 5 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return apiError("파일이 없습니다", 400)
    }

    // MIME 타입 검증 (image/* 패턴: JPEG, PNG, GIF, WebP 등 허용)
    if (!file.type.startsWith("image/")) {
      return apiError("이미지 파일만 업로드 가능합니다", 400)
    }

    if (file.size > MAX_FILE_SIZE) {
      return apiError("파일 크기는 5MB 이하여야 합니다", 400)
    }

    // File → ArrayBuffer 변환 (Supabase Storage SDK가 Buffer/ArrayBuffer를 요구)
    const buffer = await file.arrayBuffer()
    const fileName = `${Date.now()}_${file.name}`
    const filePath = `post-images/${user.id}/${fileName}`

    const supabase = await createClient()
    const { data, error } = await supabase.storage
      .from("post-images")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false, // 중복 파일 덮어쓰기 방지
      })

    if (error) {
      return apiError("파일 업로드에 실패했습니다", 500)
    }

    // 공개 URL 생성 (버킷이 public으로 설정되어 있어야 함)
    const {
      data: { publicUrl },
    } = supabase.storage.from("post-images").getPublicUrl(data.path)

    return apiSuccess({ url: publicUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : "서버 오류"
    return apiError(message, 500)
  }
}
