import { NextResponse } from "next/server"

export async function GET() {
  // Firebase compat SDK 없이 순수 커스텀 push 핸들러만 사용.
  // getToken()은 SW 등록 객체만 있으면 동작하므로 SW 내부에 Firebase 코드 불필요.
  // - 열린 탭이 있으면 → postMessage({ type: 'FCM_FOREGROUND' }) → 인앱 토스트
  // - 열린 탭이 없으면 → showNotification → OS 알림
  const swContent = `
self.addEventListener('install', () => { self.skipWaiting() })
self.addEventListener('activate', (event) => { event.waitUntil(clients.claim()) })

self.addEventListener('push', (event) => {
  let payload = {}
  try { payload = event.data ? event.data.json() : {} } catch(e) {}
  const title = (payload.notification && payload.notification.title) || '알림'
  const body = (payload.notification && payload.notification.body) || ''

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        clientList.forEach((client) => {
          client.postMessage({ type: 'FCM_FOREGROUND', payload: payload })
        })
      } else {
        return self.registration.showNotification(title, {
          body: body,
          icon: '/icon-192x192.png',
        })
      }
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow('/'))
})
`

  return new NextResponse(swContent, {
    headers: {
      "Content-Type": "application/javascript",
      "Service-Worker-Allowed": "/",
    },
  })
}
