"use server"

import { createClient } from "@/lib/supabase/server"

/**
 * 키오스크 전용 계정으로 자동 로그인
 * 환경변수 KIOSK_EMAIL / KIOSK_PASSWORD 필요
 */
export async function kioskAutoLogin(): Promise<void> {
  const email = process.env.KIOSK_EMAIL
  const password = process.env.KIOSK_PASSWORD

  if (!email || !password) {
    throw new Error("KIOSK_EMAIL / KIOSK_PASSWORD 환경변수가 설정되지 않았습니다.")
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    throw new Error(`키오스크 자동 로그인 실패: ${error.message}`)
  }
}
