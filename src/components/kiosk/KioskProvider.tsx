"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { kioskAutoLogin } from "@/actions/kiosk.actions"

/**
 * 키오스크 자동 로그인 처리 컴포넌트
 * - 마운트 시 kiosk 계정으로 로그인 시도
 * - 성공하면 children 렌더링
 * - 실패하면 오류 메시지 표시
 */
export function KioskProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    kioskAutoLogin()
      .then(() => {
        router.refresh()
        setReady(true)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "키오스크 로그인 실패")
      })
  }, [router])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <p className="text-2xl font-bold text-red-400">시스템 오류</p>
          <p className="mt-2 text-gray-400">{error}</p>
          <p className="mt-4 text-sm text-gray-500">관리자에게 문의하세요.</p>
        </div>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-tech border-t-transparent" />
          <p className="mt-4 font-bold text-tech">GIGACʘFFEE</p>
          <p className="mt-1 text-sm text-gray-400">시스템 초기화 중...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
