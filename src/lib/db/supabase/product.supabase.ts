import { createClient } from "@/lib/supabase/server"
import type { ProductRepository } from "../repositories/product.repository"
import type { Product, Category } from "@/types/product.types"

export class SupabaseProductRepository implements ProductRepository {
  private async db() {
    return createClient()
  }

  async findAll(options?: { categoryId?: string; availableOnly?: boolean }): Promise<Product[]> {
    const supabase = await this.db()
    let query = supabase
      .from("products")
      .select("id, category_id, name, price, image_url, description, is_available, options, created_at, updated_at")
      .order("created_at", { ascending: false })

    if (options?.availableOnly) query = query.eq("is_available", true)
    if (options?.categoryId) query = query.eq("category_id", options.categoryId)

    const { data } = await query
    return (data ?? []) as unknown as Product[]
  }

  async findById(id: string): Promise<Product | null> {
    const supabase = await this.db()
    const { data } = await supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("id", id)
      .single()
    return data as unknown as Product | null
  }

  async findCategories(activeOnly = true): Promise<Category[]> {
    const supabase = await this.db()
    let query = supabase.from("categories").select("*").order("sort_order")
    if (activeOnly) query = query.eq("is_active", true)
    const { data } = await query
    return (data ?? []) as unknown as Category[]
  }
}
