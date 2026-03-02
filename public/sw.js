// GigaCoffee Service Worker
// 오프라인 캐싱 없음 — PWA 설치 prompt 활성화 목적

self.addEventListener("install", () => self.skipWaiting())
self.addEventListener("activate", (event) => event.waitUntil(clients.claim()))
