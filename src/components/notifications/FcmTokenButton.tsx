"use client"

import { useState } from "react"
import { requestFcmToken } from "@/lib/firebase/messaging"

export function FcmTokenButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "denied" | "error">(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return "idle"
    if (Notification.permission === "granted") return "success"
    if (Notification.permission === "denied") return "denied"
    return "idle"
  })
  const [errorMsg, setErrorMsg] = useState("")

  async function handleRequest() {
    setStatus("loading")
    setErrorMsg("")
    try {
      const token = await requestFcmToken()
      if (!token) {
        setStatus("denied")
        return
      }
      const res = await fetch("/api/members/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fcm_token: token }),
      })
      setStatus(res.ok ? "success" : "error")
    } catch (err) {
      console.error("[FCM]", err)
      setErrorMsg(String(err))
      setStatus("error")
    }
  }

  const label = {
    idle: "알림 허용",
    loading: "등록 중...",
    success: "알림 등록 완료",
    denied: "알림 권한이 거부됨 (브라우저 설정에서 허용)",
    error: "등록 실패 — 다시 시도",
  }[status]

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleRequest}
        disabled={status === "loading" || status === "success"}
        className={`w-full rounded-xl border px-4 py-4 text-left font-medium transition-colors ${
          status === "success"
            ? "border-green-200 bg-green-50 text-green-700"
            : status === "denied" || status === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50"
        }`}
      >
        {label}
      </button>
      {errorMsg && (
        <p className="text-xs text-red-500 px-1">{errorMsg}</p>
      )}
    </div>
  )
}
