import type { PortoneVerifyResult } from "./types"

// PortOne v2 REST API
// Authorization: PortOne {apiSecret} 헤더 방식 (토큰 교환 불필요)
const PORTONE_API_BASE = "https://api.portone.io"

function getAuthHeader() {
  return `PortOne ${process.env.PORTONE_API_SECRET}`
}

export async function verifyPayment(paymentId: string): Promise<PortoneVerifyResult> {
  const response = await fetch(`${PORTONE_API_BASE}/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: getAuthHeader() },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`결제 조회 실패 (${response.status}): ${error}`)
  }

  return response.json() as Promise<PortoneVerifyResult>
}

export async function cancelPayment(paymentId: string, reason: string): Promise<void> {
  const response = await fetch(
    `${PORTONE_API_BASE}/payments/${encodeURIComponent(paymentId)}/cancel`,
    {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`결제 취소 실패 (${response.status}): ${error}`)
  }
}
