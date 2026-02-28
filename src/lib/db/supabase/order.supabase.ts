import { createServiceClient } from "@/lib/supabase/server"
import type {
  OrderRepository,
  CreateOrderData,
  CreateOrderItemData,
  OrderWithItems,
  SalesOrderRow,
} from "../repositories/order.repository"
import type { Order, OrderStatus } from "@/types/order.types"

export class SupabaseOrderRepository implements OrderRepository {
  private async db() {
    return createServiceClient()
  }

  async create(data: CreateOrderData): Promise<Order> {
    const supabase = await this.db()
    const { data: row, error } = await supabase
      .from("orders")
      .insert({
        user_id: data.userId,
        total_amount: data.totalAmount,
        memo: data.memo ?? null,
        delivery_type: data.deliveryType,
        delivery_address: (data.deliveryAddress ?? null) as import("@/types/database.types").Json | null,
        delivery_fee: data.deliveryFee,
      })
      .select()
      .single()
    if (error || !row) throw new Error("주문 생성에 실패했습니다.")
    return row as unknown as Order
  }

  async insertItems(items: CreateOrderItemData[]): Promise<void> {
    const supabase = await this.db()
    await supabase.from("order_items").insert(
      items.map((item) => ({
        order_id: item.orderId,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        options: item.options,
        line_total: item.lineTotal,
      }))
    )
  }

  async findById(id: string): Promise<{ total_amount: number; user_id: string } | null> {
    const supabase = await this.db()
    const { data } = await supabase
      .from("orders")
      .select("total_amount, user_id")
      .eq("id", id)
      .single()
    return data as { total_amount: number; user_id: string } | null
  }

  async findByUser(userId: string): Promise<OrderWithItems[]> {
    const supabase = await this.db()
    const { data } = await supabase
      .from("orders")
      .select("id, status, total_amount, delivery_type, delivery_address, delivery_fee, created_at, updated_at, user_id, memo, order_items(product_name)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
    return (data ?? []) as unknown as OrderWithItems[]
  }

  async findAll(limit = 50): Promise<Order[]> {
    const supabase = await this.db()
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)
    return (data ?? []) as unknown as Order[]
  }

  async findToday(): Promise<Order[]> {
    const supabase = await this.db()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const { data } = await supabase
      .from("orders")
      .select("id, total_amount, status, delivery_type, delivery_fee, created_at, user_id, memo, updated_at")
      .gte("created_at", today.toISOString())
      .order("created_at", { ascending: false })
    return (data ?? []) as unknown as Order[]
  }

  async findForSales(from: Date): Promise<SalesOrderRow[]> {
    const supabase = await this.db()
    const { data } = await supabase
      .from("orders")
      .select("total_amount, created_at, status")
      .gte("created_at", from.toISOString())
      .neq("status", "cancelled")
    return (data ?? []) as SalesOrderRow[]
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const supabase = await this.db()
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .select()
      .single()
    if (error || !data) throw new Error("주문 상태 변경에 실패했습니다.")
    return data as unknown as Order
  }
}
