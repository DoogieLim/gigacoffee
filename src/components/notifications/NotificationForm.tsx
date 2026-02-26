"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import type { NotificationChannel, NotificationEventType } from "@/types/notification.types"

const EVENT_OPTIONS = [
  { value: "ORDER_PAID", label: "주문 완료" },
  { value: "ORDER_PREPARING", label: "준비 중" },
  { value: "ORDER_READY", label: "픽업 가능" },
  { value: "ORDER_CANCELLED", label: "주문 취소" },
  { value: "LOW_STOCK", label: "재고 부족" },
  { value: "CUSTOM", label: "직접 입력" },
]

const CHANNEL_OPTIONS: { value: NotificationChannel; label: string }[] = [
  { value: "kakao", label: "카카오 알림톡" },
  { value: "push", label: "앱 푸시" },
  { value: "sms", label: "SMS" },
]

export function NotificationForm() {
  const [eventType, setEventType] = useState<NotificationEventType>("ORDER_PAID")
  const [recipientId, setRecipientId] = useState("")
  const [channels, setChannels] = useState<NotificationChannel[]>(["kakao"])
  const [customMessage, setCustomMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  function toggleChannel(channel: NotificationChannel) {
    setChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)
    try {
      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId, eventType, channels, data: { message: customMessage } }),
      })
      if (response.ok) {
        setResult("알림이 성공적으로 발송되었습니다.")
      } else {
        setResult("알림 발송에 실패했습니다.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="수신자 ID"
        value={recipientId}
        onChange={(e) => setRecipientId(e.target.value)}
        placeholder="사용자 UUID"
        required
      />
      <Select
        label="알림 유형"
        value={eventType}
        onChange={(e) => setEventType(e.target.value as NotificationEventType)}
        options={EVENT_OPTIONS}
      />
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">발송 채널</label>
        <div className="flex gap-3">
          {CHANNEL_OPTIONS.map((ch) => (
            <label key={ch.value} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={channels.includes(ch.value)}
                onChange={() => toggleChannel(ch.value)}
                className="rounded"
              />
              {ch.label}
            </label>
          ))}
        </div>
      </div>
      {eventType === "CUSTOM" && (
        <Input
          label="메시지"
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          placeholder="발송할 메시지를 입력하세요"
        />
      )}
      {result && (
        <p className={`text-sm ${result.includes("성공") ? "text-green-600" : "text-red-600"}`}>
          {result}
        </p>
      )}
      <Button type="submit" isLoading={isLoading}>
        알림 발송
      </Button>
    </form>
  )
}
