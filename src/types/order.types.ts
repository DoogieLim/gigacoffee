import { SelectedOption } from "./product.types"

export type OrderStatus = "pending" | "paid" | "preparing" | "out_for_delivery" | "ready" | "completed" | "cancelled"
export type PaymentMethod = "card" | "kakao_pay" | "naver_pay" | "toss" | "bank_transfer"
export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled" | "refunded"
export type DeliveryType = "dine-in" | "pickup" | "robot" | "rider"

export interface DeliveryAddress {
  zonecode: string
  address: string
  detail: string
}

export interface DeliverySetting {
  type: "robot" | "rider"
  fee: number
  is_enabled: boolean
  updated_at: string
}

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
  store_id: string | null
  status: OrderStatus
  total_amount: number
  memo: string | null
  delivery_type: DeliveryType
  delivery_address: DeliveryAddress | null
  delivery_fee: number
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface CartItem {
  itemKey: string
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
  delivery_type: DeliveryType
  delivery_address?: DeliveryAddress
  delivery_fee: number
  store_id?: string
}
