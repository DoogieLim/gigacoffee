import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { ROUTES } from "@/lib/constants/routes"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${origin}${ROUTES.HOME}`)
}
