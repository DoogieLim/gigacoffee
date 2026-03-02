import { createServiceClient } from "@/lib/supabase/server"
import type { StoreRepository, CreateStoreData } from "../repositories/store.repository"
import type { Store } from "@/types/store.types"

export class SupabaseStoreRepository implements StoreRepository {
  private async db() {
    return createServiceClient()
  }

  // stores 테이블은 gigacoffee 스키마에 있으며 자동 생성 타입 미포함
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private storesTable(supabase: any) {
    return (supabase as { from: (table: string) => any }).from("stores")
  }

  async findAll(activeOnly = false): Promise<Store[]> {
    const supabase = await this.db()
    let query = this.storesTable(supabase).select("*").order("created_at", { ascending: true })
    if (activeOnly) query = query.eq("is_active", true)
    const { data } = await query
    return (data ?? []) as Store[]
  }

  async findById(id: string): Promise<Store | null> {
    const supabase = await this.db()
    const { data } = await this.storesTable(supabase)
      .select("*")
      .eq("id", id)
      .single()
    return (data ?? null) as Store | null
  }

  async findBySlug(slug: string): Promise<Store | null> {
    const supabase = await this.db()
    const { data } = await this.storesTable(supabase)
      .select("*")
      .eq("slug", slug)
      .single()
    return (data ?? null) as Store | null
  }

  async create(data: CreateStoreData): Promise<Store> {
    const supabase = await this.db()
    const { data: row, error } = await this.storesTable(supabase)
      .insert({
        name: data.name,
        slug: data.slug,
        address: data.address ?? null,
        phone: data.phone ?? null,
      })
      .select()
      .single()
    if (error || !row) throw new Error("매장 생성에 실패했습니다.")
    return row as Store
  }

  async update(id: string, data: Partial<Omit<Store, "id" | "created_at">>): Promise<Store> {
    const supabase = await this.db()
    const { data: row, error } = await this.storesTable(supabase)
      .update(data)
      .eq("id", id)
      .select()
      .single()
    if (error || !row) throw new Error("매장 수정에 실패했습니다.")
    return row as Store
  }
}
