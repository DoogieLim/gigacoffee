"use client"

import { getMessaging, getToken, onMessage } from "firebase/messaging"
import { getFirebaseApp } from "./client"

export async function requestFcmToken(): Promise<string | null> {
  try {
    const permission = await Notification.requestPermission()
    if (permission !== "granted") return null

    const messaging = getMessaging(getFirebaseApp())
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: await navigator.serviceWorker.register("/firebase-messaging-sw.js"),
    })
    return token
  } catch {
    return null
  }
}

export function onForegroundMessage(callback: (payload: { notification?: { title?: string; body?: string }; data?: Record<string, string> }) => void) {
  const messaging = getMessaging(getFirebaseApp())
  return onMessage(messaging, callback)
}
