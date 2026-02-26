import type { Metadata } from "next"
import { NotificationForm } from "@/components/notifications/NotificationForm"
import { getNotificationLogs } from "@/actions/notification.actions"
import { formatDateTime } from "@/lib/utils/format"
import { Badge } from "@/components/ui/Badge"

export const metadata: Metadata = { title: "알림 관리 - 관리자" }

export default async function NotificationsPage() {
  const { logs } = await getNotificationLogs()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">알림 관리</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">알림 발송</h2>
          <NotificationForm />
        </div>
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">발송 이력</h2>
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[500px]">
            {logs.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-8">발송 이력이 없습니다.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 text-sm">
                  <Badge variant={log.status === "success" ? "success" : log.status === "failed" ? "danger" : "warning"}>
                    {log.type}
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{log.event_type}</p>
                    <p className="text-xs text-gray-500">{log.sent_at ? formatDateTime(log.sent_at) : "미발송"}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
