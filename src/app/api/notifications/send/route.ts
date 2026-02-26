import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { dispatch } from "@/lib/notifications/dispatcher"
import type { NotificationEvent } from "@/lib/notifications/dispatcher"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "인증 필요" }, { status: 401 })
    }

    const { recipientId, eventType, channels, data } = await request.json()

    const results = await dispatch({
      recipientId,
      eventType: eventType as NotificationEvent,
      templateData: data,
      channels,
    })

    return NextResponse.json({ success: true, results })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
