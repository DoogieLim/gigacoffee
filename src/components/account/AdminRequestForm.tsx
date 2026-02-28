"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { requestAdminAccess, getMyAdminRequestStatus } from "@/actions/admin.actions"

const STATUS_MESSAGES = {
  pending: { label: "승인 대기 중", desc: "관리자가 요청을 검토하고 있습니다.", color: "text-amber-600 bg-amber-50" },
  approved: { label: "승인 완료", desc: "관리자 권한이 부여되었습니다. 관리자 페이지에 접속하세요.", color: "text-green-700 bg-green-50" },
  rejected: { label: "거절됨", desc: "요청이 거절되었습니다. 새로운 사유로 다시 요청할 수 있습니다.", color: "text-red-600 bg-red-50" },
}

export function AdminRequestForm() {
  const [reason, setReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"none" | "pending" | "approved" | "rejected" | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    getMyAdminRequestStatus().then(({ status }) => setStatus(status))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      const result = await requestAdminAccess(reason)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setStatus("pending")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (status === null) {
    return <div className="h-48 animate-pulse rounded-lg bg-gray-100" />
  }

  if (status !== "none" && status !== "rejected") {
    const info = STATUS_MESSAGES[status]
    return (
      <div className={`rounded-xl p-6 ${info.color}`}>
        <p className="font-semibold">{info.label}</p>
        <p className="mt-1 text-sm">{info.desc}</p>
        {status === "approved" && (
          <a href="/admin" className="mt-4 inline-block rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600">
            관리자 페이지 이동
          </a>
        )}
      </div>
    )
  }

  if (success) {
    return (
      <div className="rounded-xl bg-green-50 p-6 text-green-700">
        <p className="font-semibold">요청이 전송되었습니다.</p>
        <p className="mt-1 text-sm">관리자 검토 후 결과를 알려드립니다.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {status === "rejected" && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
          이전 요청이 거절되었습니다. 새로운 사유로 다시 요청할 수 있습니다.
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-700">요청 사유</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          required
          placeholder="관리자 권한이 필요한 이유를 작성해주세요."
          className="rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" isLoading={isLoading} className="w-full">
        요청 제출
      </Button>
    </form>
  )
}
