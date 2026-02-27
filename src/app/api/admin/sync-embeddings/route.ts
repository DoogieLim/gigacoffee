import { NextRequest, NextResponse } from "next/server"
import { productRepo } from "@/lib/db"
import { generateEmbedding, buildProductEmbeddingText } from "@/lib/gemini/embeddings"
import { getAuthUser } from "@/lib/api/auth"
import { createClient } from "@/lib/supabase/server"

/**
 * POST /api/admin/sync-embeddings
 * 기존 상품 전체에 Gemini 임베딩 일괄 생성 (관리자 전용)
 * 처음 배포 후 또는 임베딩 재생성이 필요할 때 실행
 */
export async function POST(request: NextRequest) {
  try {
    // 관리자 인증 확인
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 })
    }

    const supabase = await createClient()
    const { data: roleData } = await supabase
      .from("roles")
      .select("role")
      .eq("user_id", user.id)
      .single()

    type RoleData = { role: string }
    const role = (roleData as unknown as RoleData | null)?.role
    if (!role || !["admin", "staff"].includes(role)) {
      return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 })
    }

    // 모든 상품 조회 (카테고리 포함)
    const products = await productRepo.findAll()

    let success = 0
    let failed = 0
    const errors: string[] = []

    for (const product of products) {
      try {
        // 카테고리 정보가 없으면 개별 조회
        const full = await productRepo.findById(product.id)
        const text = buildProductEmbeddingText({
          name: full?.name ?? product.name,
          description: full?.description ?? product.description,
          categoryName: full?.category?.name,
        })
        const embedding = await generateEmbedding(text)
        await productRepo.updateEmbedding(product.id, embedding)
        success++
      } catch (err) {
        failed++
        errors.push(`[${product.name}] ${String(err)}`)
      }
    }

    return NextResponse.json({
      success: true,
      total: products.length,
      synced: success,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
