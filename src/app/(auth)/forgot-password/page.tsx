"use client"

import { useState } from "react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { useAuth } from "@/hooks/useAuth"

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <div className="text-4xl">📧</div>
        <p className="font-medium text-gray-900">이메일을 확인해주세요</p>
        <p className="text-sm text-gray-600">{email}로 비밀번호 재설정 링크를 발송했습니다.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold text-gray-900">비밀번호 찾기</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="이메일"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="가입하신 이메일을 입력해주세요"
          required
        />
        <Button type="submit" isLoading={isLoading} className="w-full">
          재설정 링크 받기
        </Button>
      </form>
    </div>
  )
}
