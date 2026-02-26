"use client"

import type { PortonePaymentRequest, PortonePaymentResponse, PortoneEasyPayProvider } from "./types"
import { resolveChannelKey } from "./channels"

// PortOne v2 브라우저 SDK (@portone/browser-sdk/v2)
// 채널키는 결제 수단 × PG사 조합으로 자동 선택 (src/lib/portone/channels.ts 참조)

export async function requestPayment(
  params: PortonePaymentRequest
): Promise<PortonePaymentResponse> {
  const PortOne = await import("@portone/browser-sdk/v2")

  const channelKey = resolveChannelKey(params.payMethod, params.pgProvider, params.easyPayProvider)

  const easyPayMap: Record<PortoneEasyPayProvider, { easyPayProvider: PortoneEasyPayProvider }> = {
    KAKAOPAY: { easyPayProvider: "KAKAOPAY" },
    NAVERPAY: { easyPayProvider: "NAVERPAY" },
    TOSSPAY:  { easyPayProvider: "TOSSPAY" },
    PAYCO:    { easyPayProvider: "PAYCO" },
    SSGPAY:   { easyPayProvider: "SSGPAY" },
  }

  const response = await PortOne.requestPayment({
    storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID!,
    channelKey,
    paymentId: params.paymentId,
    orderName: params.orderName,
    totalAmount: params.totalAmount,
    currency: "KRW",
    payMethod: params.payMethod,
    ...(params.payMethod === "EASY_PAY" &&
      params.easyPayProvider &&
      easyPayMap[params.easyPayProvider] && {
        easyPay: easyPayMap[params.easyPayProvider],
      }),
    customer: {
      fullName: params.customerName,
      email: params.customerEmail,
      phoneNumber: params.customerPhone,
    },
  })

  if (!response || response.code != null) {
    throw new Error(response?.message ?? "결제에 실패했습니다.")
  }

  return {
    paymentId: response.paymentId ?? params.paymentId,
    txId: response.txId ?? "",
  }
}
