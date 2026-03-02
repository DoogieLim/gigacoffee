import { cookies } from "next/headers"

/**
 * 관리자 현재 선택 매장 ID를 쿠키에서 읽어 반환한다.
 * franchise_admin이 "전체 보기" 모드면 null 반환.
 */
export async function getAdminStoreId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get("admin_store_id")?.value ?? null
}
