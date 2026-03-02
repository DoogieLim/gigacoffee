"use client"

import { useEffect } from "react"
import { useFcmToken } from "@/hooks/useFcmToken"
import { useToastStore } from "@/stores/toastStore"

interface FcmInitializerProps {
  userId: string | null
}

export function FcmInitializer({ userId }: FcmInitializerProps) {
  useFcmToken(userId)

  const addToast = useToastStore((s) => s.addToast)

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return

    const messageHandler = (event: MessageEvent) => {
if (event.data?.type !== "FCM_FOREGROUND") return
      const payload = event.data.payload
      const title = payload?.notification?.title ?? "알림"
      const body = payload?.notification?.body
      const text = body ? `${title}: ${body}` : title
      addToast(text, "info")
    }

    navigator.serviceWorker.addEventListener("message", messageHandler)
    return () => {
      navigator.serviceWorker.removeEventListener("message", messageHandler)
    }
  }, [addToast])

  return null
}
