"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { useAuth } from "@/hooks/useAuth"
import { registerSchema } from "@/lib/utils/validation"
import { ROUTES } from "@/lib/constants/routes"

export function RegisterForm() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "", name: "", phone: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  function handleChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    const parsed = registerSchema.safeParse(formData)
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      parsed.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    setIsLoading(true)
    try {
      await signUp(formData.email, formData.password, formData.name)
      router.push(ROUTES.HOME)
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : "회원가입에 실패했습니다." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="이름" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} error={errors.name} required />
      <Input label="이메일" type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} error={errors.email} required />
      <Input label="휴대폰" type="tel" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="01012345678" error={errors.phone} />
      <Input label="비밀번호" type="password" value={formData.password} onChange={(e) => handleChange("password", e.target.value)} error={errors.password} required />
      <Input label="비밀번호 확인" type="password" value={formData.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)} error={errors.confirmPassword} required />
      {errors.general && <p className="text-sm text-red-600">{errors.general}</p>}
      <Button type="submit" isLoading={isLoading} className="w-full">
        회원가입
      </Button>
    </form>
  )
}
