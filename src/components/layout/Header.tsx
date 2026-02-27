"use client"

import Link from "next/link"
import { useState } from "react"
import { useCartStore } from "@/stores/cartStore"
import { ROUTES } from "@/lib/constants/routes"

export function Header() {
  const cartItemCount = useCartStore((s) => s.items.length)

  return (
    <header className="glass sticky top-0 z-50 border-b border-border-subtle">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* 로봇배송/픽업 토글 (모바일에서도 작게 표시) */}
        <div className="flex items-center gap-1 overflow-hidden rounded-full border border-border-subtle bg-neutral-100 p-0.5">
          <button className="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-brand shadow-sm">
            픽업
          </button>
          <button className="px-3 py-1 text-[10px] font-medium text-neutral-500">
            로봇배송
          </button>
        </div>

        {/* 로고 (중앙 정렬 느낌) */}
        <Link
          href={ROUTES.HOME}
          className="absolute left-1/2 -translate-x-1/2 font-display text-lg font-black tracking-tighter text-brand"
        >
          GIGACʘFFEE
        </Link>

        {/* 오른쪽 아이콘 세트 */}
        <div className="flex items-center gap-2">
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
