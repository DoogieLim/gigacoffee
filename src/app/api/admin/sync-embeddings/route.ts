/**
 * POST /api/admin/sync-embeddings — 상품 임베딩 일괄 동기화 (관리자 전용)
 *
 * 모든 상품에 대해 Gemini embedding-001(768차원) 벡터를 생성하여
 * `product_embeddings` 테이블을 갱신한다.
 *
 * **실행 시점:**
 * - 최초 배포 후 1회 실행 (초기 임베딩 생성)
 * - 임베딩 모델 변경 시 재실행
 * - 신규 상품 등록 시에는 상품 등록 Server Action에서 자동 생성 (이 API 불필요)
 *
 * **왜 개별 조회하는가:** `productRepo.findAll()`은 카테고리 JOIN을 포함하지 않을 수 있어,
 * 각 상품별로 `findById()`를 호출해 카테고리명까지 포함한 임베딩 텍스트를 생성한다.
 * 카테고리명은 검색 정확도에 중요한 역할을 한다.
 *
 * **부분 실패 허용:** 일부 상품 임베딩 실패 시에도 나머지는 계속 처리하고,
 * 실패 목록을 응답에 포함하여 운영자가 확인할 수 있도록 한다.
 *
 * 인증: admin 또는 staff 역할 필요
 * OpenAPI 스펙: src/lib/api/openapi.ts → /api/admin/sync-embeddings POST
 */
import { NextRequest, NextResponse } from "next/server"
import { productRepo } from "@/lib/db"
import { generateEmbedding, buildProductEmbeddingText } from "@/lib/gemini/embeddings"
import { getAuthUser } from "@/lib/api/auth"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 })
    }

    // requireRole 대신 직접 조회하는 이유:
    // sync-embeddings는 초기 설정 목적의 일회성 API로, roles 테이블 구조 변경에 유연하게 대응하기 위함
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

    const products = await productRepo.findAll()

    let success = 0
    let failed = 0
    const errors: string[] = []

    // 순차 처리: 병렬 처리 시 Gemini API 할당량 초과 위험
    for (const product of products) {
      try {
        // 카테고리명 포함을 위해 개별 조회 (findAll은 category JOIN 미포함 가능)
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
        // 개별 실패는 수집만 하고 계속 진행 (전체 중단 방지)
        failed++
        errors.push(`[${product.name}] ${String(err)}`)
      }
    }

    return NextResponse.json({
      success: true,
      total: products.length,
      synced: success,
      failed,
      // 실패 항목이 없으면 errors 필드 생략
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
