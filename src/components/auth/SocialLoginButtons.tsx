"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { useAuth } from "@/hooks/useAuth"

export function SocialLoginButtons() {
  const { signInWithOAuth } = useAuth()
  const [isLoading, setIsLoading] = useState<"kakao" | "google" | null>(null)

  async function handleOAuth(provider: "kakao" | "google") {
    setIsLoading(provider)
    try {
      await signInWithOAuth(provider)
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        variant="secondary"
        className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900"
        onClick={() => handleOAuth("kakao")}
        isLoading={isLoading === "kakao"}
      >
        카카오로 로그인
      </Button>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => handleOAuth("google")}
        isLoading={isLoading === "google"}
      >
        Google로 로그인
      </Button>
    </div>
  )
}
