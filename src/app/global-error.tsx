"use client"

import { useEffect } from "react"

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="ko">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center bg-neutral-50">
          <div className="text-6xl">🛠️</div>
          <div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight mb-2">
              잠시 준비 중입니다
            </h1>
            <p className="text-sm text-neutral-500 leading-relaxed">
              서비스 점검 중이에요.<br />
              잠시 후 다시 시도해 주세요.
            </p>
          </div>
          <button
            onClick={reset}
            className="rounded-2xl bg-amber-800 px-6 py-3 text-sm font-bold text-white hover:opacity-90 active:scale-95 transition-transform"
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  )
}
