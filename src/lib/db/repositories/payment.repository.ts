export interface InsertPaymentData {
  orderId: string
  portonePaymentId: string
  merchantUid: string
  method: string
  status: string
  amount: number
  rawResponse: unknown
}

export interface PaymentRecord {
  id: string
  order_id: string
  portone_payment_id: string
  status: string
  amount: number
}

export interface PaymentRepository {
  insert(data: InsertPaymentData): Promise<void>
  findByOrderId(orderId: string): Promise<PaymentRecord | null>
  updateStatus(id: string, status: string): Promise<void>
}
