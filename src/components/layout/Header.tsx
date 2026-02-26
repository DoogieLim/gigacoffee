"use client"

import Link from "next/link"
import { useState } from "react"
import { useCartStore } from "@/stores/cartStore"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils/cn"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const cartItemCount = useCartStore((s) => s.items.length)

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur-sm border-b border-border-light">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">

        {/* 로고 */}
        <Link
          href={ROUTES.HOME}
          className="font-display text-lg font-bold italic tracking-tight text-brand"
        >
          인생고민
        </Link>

        {/* 데스크탑 네비게이션 */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link href={ROUTES.MENU} className="text-xs font-medium uppercase tracking-widest text-ink-secondary transition-colors hover:text-brand">
            메뉴
          </Link>
          <Link href={ROUTES.BOARD} className="text-xs font-medium uppercase tracking-widest text-ink-secondary transition-colors hover:text-brand">
            게시판
          </Link>
          <Link href={ROUTES.MY} className="text-xs font-medium uppercase tracking-widest text-ink-secondary transition-colors hover:text-brand">
            마이페이지
          </Link>
          <Link href={ROUTES.ORDER} className="relative ml-2">
            <svg className="h-5 w-5 text-ink-secondary transition-colors hover:text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartItemCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
                {cartItemCount}
              </span>
            )}
          </Link>
        </nav>

        {/* 모바일 햄버거 */}
        <button
          className="p-2 text-ink-secondary md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="메뉴 열기"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>

      {/* 모바일 드롭다운 */}
      {mobileMenuOpen && (
        <div className="border-t border-border-light bg-cream px-6 py-6 md:hidden">
          <nav className="flex flex-col gap-5">
            {[
              { href: ROUTES.MENU, label: "메뉴" },
              { href: ROUTES.BOARD, label: "게시판" },
              { href: ROUTES.MY, label: "마이페이지" },
              { href: ROUTES.ORDER, label: "장바구니" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn("text-xs font-medium uppercase tracking-widest text-ink-secondary hover:text-brand")}
                onClick={() => setMobileMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
