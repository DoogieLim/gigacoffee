import { NextResponse } from "next/server"

export async function GET() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  }

  const swContent = `
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js")

firebase.initializeApp(${JSON.stringify(config)})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification ?? {}
  if (!title) return
  self.registration.showNotification(title, {
    body: body ?? "",
    icon: "/icon-192x192.png",
  })
})
`

  return new NextResponse(swContent, {
    headers: {
      "Content-Type": "application/javascript",
      "Service-Worker-Allowed": "/",
    },
  })
}
