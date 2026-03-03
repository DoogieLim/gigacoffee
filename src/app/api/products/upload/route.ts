/**
 * POST /api/products/upload — 상품 이미지 업로드
 *
 * 관리자 상품 등록/수정 폼에서 이미지를 Supabase Storage에 업로드하고 공개 URL을 반환한다.
 *
 * **저장 경로:** `product-images/{timestamp}_{원본파일명}`
 *
 * 인증: 관리자(admin/staff/franchise_admin)만 가능
 * OpenAPI 스펙: src/lib/api/openapi.ts → /api/products/upload POST
 */
import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireRole } from "@/lib/api/auth"
import { apiSuccess, apiError } from "@/lib/api/response"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
  try {
    await requireRole(request, ["admin", "staff", "franchise_admin"])

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return apiError("파일이 없습니다", 400)
    }
    if (!file.type.startsWith("image/")) {
      return apiError("이미지 파일만 업로드 가능합니다", 400)
    }
    if (file.size > MAX_FILE_SIZE) {
      return apiError("파일 크기는 5MB 이하여야 합니다", 400)
    }

    const buffer = await file.arrayBuffer()
    const fileName = `${Date.now()}_${file.name}`
    const filePath = `product-images/${fileName}`

    const supabase = await createClient()
    const { data, error } = await supabase.storage
      .from("products")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      return apiError("파일 업로드에 실패했습니다", 500)
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("products").getPublicUrl(data.path)

    return apiSuccess({ url: publicUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : "서버 오류"
    return apiError(message, 500)
  }
}
