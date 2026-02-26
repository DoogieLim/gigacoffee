import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/LoginForm"
import { SocialLoginButtons } from "@/components/auth/SocialLoginButtons"

export const metadata: Metadata = { title: "로그인 - 인생고민" }

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold text-gray-900">로그인</h2>
      <LoginForm />
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm text-gray-500">
          <span className="bg-white px-2">또는</span>
        </div>
      </div>
      <SocialLoginButtons />
    </div>
  )
}
