import { SelectedOption } from "./product.types"

export type OrderStatus = "pending" | "paid" | "preparing" | "out_for_delivery" | "ready" | "completed" | "cancelled"
export type PaymentMethod = "card" | "kakao_pay" | "naver_pay" | "toss" | "bank_transfer"
export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled" | "refunded"
export type DeliveryType = "dine-in" | "pickup" | "robot" | "rider"

// HMG 기반 로봇 배달 세부 상태
export type RobotDeliveryStatus =
  | "robot_order_accepted"     // pRO001 주문 접수 완료
  | "robot_delivery_started"   // pRO002 배달 시작
  | "robot_arriving_soon"      // pRO003 도착 예정
  | "robot_pickup_requested"   // pRO004 수령 요청
  | "robot_pickup_delayed"     // pRO005 수령 지연
  | "robot_returning"          // pRO006 배달 회수
  | "robot_cancelled"          // pRO007 주문 취소
  | "robot_completed"          // 수령 완료

// 라이더 배달 세부 상태
export type RiderDeliveryStatus =
  | "rider_assigned"           // 라이더 배정
  | "rider_picked_up"          // 매장 픽업 완료
  | "rider_delivering"         // 배달 중
  | "rider_arriving_soon"      // 도착 예정
  | "rider_arrived"            // 도착
  | "rider_cancelled"          // 취소
  | "rider_completed"          // 배달 완료

export type DeliveryStatus = RobotDeliveryStatus | RiderDeliveryStatus

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
  delivery_status: DeliveryStatus | null
  robot_pin: string | null
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
