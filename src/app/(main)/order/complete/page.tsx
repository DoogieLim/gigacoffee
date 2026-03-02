"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ROUTES } from "@/lib/constants/routes"

const REDIRECT_SECONDS = 8

function OrderCompleteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS)

  useEffect(() => {
    if (countdown <= 0) {
      router.replace(ROUTES.HOME)
      return
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown, router])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="text-6xl">✅</div>
      <h1 className="text-2xl font-bold text-gray-900">주문이 완료되었습니다!</h1>
      <p className="text-gray-600">
        잠시 후 카카오 알림톡 또는 문자로 확인 메시지가 발송됩니다.
      </p>
      {orderId && (
        <Link
          href={`/my/orders/${orderId}`}
          className="rounded-xl bg-amber-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-800"
        >
          주문 실시간 추적하기
        </Link>
      )}
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm text-gray-400">
          {countdown}초 후 메인 화면으로 이동합니다...
        </p>
        <button
          onClick={() => router.replace(ROUTES.HOME)}
          className="text-sm text-amber-700 underline underline-offset-2"
        >
          지금 바로 이동
        </button>
      </div>
    </div>
  )
}

export default function OrderCompletePage() {
  return (
    <Suspense>
      <OrderCompleteContent />
    </Suspense>
  )
}
