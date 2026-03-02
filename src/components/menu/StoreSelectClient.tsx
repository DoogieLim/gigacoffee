"use client"

import { useRouter } from "next/navigation"
import { useCartStore } from "@/stores/cartStore"
import { ROUTES } from "@/lib/constants/routes"
import type { Store } from "@/types/store.types"

interface Props {
  stores: Store[]
}

export function StoreSelectClient({ stores }: Props) {
  const router = useRouter()
  const setCurrentStore = useCartStore((s) => s.setCurrentStore)

  async function handleSelect(store: Store) {
    setCurrentStore(store.id)
    // 서버 사이드 컴포넌트(게시판 등)에서도 매장 컨텍스트를 읽을 수 있도록 쿠키 설정
    await fetch("/api/user/set-store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId: store.id }),
    })
    router.push(ROUTES.MENU)
  }

  if (stores.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="text-gray-500">현재 운영 중인 매장이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {stores.map((store) => (
        <button
          key={store.id}
          onClick={() => handleSelect(store)}
          data-testid="store-card"
          className="flex flex-col items-start gap-1 rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all hover:border-amber-400 hover:shadow-md"
        >
          <span className="text-base font-semibold text-gray-900">{store.name}</span>
          {store.address && (
            <span className="text-sm text-gray-500">{store.address}</span>
          )}
          {store.phone && (
            <span className="text-xs text-gray-400">{store.phone}</span>
          )}
        </button>
      ))}
    </div>
  )
}
