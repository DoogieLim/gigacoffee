"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/Button"

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-bold text-gray-900">오류가 발생했습니다.</h1>
      <p className="text-gray-600">{error.message}</p>
      <Button onClick={reset}>다시 시도</Button>
    </div>
  )
}
