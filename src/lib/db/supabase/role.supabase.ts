import { createServiceClient } from "@/lib/supabase/server"
import type { AdminAccessRequest, RoleRepository, UserRoleRow } from "../repositories/role.repository"

export class SupabaseRoleRepository implements RoleRepository {
  private async db() {
    return createServiceClient()
  }

  async findUserRoles(): Promise<UserRoleRow[]> {
    const supabase = await this.db()
    const { data } = await supabase
      .from("user_roles")
      .select("user_id, profile:profiles(name, email), role:roles(name)")
    return ((data ?? []) as unknown as Array<{
      user_id: string
      profile: { name: string; email: string } | null
      role: { name: string } | null
    }>).map((r) => ({ userId: r.user_id, profile: r.profile, role: r.role }))
  }

  async findPendingAdminRequests(): Promise<AdminAccessRequest[]> {
    const supabase = await this.db()
    const { data } = await this.adminRequestsTable(supabase)
      .select("id, user_id, reason, status, created_at, profile:profiles(name, email)")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
    return ((data ?? []) as Array<{
      id: string
      user_id: string
      reason: string | null
      status: "pending" | "approved" | "rejected"
      created_at: string
      profile: { name: string; email: string } | null
    }>).map((r) => ({
      id: r.id,
      userId: r.user_id,
      reason: r.reason,
      status: r.status,
      createdAt: r.created_at,
      profile: r.profile,
    }))
  }

  async findMyAdminRequest(userId: string): Promise<AdminAccessRequest | null> {
    const supabase = await this.db()
    const { data } = await this.adminRequestsTable(supabase)
      .select("id, user_id, reason, status, created_at, profile:profiles(name, email)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
    if (!data) return null
    const r = data as {
      id: string
      user_id: string
      reason: string | null
      status: "pending" | "approved" | "rejected"
      created_at: string
      profile: { name: string; email: string } | null
    }
    return { id: r.id, userId: r.user_id, reason: r.reason, status: r.status, createdAt: r.created_at, profile: r.profile }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private adminRequestsTable(supabase: any) {
    // admin_access_requests 테이블은 자동 생성 타입에 미포함이므로 any 캐스트
    return (supabase as { from: (table: string) => any }).from("admin_access_requests")
  }

  async createAdminRequest(userId: string, reason: string): Promise<void> {
    const supabase = await this.db()
    await this.adminRequestsTable(supabase).insert({ user_id: userId, reason })
  }

  async approveAdminRequest(requestId: string, reviewerId: string, adminRoleId: string): Promise<void> {
    const supabase = await this.db()
    const { data: req } = await this.adminRequestsTable(supabase).select("user_id").eq("id", requestId).single()
    if (!req) throw new Error("요청을 찾을 수 없습니다.")

    await this.adminRequestsTable(supabase)
      .update({ status: "approved", reviewed_by: reviewerId, reviewed_at: new Date().toISOString() })
      .eq("id", requestId)

    await supabase.from("user_roles").upsert({
      user_id: (req as { user_id: string }).user_id,
      role_id: adminRoleId,
      granted_by: reviewerId,
      granted_at: new Date().toISOString(),
    })
  }

  async rejectAdminRequest(requestId: string, reviewerId: string): Promise<void> {
    const supabase = await this.db()
    await this.adminRequestsTable(supabase)
      .update({ status: "rejected", reviewed_by: reviewerId, reviewed_at: new Date().toISOString() })
      .eq("id", requestId)
  }
}
