"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { useAuth } from "@/hooks/useAuth"
import { ROUTES } from "@/lib/constants/routes"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get("from")
  const { signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      const user = await signIn(email, password)
      // 우선순위: kiosk 계정 → 관리자 → 일반 사용자
      if (user.isKiosk) {
        router.push(ROUTES.KIOSK)
      } else if (user.role && ["admin", "franchise_admin", "staff"].includes(user.role)) {
        // franchise_admin은 "admin".startsWith("admin") 체크에서 누락되므로 명시적 배열로 처리
        router.push(ROUTES.ADMIN)
      } else {
        router.push(from ?? ROUTES.HOME)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="이메일"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="example@email.com"
        required
      />
      <Input
        label="비밀번호"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" isLoading={isLoading} className="w-full">
        로그인
      </Button>
      <div className="flex justify-between text-sm text-gray-600">
        <Link href={ROUTES.FORGOT_PASSWORD} className="hover:text-amber-700">
          비밀번호 찾기
        </Link>
        <Link href={from ? `${ROUTES.REGISTER}?from=${from}` : ROUTES.REGISTER} className="hover:text-amber-700">
          회원가입
        </Link>
      </div>
    </form>
  )
}
