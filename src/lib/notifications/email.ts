import type { NotificationResult } from "./types"

interface EmailPayload {
  to: string
  subject: string
  html: string
}

async function sendEmail(payload: EmailPayload): Promise<NotificationResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return { channel: "email", success: false, error: "RESEND_API_KEY 미설정" }
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "GigaCoffee <onboarding@resend.dev>",
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      return { channel: "email", success: false, error }
    }

    return { channel: "email", success: true }
  } catch (error) {
    return { channel: "email", success: false, error: String(error) }
  }
}

export async function sendNewOrderEmailToAdmin(data: {
  orderId: string
  totalAmount: number
  itemCount: number
  customerName?: string
  deliveryType: string
  items?: { product_name: string; quantity: number }[]
}): Promise<NotificationResult> {
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail) {
    return { channel: "email", success: false, error: "ADMIN_EMAIL 미설정" }
  }

  const deliveryLabel: Record<string, string> = {
    pickup: "픽업",
    robot: "로봇배달",
    rider: "라이더 배달",
  }

  return sendEmail({
    to: adminEmail,
    subject: `[GigaCoffee] 새 주문 도착 — ${data.totalAmount.toLocaleString()}원`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
        <h2 style="color:#92400e;margin-top:0;">☕ 새 주문이 들어왔습니다</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr>
            <td style="padding:8px 0;color:#6b7280;width:40%;">주문번호</td>
            <td style="padding:8px 0;font-weight:600;">${data.orderId.slice(0, 8).toUpperCase()}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;vertical-align:top;">주문 상품</td>
            <td style="padding:8px 0;">
              ${data.items && data.items.length > 0
                ? data.items.map((i) => `${i.product_name} × ${i.quantity}`).join("<br/>")
                : `${data.itemCount}건`}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;">결제 금액</td>
            <td style="padding:8px 0;font-weight:700;color:#92400e;">${data.totalAmount.toLocaleString()}원</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b7280;">수령 방법</td>
            <td style="padding:8px 0;">${deliveryLabel[data.deliveryType] ?? data.deliveryType}</td>
          </tr>
          ${data.customerName ? `
          <tr>
            <td style="padding:8px 0;color:#6b7280;">주문자</td>
            <td style="padding:8px 0;">${data.customerName}</td>
          </tr>` : ""}
        </table>
        <a href="https://gigacoffee.vercel.app/admin/orders"
           style="display:inline-block;margin-top:16px;padding:10px 20px;background:#92400e;color:#fff;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">
          주문 관리 페이지 바로가기
        </a>
        <p style="margin-top:24px;font-size:12px;color:#9ca3af;">GigaCoffee 자동 알림</p>
      </div>
    `,
  })
}
