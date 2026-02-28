"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useCartStore } from "@/stores/cartStore"
import { ROUTES } from "@/lib/constants/routes"
import { createClient } from "@/lib/supabase/client"

export function Header() {
  const cartItemCount = useCartStore((s) => s.items.length)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase
        .from("user_roles")
        .select("role:roles(name)")
        .eq("user_id", user.id)
      const rows = (data ?? []) as { role: { name: string } | null }[]
      if (rows.some((r) => r.role?.name === "admin")) {
        setIsAdmin(true)
      }
    })
  }, [])

  return (
    <header className="glass sticky top-0 z-50 border-b border-border-subtle">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* 로고 */}
        <Link
          href={ROUTES.HOME}
          className="font-display text-lg font-black tracking-tighter text-brand"
        >
          GIGACʘFFEE
        </Link>

        {/* 오른쪽 아이콘 */}
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              href={ROUTES.ADMIN}
              title="관리자 페이지"
              className="flex h-9 w-9 items-center justify-center rounded-full text-amber-600 hover:bg-amber-50"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
          )}
          <Link href={ROUTES.MY} className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>
          <Link href={ROUTES.ORDER} className="relative flex h-9 w-9 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartItemCount > 0 && (
              <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-tech text-[10px] font-bold text-white ring-2 ring-white">
                {cartItemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
