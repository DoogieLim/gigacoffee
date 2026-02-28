"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils/cn"

const navItems = [
  { href: ROUTES.ADMIN, label: "대시보드", exact: true },
  { href: ROUTES.ADMIN_ORDERS, label: "주문 관리" },
  { href: ROUTES.ADMIN_PRODUCTS, label: "상품 관리" },
  { href: ROUTES.ADMIN_INVENTORY, label: "재고 관리" },
  { href: ROUTES.ADMIN_SALES, label: "매출 분석" },
  { href: ROUTES.ADMIN_MEMBERS, label: "회원 관리" },
  { href: ROUTES.ADMIN_NOTIFICATIONS, label: "알림 관리" },
  { href: ROUTES.ADMIN_BOARD, label: "게시판 관리" },
  { href: ROUTES.ADMIN_ROLES, label: "권한 관리" },
  { href: ROUTES.ADMIN_DELIVERY, label: "배달 설정" },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-60 flex-col border-r border-gray-200 bg-gray-900">
      <div className="flex h-16 items-center px-6">
        <span className="text-lg font-bold text-amber-400">GigaCoffee 관리자</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-amber-700 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-gray-700 p-4">
        <Link href={ROUTES.HOME} className="text-xs text-gray-400 hover:text-gray-200">
          ← 사용자 페이지로 이동
        </Link>
      </div>
    </aside>
  )
}
