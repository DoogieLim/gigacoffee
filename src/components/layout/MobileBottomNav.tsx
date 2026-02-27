"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCartStore } from "@/stores/cartStore"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils/cn"

export function MobileBottomNav() {
  const pathname = usePathname()
  const cartItemCount = useCartStore((s) => s.items.length)

  const navItems = [
    { href: ROUTES.HOME, label: "홈", icon: HomeIcon },
    { href: ROUTES.MENU, label: "주문하기", icon: MenuIcon, isCenter: true },
    { href: ROUTES.BOARD, label: "커뮤니티", icon: BoardIcon },
    { href: ROUTES.MY, label: "마이", icon: MyIcon },
  ]

  return (
    <nav className="glass fixed bottom-0 left-0 right-0 z-50 border-t border-border-subtle pb-safe md:hidden">
      <div className="flex h-16 items-center">
        {navItems.map((item) => {
          const active = pathname === item.href

          if (item.isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-1 flex-col items-center justify-center -translate-y-4"
              >
                <div className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform active:scale-90",
                  active ? "bg-tech" : "bg-brand"
                )}>
                  <item.icon active={active} className="h-6 w-6 text-white" />
                </div>
                <span className={cn(
                  "mt-1 text-[10px] font-bold tracking-tighter",
                  active ? "text-tech" : "text-brand"
                )}>
                  {item.label}
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-opacity active:opacity-50"
            >
              <item.icon active={active} className={cn("h-6 w-6", active ? "text-brand" : "text-neutral-400")} />
              <span className={cn(
                "text-[9px] font-medium tracking-tighter",
                active ? "text-brand" : "text-neutral-500"
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

function HomeIcon({ active, className }: { active: boolean; className?: string }) {
  return (
    <svg className={className} fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function MenuIcon({ className }: { active: boolean; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  )
}

function BoardIcon({ active, className }: { active: boolean; className?: string }) {
  return (
    <svg className={className} fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l4 4v12a2 2 0 01-2 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h4m-4 4h8" />
    </svg>
  )
}

function MyIcon({ active, className }: { active: boolean; className?: string }) {
  return (
    <svg className={className} fill={active ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}
