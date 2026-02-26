import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"
import { ROUTES } from "@/lib/constants/routes"

export async function updateSession(request: NextRequest) {
  // 환경변수가 없으면 인증 없이 통과
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // 관리자 경로 보호
  if (pathname.startsWith("/admin") && !user) {
    return NextResponse.redirect(new URL(ROUTES.LOGIN, request.url))
  }

  // 인증된 사용자가 로그인 페이지 접근 시 리다이렉트
  if (user && (pathname === ROUTES.LOGIN || pathname === ROUTES.REGISTER)) {
    return NextResponse.redirect(new URL(ROUTES.HOME, request.url))
  }

  return supabaseResponse
}
