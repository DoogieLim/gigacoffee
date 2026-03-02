"use client"

import { useEffect, useRef } from "react"
import { saveFcmToken } from "@/actions/notification.actions"

export function useFcmToken(userId: string | null) {
  const registeredRef = useRef(false)

  useEffect(() => {
    if (!userId || registeredRef.current) return
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return

    registeredRef.current = true

    import("@/lib/firebase/messaging").then(({ requestFcmToken }) => {
      requestFcmToken().then((token) => {
        if (token) {
          saveFcmToken(token).catch(console.error)
        } else {
          console.warn("[FCM] 토큰 없음 — 브라우저 알림 권한을 확인하세요 (현재:", Notification.permission, ")")
        }
      }).catch((err) => {
        console.error("[FCM] requestFcmToken 오류:", err)
      })
    })
  }, [userId])
}
