"use client"

import { useRouter } from "next/navigation"

type Mode = "phone" | "kiosk" | "web"

const modes: { key: Mode; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    key: "kiosk",
    label: "키오스크",
    desc: "매장 내 터치스크린 주문",
    icon: (
      <svg className="h-12 w-12" fill="none" viewBox="0 0 48 48" stroke="currentColor" strokeWidth={1.5}>
        <rect x="8" y="4" width="32" height="36" rx="3" />
        <rect x="12" y="8" width="24" height="20" rx="1" className="fill-blue-50 stroke-current" />
        <circle cx="24" cy="34" r="2" className="fill-current" />
        <rect x="16" y="40" width="16" height="4" rx="1" />
      </svg>
    ),
  },
  {
    key: "phone",
    label: "모바일 앱",
    desc: "스마트폰 주문 + 배달 추적",
    icon: (
      <svg className="h-12 w-12" fill="none" viewBox="0 0 48 48" stroke="currentColor" strokeWidth={1.5}>
        <rect x="12" y="4" width="24" height="40" rx="4" />
        <rect x="15" y="8" width="18" height="28" rx="1" className="fill-blue-50 stroke-current" />
        <circle cx="24" cy="40" r="1.5" className="fill-current" />
      </svg>
    ),
  },
  {
    key: "web",
    label: "웹 브라우저",
    desc: "PC / 태블릿 웹 주문",
    icon: (
      <svg className="h-12 w-12" fill="none" viewBox="0 0 48 48" stroke="currentColor" strokeWidth={1.5}>
        <rect x="4" y="6" width="40" height="28" rx="3" />
        <rect x="8" y="10" width="32" height="20" rx="1" className="fill-blue-50 stroke-current" />
        <path d="M18 34v6M30 34v6M14 40h20" />
      </svg>
    ),
  },
]

export function ModeSelector() {
  const router = useRouter()

  function selectMode(mode: Mode) {
    document.cookie = `app_mode=${mode};path=/;max-age=${60 * 60 * 24 * 365}`
    if (mode === "kiosk") {
      router.push("/kiosk")
    } else {
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-brand to-neutral-900 px-6 py-12">
      {/* 로고 */}
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-2xl font-black text-white shadow-lg ring-2 ring-white/10">
          G
        </div>
        <h1 className="font-display text-3xl font-black text-white tracking-tighter">GigaCoffee</h1>
        <p className="mt-2 text-sm text-neutral-400">이용 환경을 선택해주세요</p>
      </div>

      {/* 모드 카드 */}
      <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-3">
        {modes.map((mode) => (
          <button
            key={mode.key}
            onClick={() => selectMode(mode.key)}
            className="group flex flex-col items-center rounded-3xl border-2 border-white/10 bg-white/5 px-6 py-8 text-center transition-all hover:border-tech hover:bg-white/10 hover:shadow-glow active:scale-95"
          >
            <div className="mb-4 text-neutral-400 transition-colors group-hover:text-tech">
              {mode.icon}
            </div>
            <h3 className="text-lg font-bold text-white">{mode.label}</h3>
            <p className="mt-1 text-xs text-neutral-500 group-hover:text-neutral-400">{mode.desc}</p>
          </button>
        ))}
      </div>

      {/* 하단 안내 */}
      <p className="mt-8 text-xs text-neutral-600">
        선택은 언제든 변경할 수 있습니다
      </p>
    </div>
  )
}
