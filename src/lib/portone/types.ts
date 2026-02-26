export type PortonePayMethod = "CARD" | "EASY_PAY" | "VIRTUAL_ACCOUNT" | "TRANSFER" | "MOBILE"
export type PortoneEasyPayProvider = "KAKAOPAY" | "NAVERPAY" | "TOSSPAY" | "PAYCO" | "SSGPAY"

// CARD, VIRTUAL_ACCOUNT, TRANSFER, MOBILE 결제 시 사용할 PG사
// 채널이 하나뿐이라면 생략 가능 (자동으로 설정된 첫 번째 채널키 사용)
export type PortonePgProvider = "INICIS" | "TOSSPAYMENTS" | "KCP" | "NICE"

export interface PortonePaymentRequest {
  paymentId: string        // 주문 고유 ID (merchant-defined)
  orderName: string
  totalAmount: number
  payMethod: PortonePayMethod
  pgProvider?: PortonePgProvider   // 다중 PG 사용 시 명시, 단일 채널이면 생략
  easyPayProvider?: PortoneEasyPayProvider
  customerName: string
  customerEmail?: string
  customerPhone?: string
}

// PortOne v2 결제 결과 (브라우저 SDK 응답)
export interface PortonePaymentResponse {
  paymentId: string
  txId: string
  code?: string            // 오류 코드 (있으면 실패)
  message?: string
}

// PortOne v2 서버 검증 응답
export interface PortoneVerifyResult {
  id: string               // paymentId
  transactionId: string    // txId
  status: "PAID" | "VIRTUAL_ACCOUNT_ISSUED" | "READY" | "CANCELLED" | "FAILED"
  amount: {
    total: number
    taxFree: number
  }
  method: {
    type: string
  }
  requestedAt: string
  updatedAt: string
}
