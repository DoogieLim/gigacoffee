import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { MobileBottomNav } from "@/components/layout/MobileBottomNav"
import { FcmInitializer } from "@/components/layout/FcmInitializer"
import { createClient } from "@/lib/supabase/server"

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
      <FcmInitializer userId={user?.id ?? null} />
    </div>
  )
}
