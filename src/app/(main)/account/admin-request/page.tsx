import { Suspense } from "react"
import type { Metadata } from "next"
import { AdminRequestForm } from "@/components/account/AdminRequestForm"

export const metadata: Metadata = { title: "관리자 접근 요청 - GigaCoffee" }

export default function AdminRequestPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">관리자 접근 요청</h1>
      <p className="mb-8 text-sm text-gray-500">
        관리자 권한은 root 관리자(admin)의 승인이 필요합니다.
        요청 사유를 작성하면 검토 후 승인 여부를 알려드립니다.
      </p>
      <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-gray-100" />}>
        <AdminRequestForm />
      </Suspense>
    </div>
  )
}
