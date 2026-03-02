export type StockHistoryType = "in" | "out" | "adjust" | "cancel"

export interface Inventory {
  product_id: string
  store_id: string
  quantity: number
  low_stock_threshold: number
  updated_at: string
  product?: {
    id: string
    name: string
    category?: { name: string }
  }
}

export interface StockHistory {
  id: string
  product_id: string
  store_id: string | null
  change_qty: number
  reason: string | null
  type: StockHistoryType
  ref_order_id: string | null
  created_by: string | null
  created_at: string
  product?: { name: string }
  creator?: { name: string }
}

export interface AdjustStockInput {
  product_id: string
  change_qty: number
  reason: string
  type: StockHistoryType
}
