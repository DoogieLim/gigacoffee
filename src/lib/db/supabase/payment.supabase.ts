import { createServiceClient } from "@/lib/supabase/server"
import type { PaymentRepository, InsertPaymentData, PaymentRecord } from "../repositories/payment.repository"
import type { Json } from "@/types/database.types"

export class SupabasePaymentRepository implements PaymentRepository {
  private async db() {
    return createServiceClient()
  }

  async insert(data: InsertPaymentData): Promise<void> {
    const supabase = await this.db()
    await supabase.from("payments").insert({
      order_id: data.orderId,
      portone_payment_id: data.portonePaymentId,
      merchant_uid: data.merchantUid,
      method: data.method as "card",
      status: data.status as "paid",
      amount: data.amount,
      raw_response: data.rawResponse as Json,
    })
  }

  async findByOrderId(orderId: string): Promise<PaymentRecord | null> {
    const supabase = await this.db()
    const { data } = await supabase
      .from("payments")
      .select("id, order_id, portone_payment_id, status, amount")
      .eq("order_id", orderId)
      .maybeSingle()
    return data as unknown as PaymentRecord | null
  }

  async updateStatus(id: string, status: string): Promise<void> {
    const supabase = await this.db()
    await supabase.from("payments").update({ status: status as "paid" }).eq("id", id)
  }
}
