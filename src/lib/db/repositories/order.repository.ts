import type { Order, OrderStatus } from "@/types/order.types"
import type { Json } from "@/types/database.types"

export interface CreateOrderData {
  userId: string
  totalAmount: number
  memo?: string | null
}

export interface CreateOrderItemData {
  orderId: string
  productId: string
  productName: string
  quantity: number
  options: Json
  lineTotal: number
}

export interface OrderWithItems extends Omit<Order, "order_items"> {
  order_items: { product_name: string }[]
}

export interface SalesOrderRow {
  total_amount: number
  created_at: string
  status: string
}

export interface OrderRepository {
  create(data: CreateOrderData): Promise<Order>
  insertItems(items: CreateOrderItemData[]): Promise<void>
  findById(id: string): Promise<{ total_amount: number; user_id: string } | null>
  findByUser(userId: string): Promise<OrderWithItems[]>
  findAll(limit?: number): Promise<Order[]>
  findToday(): Promise<Order[]>
  findForSales(from: Date): Promise<SalesOrderRow[]>
  updateStatus(orderId: string, status: OrderStatus): Promise<Order>
}
