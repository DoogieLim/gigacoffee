import { Suspense } from "react"
import type { Metadata } from "next"
import { RegisterForm } from "@/components/auth/RegisterForm"
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons"

export const metadata: Metadata = { title: "회원가입 - GigaCoffee" }

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold text-gray-900">회원가입</h2>
      <Suspense fallback={<div className="h-24 animate-pulse rounded-lg bg-gray-100" />}>
        <SocialLoginButtons />
      </Suspense>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm text-gray-500">
          <span className="bg-white px-2">또는 이메일로 가입</span>
        </div>
      </div>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-gray-100" />}>
        <RegisterForm />
      </Suspense>
    </div>
  )
}
