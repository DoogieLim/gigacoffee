import { Suspense } from "react"
import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/LoginForm"
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons"

export const metadata: Metadata = { title: "로그인 - GigaCoffee" }

const TEST_ACCOUNTS = [
  { label: "관리자", email: "admin@gigacoffee.com", password: "admin" },
  { label: "테스트 유저", email: "test@gigacoffee.com", password: "test1234" },
]

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold text-gray-900">로그인</h2>

      {/* 테스트 계정 안내 (개발용) */}
      <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700">🧪 테스트 계정</p>
        <div className="flex flex-col gap-1.5">
          {TEST_ACCOUNTS.map((acc) => (
            <div key={acc.email} className="flex items-center justify-between text-xs">
              <span className="font-medium text-amber-800">{acc.label}</span>
              <span className="font-mono text-amber-700">
                {acc.email} / {acc.password}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-gray-100" />}>
        <LoginForm />
      </Suspense>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm text-gray-500">
          <span className="bg-white px-2">또는</span>
        </div>
      </div>
      <Suspense fallback={<div className="h-24 animate-pulse rounded-lg bg-gray-100" />}>
        <SocialLoginButtons />
      </Suspense>
    </div>
  )
}
