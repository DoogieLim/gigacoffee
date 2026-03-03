"use client"

import { useEffect } from "react"
import { useFcmToken } from "@/hooks/useFcmToken"
import { useToastStore } from "@/stores/toastStore"

// 고객 페이지에서 표시할 이벤트 (주문 상태 변경 알림)
export const CUSTOMER_FCM_EVENTS = [
  "ORDER_PAID",
  "ORDER_PREPARING",
  "ORDER_OUT_FOR_DELIVERY",
  "ORDER_READY",
  "ORDER_COMPLETED",
  "ORDER_CANCELLED",
] as const

// 관리자 페이지에서 표시할 이벤트 (운영 알림)
export const ADMIN_FCM_EVENTS = ["NEW_ORDER", "LOW_STOCK"] as const

interface FcmInitializerProps {
  userId: string | null
  /** 표시할 이벤트 타입 목록. 미지정 시 모든 이벤트 표시. */
  allowedEvents?: readonly string[]
}

export function FcmInitializer({ userId, allowedEvents }: FcmInitializerProps) {
  useFcmToken(userId)

  const addToast = useToastStore((s) => s.addToast)

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return

    const messageHandler = (event: MessageEvent) => {
      if (event.data?.type !== "FCM_FOREGROUND") return
      const payload = event.data.payload

      // 이벤트 필터: allowedEvents가 지정된 경우 해당 이벤트만 표시
      const eventType = payload?.data?.eventType
      if (allowedEvents && eventType && !allowedEvents.includes(eventType)) return

      const title = payload?.notification?.title ?? "알림"
      const body = payload?.notification?.body
      const text = body ? `${title}: ${body}` : title
      addToast(text, "info")
    }

    navigator.serviceWorker.addEventListener("message", messageHandler)
    return () => {
      navigator.serviceWorker.removeEventListener("message", messageHandler)
    }
  }, [addToast, allowedEvents])

  return null
}
