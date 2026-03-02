import type { Inventory, StockHistoryType } from "@/types/inventory.types"

export interface InsertStockHistoryData {
  productId: string
  storeId?: string | null
  changeQty: number
  reason?: string | null
  type: StockHistoryType
  createdBy?: string | null
}

export interface InventoryRepository {
  findAll(storeId?: string | null): Promise<Inventory[]>
  findByProduct(productId: string, storeId?: string | null): Promise<{ quantity: number; low_stock_threshold: number } | null>
  upsert(productId: string, quantity: number, storeId?: string | null): Promise<void>
  insertHistory(data: InsertStockHistoryData): Promise<void>
}
