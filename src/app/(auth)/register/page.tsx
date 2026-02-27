import type { Metadata } from "next"
import { RegisterForm } from "@/components/auth/RegisterForm"

export const metadata: Metadata = { title: "회원가입 - GigaCoffee" }

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold text-gray-900">회원가입</h2>
      <RegisterForm />
    </div>
  )
}
