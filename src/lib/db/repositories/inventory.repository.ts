import type { Inventory, StockHistoryType } from "@/types/inventory.types"

export interface InsertStockHistoryData {
  productId: string
  changeQty: number
  reason?: string | null
  type: StockHistoryType
  createdBy?: string | null
}

export interface InventoryRepository {
  findAll(): Promise<Inventory[]>
  findByProduct(productId: string): Promise<{ quantity: number; low_stock_threshold: number } | null>
  upsert(productId: string, quantity: number): Promise<void>
  insertHistory(data: InsertStockHistoryData): Promise<void>
}
