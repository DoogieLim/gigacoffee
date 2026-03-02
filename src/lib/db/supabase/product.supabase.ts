import { createClient, createServiceClient } from "@/lib/supabase/server"
import type { ProductRepository, CreateProductData, UpdateProductData } from "../repositories/product.repository"
import type { Product, Category } from "@/types/product.types"

export class SupabaseProductRepository implements ProductRepository {
  private async db() {
    return createClient()
  }

  private async serviceDb() {
    return createServiceClient()
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

  async create(data: CreateProductData): Promise<Product> {
    const supabase = await this.serviceDb()
    const { data: row, error } = await supabase
      .from("products")
      .insert({
        category_id: data.categoryId,
        name: data.name,
        price: data.price,
        image_url: data.imageUrl ?? null,
        description: data.description ?? null,
        is_available: data.isAvailable ?? true,
        options: (data.options ?? []) as unknown as never,
      })
      .select("*, category:categories(*)")
      .single()
    if (error || !row) throw new Error("상품 생성에 실패했습니다.")
    return row as unknown as Product
  }

  async update(id: string, data: UpdateProductData): Promise<Product> {
    const supabase = await this.serviceDb()
    const updates: Record<string, unknown> = {}
    if (data.categoryId !== undefined) updates.category_id = data.categoryId
    if (data.name !== undefined) updates.name = data.name
    if (data.price !== undefined) updates.price = data.price
    if (data.imageUrl !== undefined) updates.image_url = data.imageUrl
    if (data.description !== undefined) updates.description = data.description
    if (data.isAvailable !== undefined) updates.is_available = data.isAvailable
    if (data.options !== undefined) updates.options = data.options ?? []

    const { data: row, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select("*, category:categories(*)")
      .single()
    if (error || !row) throw new Error("상품 수정에 실패했습니다.")
    return row as unknown as Product
  }

  async delete(id: string): Promise<void> {
    const supabase = await this.serviceDb()
    await supabase.from("products").delete().eq("id", id)
  }

  async searchByEmbedding(queryEmbedding: number[], limit = 10): Promise<Product[]> {
    const supabase = await this.db()

    // 1. product_embeddings 테이블에서 float8[] 임베딩 전체 조회 (PostgREST 표준 타입)
    const { data: embRows, error: embError } = await supabase
      .from("product_embeddings" as "products")
      .select("product_id, embedding")
    if (embError) throw new Error(`임베딩 조회 실패: ${embError.message}`)
    if (!embRows?.length) return []

    // 2. 코사인 유사도를 TypeScript에서 계산 (PostgREST RPC 우회)
    const cosineSim = (a: number[], b: number[]): number => {
      let dot = 0, na = 0, nb = 0
      for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i]
        na  += a[i] * a[i]
        nb  += b[i] * b[i]
      }
      return dot / (Math.sqrt(na) * Math.sqrt(nb))
    }

    const topIds = (embRows as unknown as { product_id: string; embedding: number[] }[]) // float4[] → JS number[]
      .map(e => ({ id: e.product_id, sim: cosineSim(queryEmbedding, e.embedding) }))
      .filter(e => e.sim > 0.5)
      .sort((a, b) => b.sim - a.sim)
      .slice(0, limit)
      .map(e => e.id)

    if (!topIds.length) return []

    // 3. 매칭된 상품 정보 조회 (유사도 순 정렬 유지)
    const { data, error } = await supabase
      .from("products")
      .select("id, category_id, name, price, image_url, description, is_available, options, created_at, updated_at")
      .in("id", topIds)
      .eq("is_available", true)
    if (error) throw new Error(`상품 조회 실패: ${error.message}`)

    const order = new Map(topIds.map((id, i) => [id, i]))
    return ((data ?? []) as unknown as Product[]).sort(
      (a, b) => (order.get((a as unknown as { id: string }).id) ?? 0) - (order.get((b as unknown as { id: string }).id) ?? 0)
    )
  }

  async updateEmbedding(id: string, embedding: number[]): Promise<void> {
    const supabase = await this.serviceDb()
    await (supabase.from("product_embeddings" as "products") as unknown as {
      upsert: (v: Record<string, unknown>) => Promise<void>
    }).upsert({ product_id: id, embedding })
  }
}
