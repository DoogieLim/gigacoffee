import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { MobileBottomNav } from "@/components/layout/MobileBottomNav"
import { FcmInitializer, CUSTOMER_FCM_EVENTS } from "@/components/layout/FcmInitializer"
import { createClient } from "@/lib/supabase/server"

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  let user = null
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // Supabase 초기화 실패 시 비로그인 상태로 진행
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
      <FcmInitializer userId={user?.id ?? null} allowedEvents={CUSTOMER_FCM_EVENTS} />
    </div>
  )
}
