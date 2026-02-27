import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/api/auth"
import { apiSuccess, apiError } from "@/lib/api/response"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request)
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return apiError("파일이 없습니다", 400)
    }

    // 파일 타입 확인
    if (!file.type.startsWith("image/")) {
      return apiError("이미지 파일만 업로드 가능합니다", 400)
    }

    // 파일 크기 확인
    if (file.size > MAX_FILE_SIZE) {
      return apiError("파일 크기는 5MB 이하여야 합니다", 400)
    }

    // 파일을 버퍼로 변환
    const buffer = await file.arrayBuffer()
    const fileName = `${Date.now()}_${file.name}`
    const filePath = `post-images/${user.id}/${fileName}`

    const supabase = await createClient()
    const { data, error } = await supabase.storage
      .from("post-images")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      return apiError("파일 업로드에 실패했습니다", 500)
    }

    // 공개 URL 생성
    const {
      data: { publicUrl },
    } = supabase.storage.from("post-images").getPublicUrl(data.path)

    return apiSuccess({ url: publicUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : "서버 오류"
    return apiError(message, 500)
  }
}
