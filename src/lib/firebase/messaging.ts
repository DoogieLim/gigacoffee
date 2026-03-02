"use client"

import { getMessaging, getToken, onMessage } from "firebase/messaging"
import { getFirebaseApp } from "./client"

export async function requestFcmToken(): Promise<string | null> {
  const permission = await Notification.requestPermission()
  if (permission !== "granted") {
    console.warn("[FCM] 알림 권한 거부됨:", permission)
    return null
  }

  const swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js")
  console.log("[FCM] SW 등록:", swReg.scope)

  const messaging = getMessaging(getFirebaseApp())
  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: swReg,
  })
  console.log("[FCM] 토큰:", token ? token.substring(0, 20) + "..." : "없음")
  return token
}

export function onForegroundMessage(callback: (payload: { notification?: { title?: string; body?: string }; data?: Record<string, string> }) => void) {
  const messaging = getMessaging(getFirebaseApp())
  return onMessage(messaging, callback)
}
