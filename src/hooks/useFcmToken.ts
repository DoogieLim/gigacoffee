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
        if (token) saveFcmToken(token).catch(console.error)
      })
    })
  }, [userId])
}
