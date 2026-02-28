"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function KioskCompletePage() {
  const router = useRouter()

  // 5초 후 자동으로 메뉴 화면으로 돌아감
  useEffect(() => {
    const timer = setTimeout(() => router.push("/kiosk"), 5000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="text-center">
        <div className="mb-6 text-8xl">✅</div>
        <h1 className="text-4xl font-bold text-white">주문 완료!</h1>
        <p className="mt-4 text-gray-400">잠시 후 준비되면 알려드리겠습니다.</p>
        <p className="mt-8 text-sm text-gray-600">5초 후 메뉴 화면으로 돌아갑니다...</p>
        <button
          onClick={() => router.push("/kiosk")}
          className="mt-6 rounded-xl bg-amber-500 px-8 py-3 font-bold text-gray-900 hover:bg-amber-400"
        >
          처음으로
        </button>
      </div>
    </div>
  )
}
