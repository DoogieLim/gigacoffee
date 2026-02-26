// PortOne v2 채널키 매핑
// 각 결제 수단 × PG사 조합에 대해 env var을 명시적으로 참조
// (Next.js는 NEXT_PUBLIC_ 변수를 빌드 시 정적으로 인라인하므로 동적 접근 불가)
//
// .env.local에 사용하는 조합만 채워 넣으면 됩니다.
// 예) 카드는 KG이니시스만 사용: NEXT_PUBLIC_PORTONE_CHANNEL_KEY_CARD_INICIS 만 설정

import type { PortonePgProvider, PortoneEasyPayProvider, PortonePayMethod } from "./types"

export const CHANNEL_KEY_MAP = {
  CARD: {
    INICIS:       process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_CARD_INICIS,
    TOSSPAYMENTS: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_CARD_TOSSPAYMENTS,
    KCP:          process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_CARD_KCP,
    NICE:         process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_CARD_NICE,
  },
  VIRTUAL_ACCOUNT: {
    INICIS:       process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_VIRTUAL_ACCOUNT_INICIS,
    TOSSPAYMENTS: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_VIRTUAL_ACCOUNT_TOSSPAYMENTS,
    KCP:          process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_VIRTUAL_ACCOUNT_KCP,
    NICE:         process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_VIRTUAL_ACCOUNT_NICE,
  },
  TRANSFER: {
    INICIS:       process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_TRANSFER_INICIS,
    TOSSPAYMENTS: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_TRANSFER_TOSSPAYMENTS,
    KCP:          process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_TRANSFER_KCP,
    NICE:         process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_TRANSFER_NICE,
  },
  MOBILE: {
    INICIS:       process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_MOBILE_INICIS,
    TOSSPAYMENTS: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_MOBILE_TOSSPAYMENTS,
    KCP:          process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_MOBILE_KCP,
    NICE:         process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_MOBILE_NICE,
  },
  EASY_PAY: {
    KAKAOPAY: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_KAKAOPAY,
    NAVERPAY: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_NAVERPAY,
    TOSSPAY:  process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_TOSSPAY,
    PAYCO:    process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_PAYCO,
    SSGPAY:   process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY_SSGPAY,
  },
} as const

export function resolveChannelKey(
  payMethod: PortonePayMethod,
  pgProvider?: PortonePgProvider,
  easyPayProvider?: PortoneEasyPayProvider
): string {
  if (payMethod === "EASY_PAY") {
    if (!easyPayProvider) throw new Error("EASY_PAY 결제 시 easyPayProvider가 필요합니다.")
    const key = CHANNEL_KEY_MAP.EASY_PAY[easyPayProvider]
    if (!key) throw new Error(`${easyPayProvider} 채널키가 설정되지 않았습니다. NEXT_PUBLIC_PORTONE_CHANNEL_KEY_${easyPayProvider}를 확인하세요.`)
    return key
  }

  const group = CHANNEL_KEY_MAP[payMethod as keyof Omit<typeof CHANNEL_KEY_MAP, "EASY_PAY">]
  if (!group) throw new Error(`지원하지 않는 결제 수단입니다: ${payMethod}`)

  // pgProvider 명시 시 해당 채널키 사용
  if (pgProvider) {
    const key = group[pgProvider as keyof typeof group]
    if (key) return key
    throw new Error(`${payMethod}_${pgProvider} 채널키가 설정되지 않았습니다.`)
  }

  // pgProvider 미지정 → 설정된 첫 번째 채널키 자동 선택 (채널이 하나인 경우)
  const firstKey = Object.values(group).find((v) => !!v)
  if (!firstKey) throw new Error(`${payMethod} 채널키가 하나도 설정되지 않았습니다.`)
  return firstKey
}
