export interface InsertPaymentData {
  orderId: string
  portonePaymentId: string
  merchantUid: string
  method: string
  status: string
  amount: number
  rawResponse: unknown
}

export interface PaymentRepository {
  insert(data: InsertPaymentData): Promise<void>
}
