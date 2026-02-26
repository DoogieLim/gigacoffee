"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCartStore } from "@/stores/cartStore"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils/cn"

const navItems = [
  {
    href: ROUTES.HOME,
    label: "홈",
    icon: (active: boolean) => (
      <svg className={cn("h-5 w-5", active ? "text-brand" : "text-ink-muted")} fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: ROUTES.MENU,
    label: "메뉴",
    icon: (active: boolean) => (
      <svg className={cn("h-5 w-5", active ? "text-brand" : "text-ink-muted")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    href: ROUTES.ORDER,
    label: "장바구니",
    icon: (active: boolean) => (
      <svg className={cn("h-5 w-5", active ? "text-brand" : "text-ink-muted")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    badge: true,
  },
  {
    href: ROUTES.MY,
    label: "마이",
    icon: (active: boolean) => (
      <svg className={cn("h-5 w-5", active ? "text-brand" : "text-ink-muted")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const cartItemCount = useCartStore((s) => s.items.length)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border-light bg-cream/95 backdrop-blur-sm md:hidden">
      <div className="flex">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-1 flex-col items-center justify-center gap-1 py-3"
            >
              {item.icon(active)}
              {item.badge && cartItemCount > 0 && (
                <span className="absolute right-1/4 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
                  {cartItemCount}
                </span>
              )}
              <span className={cn("text-[10px] uppercase tracking-widest", active ? "text-brand font-medium" : "text-ink-muted")}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
