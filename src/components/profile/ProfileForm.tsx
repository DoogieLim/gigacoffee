"use client"

import { useState } from "react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { updateMyProfile } from "@/actions/member.actions"

interface ProfileFormProps {
  initialName: string
  initialPhone: string
}

export function ProfileForm({ initialName, initialPhone }: ProfileFormProps) {
  const [name, setName] = useState(initialName)
  const [phone, setPhone] = useState(initialPhone)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    await updateMyProfile({ name, phone })
    setMessage("프로필이 업데이트되었습니다.")
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="이름" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input
        label="휴대폰"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="01012345678"
      />
      {message && <p className="text-sm text-green-600">{message}</p>}
      <Button type="submit" isLoading={isLoading}>저장</Button>
    </form>
  )
}
