import type { Order, OrderStatus, DeliveryType, DeliveryAddress } from "@/types/order.types"
import type { Json } from "@/types/database.types"

export interface CreateOrderData {
  userId: string
  storeId?: string | null
  totalAmount: number
  memo?: string | null
  deliveryType: DeliveryType
  deliveryAddress?: DeliveryAddress | null
  deliveryFee: number
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
  findById(id: string): Promise<{ total_amount: number; user_id: string; delivery_type: string } | null>
  findItemsByOrderId(orderId: string): Promise<{ product_name: string; quantity: number }[]>
  findByUser(userId: string): Promise<OrderWithItems[]>
  findAll(limit?: number, storeId?: string | null): Promise<Order[]>
  findToday(storeId?: string | null): Promise<Order[]>
  findForSales(from: Date, storeId?: string | null): Promise<SalesOrderRow[]>
  updateStatus(orderId: string, status: OrderStatus): Promise<Order>
}
