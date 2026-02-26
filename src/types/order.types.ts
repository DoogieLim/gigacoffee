import { SelectedOption } from "./product.types"

export type OrderStatus = "pending" | "paid" | "preparing" | "ready" | "completed" | "cancelled"
export type PaymentMethod = "card" | "kakao_pay" | "naver_pay" | "toss" | "bank_transfer"
export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled" | "refunded"

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  quantity: number
  options: SelectedOption[]
  line_total: number
}

export interface Order {
  id: string
  user_id: string
  status: OrderStatus
  total_amount: number
  memo: string | null
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface CartItem {
  product_id: string
  product_name: string
  price: number
  quantity: number
  options: SelectedOption[]
  image_url: string | null
}

export interface CreateOrderInput {
  items: CartItem[]
  memo?: string
}
