"use client"

import { useState } from "react"
import { approveAdminRequest, rejectAdminRequest } from "@/actions/admin.actions"

export function AdminRequestActions({ requestId }: { requestId: string }) {
  const [isLoading, setIsLoading] = useState<"approve" | "reject" | null>(null)
  const [done, setDone] = useState(false)
  const [result, setResult] = useState<"approved" | "rejected" | null>(null)

  async function handle(action: "approve" | "reject") {
    setIsLoading(action)
    const fn = action === "approve" ? approveAdminRequest : rejectAdminRequest
    const res = await fn(requestId)
    setIsLoading(null)
    if (!res.error) {
      setDone(true)
      setResult(action === "approve" ? "approved" : "rejected")
    } else {
      alert(res.error)
    }
  }

  if (done) {
    return (
      <span className={`text-xs font-medium ${result === "approved" ? "text-green-600" : "text-red-500"}`}>
        {result === "approved" ? "승인 완료" : "거절 완료"}
      </span>
    )
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handle("approve")}
        disabled={!!isLoading}
        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        {isLoading === "approve" ? "처리 중..." : "승인"}
      </button>
      <button
        onClick={() => handle("reject")}
        disabled={!!isLoading}
        className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50"
      >
        {isLoading === "reject" ? "처리 중..." : "거절"}
      </button>
    </div>
  )
}
