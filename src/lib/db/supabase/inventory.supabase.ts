import { createServiceClient } from "@/lib/supabase/server"
import type { InventoryRepository, InsertStockHistoryData } from "../repositories/inventory.repository"
import type { Inventory } from "@/types/inventory.types"

export class SupabaseInventoryRepository implements InventoryRepository {
  private async db() {
    return createServiceClient()
  }

  async findAll(storeId?: string | null): Promise<Inventory[]> {
    const supabase = await this.db()
    let query = supabase
      .from("inventory")
      .select("*, product:products(id, name, category:categories(name))")
      .order("quantity", { ascending: true })
    if (storeId) query = query.eq("store_id", storeId)
    const { data } = await query
    return (data ?? []) as unknown as Inventory[]
  }

  async findByProduct(productId: string, storeId?: string | null): Promise<{ quantity: number; low_stock_threshold: number } | null> {
    const supabase = await this.db()
    let query = supabase
      .from("inventory")
      .select("quantity, low_stock_threshold")
      .eq("product_id", productId)
    if (storeId) query = query.eq("store_id", storeId)
    const { data } = await query.maybeSingle()
    return data as { quantity: number; low_stock_threshold: number } | null
  }

  async upsert(productId: string, quantity: number, storeId?: string | null): Promise<void> {
    const supabase = await this.db()
    await supabase
      .from("inventory")
      .upsert({
        product_id: productId,
        store_id: storeId ?? null,
        quantity,
        updated_at: new Date().toISOString(),
      })
  }

  async insertHistory(data: InsertStockHistoryData): Promise<void> {
    const supabase = await this.db()
    await supabase.from("stock_histories").insert({
      product_id: data.productId,
      store_id: data.storeId ?? null,
      change_qty: data.changeQty,
      reason: data.reason ?? null,
      type: data.type,
      created_by: data.createdBy ?? null,
    })
  }
}
