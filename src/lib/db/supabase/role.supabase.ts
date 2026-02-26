import { createServiceClient } from "@/lib/supabase/server"
import type { RoleRepository, UserRoleRow } from "../repositories/role.repository"

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
}
