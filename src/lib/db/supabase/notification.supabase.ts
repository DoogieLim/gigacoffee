import { createServiceClient } from "@/lib/supabase/server"
import type { NotificationRepository, InsertNotificationLogData } from "../repositories/notification.repository"
import type { NotificationLog } from "@/types/notification.types"
import type { Json } from "@/types/database.types"

export class SupabaseNotificationRepository implements NotificationRepository {
  private async db() {
    return createServiceClient()
  }

  async insertLog(data: InsertNotificationLogData): Promise<void> {
    const supabase = await this.db()
    await supabase.from("notification_logs").insert({
      type: data.type,
      recipient_id: data.recipientId,
      event_type: data.eventType,
      payload: data.payload as Json,
      status: data.status,
      sent_at: data.sentAt ?? null,
    })
  }

  async findLogs(options: { page: number; limit: number }): Promise<{ logs: NotificationLog[]; total: number }> {
    const supabase = await this.db()
    const { data, count } = await supabase
      .from("notification_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((options.page - 1) * options.limit, options.page * options.limit - 1)
    return { logs: (data ?? []) as unknown as NotificationLog[], total: count ?? 0 }
  }
}
