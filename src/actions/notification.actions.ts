"use server"

import { createClient } from "@/lib/supabase/server"
import { notificationRepo } from "@/lib/db"
import { dispatch } from "@/lib/notifications/dispatcher"
import type { NotificationEvent } from "@/lib/notifications/dispatcher"

export async function sendNotification(
  recipientId: string,
  eventType: NotificationEvent,
  channels: ("kakao" | "push" | "sms")[],
  data: Record<string, string>
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("로그인이 필요합니다.")

  return dispatch({ recipientId, eventType, templateData: data, channels })
}

export async function saveFcmToken(token: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from("profiles").update({ fcm_token: token }).eq("id", user.id)
}

export async function getNotificationLogs(page = 1, limit = 20) {
  return notificationRepo.findLogs({ page, limit })
}
