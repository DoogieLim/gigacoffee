import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// POST /api/user/set-store
// Body: { storeId: string }
// 사용자가 매장 선택 시 user_store_id 쿠키 설정
export async function POST(req: Request) {
  const { storeId } = (await req.json()) as { storeId: string }

  const cookieStore = await cookies()
  if (!storeId) {
    cookieStore.delete("user_store_id")
  } else {
    cookieStore.set("user_store_id", storeId, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30일
    })
  }

  return NextResponse.json({ ok: true })
}
