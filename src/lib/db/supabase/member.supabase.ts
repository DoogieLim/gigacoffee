import { createServiceClient } from "@/lib/supabase/server"
import type { MemberRepository, ProfileRow, UpdateProfileData } from "../repositories/member.repository"

export class SupabaseMemberRepository implements MemberRepository {
  private async db() {
    return createServiceClient()
  }

  async findById(id: string): Promise<ProfileRow | null> {
    const supabase = await this.db()
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single()
    return data as ProfileRow | null
  }

  async findAll(): Promise<ProfileRow[]> {
    const supabase = await this.db()
    const { data } = await supabase
      .from("profiles")
      .select("id, name, email, phone, is_active, created_at, avatar_url, fcm_token, updated_at")
      .order("created_at", { ascending: false })
    return (data ?? []) as unknown as ProfileRow[]
  }

  async findPhoneAndToken(id: string): Promise<{ phone: string | null; fcm_token: string | null } | null> {
    const supabase = await this.db()
    const { data } = await supabase
      .from("profiles")
      .select("phone, fcm_token")
      .eq("id", id)
      .single()
    return data as { phone: string | null; fcm_token: string | null } | null
  }

  async update(id: string, data: UpdateProfileData): Promise<void> {
    const supabase = await this.db()
    await supabase.from("profiles").update(data).eq("id", id)
  }
}
