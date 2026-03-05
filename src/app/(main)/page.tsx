import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/actions/auth.actions"
import { ROUTES } from "@/lib/constants/routes"
import { ModeSelector } from "@/components/layout/ModeSelector"
import { AppHome } from "@/components/home/AppHome"

const ADMIN_ROLES = ["admin", "franchise_admin", "staff"]

export default async function HomePage() {
  const user = await getCurrentUser()
  if (user?.role && ADMIN_ROLES.includes(user.role)) {
    redirect(ROUTES.ADMIN)
  }

  const cookieStore = await cookies()
  const mode = cookieStore.get("app_mode")?.value as "phone" | "kiosk" | "web" | undefined

  if (!mode) {
    return <ModeSelector />
  }

  if (mode === "kiosk") {
    redirect(ROUTES.KIOSK)
  }

  return <AppHome mode={mode} />
}
