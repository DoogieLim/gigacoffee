"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils/cn"
import type { AdminStoreContext } from "@/types/store.types"

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

interface AdminSidebarProps {
  context: AdminStoreContext
}

export function AdminSidebar({ context }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { isFranchiseAdmin, currentStoreId, managedStores } = context

  async function handleStoreChange(storeId: string | null) {
    await fetch("/api/admin/set-store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId }),
    })
    router.refresh()
  }

  const currentStoreName =
    currentStoreId === null
      ? "전체 보기"
      : (managedStores.find((s) => s.id === currentStoreId)?.name ?? "매장 선택")

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-gray-900">
      <div className="flex h-16 items-center px-6">
        <span className="text-lg font-bold text-amber-400">GigaCoffee 관리자</span>
      </div>

      {/* 매장 선택 영역 */}
      <div className="border-b border-gray-700 px-3 pb-3">
        {isFranchiseAdmin ? (
          <div className="relative">
            <label className="mb-1 block text-xs text-gray-400">매장 선택</label>
            <select
              value={currentStoreId ?? ""}
              onChange={(e) => handleStoreChange(e.target.value || null)}
              className="w-full rounded-lg bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="">전체 보기</option>
              {managedStores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="rounded-lg bg-gray-800 px-3 py-2">
            <p className="text-xs text-gray-400">현재 매장</p>
            <p className="text-sm font-medium text-white">{currentStoreName}</p>
          </div>
        )}
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

        {/* 프랜차이즈 관리자 전용 메뉴 */}
        {isFranchiseAdmin && (
          <div className="mt-2 border-t border-gray-700 pt-2">
            <p className="mb-1 px-3 text-xs font-medium text-gray-500">프랜차이즈</p>
            <Link
              href={ROUTES.ADMIN_STORES}
              className={cn(
                "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                pathname.startsWith(ROUTES.ADMIN_STORES)
                  ? "bg-amber-700 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              매장 관리
            </Link>
          </div>
        )}
      </nav>

      <div className="border-t border-gray-700 p-4">
        <Link href={ROUTES.HOME} className="text-xs text-gray-400 hover:text-gray-200">
          ← 사용자 페이지로 이동
        </Link>
      </div>
    </aside>
  )
}
