import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { roleRepo } from "@/lib/db"

// POST /api/admin/set-store
// Body: { storeId: string | null }
// franchise_admin만 호출 가능. storeId=null이면 "전체 보기" 모드
export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const isFranchiseAdmin = await roleRepo.isFranchiseAdmin(user.id)
  if (!isFranchiseAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { storeId } = (await req.json()) as { storeId: string | null }

  const cookieStore = await cookies()
  if (!storeId) {
    cookieStore.delete("admin_store_id")
  } else {
    cookieStore.set("admin_store_id", storeId, {
      httpOnly: true,
      path: "/admin",
      maxAge: 60 * 60 * 24 * 30, // 30일
    })
  }

  return NextResponse.json({ ok: true })
}
