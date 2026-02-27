import Link from "next/link"
import { ROUTES } from "@/lib/constants/routes"

export function Footer() {
  return (
    <footer className="bg-dark text-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-3">

          {/* 브랜드 */}
          <div>
            <p className="font-display text-xl font-bold italic text-white">GigaCoffee</p>
            <p className="mt-3 text-sm leading-relaxed text-white/50">
              당신의 하루를 위로하는 한 잔의 커피.
              <br />정성과 시간으로 빚은 커피를 드립니다.
            </p>
          </div>

          {/* 네비게이션 */}
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-white/40">메뉴</p>
            <nav className="mt-4 flex flex-col gap-3">
              {[
                { href: ROUTES.MENU, label: "커피 & 음료" },
                { href: ROUTES.ORDER, label: "주문하기" },
                { href: ROUTES.BOARD, label: "게시판" },
                { href: ROUTES.MY, label: "마이페이지" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm text-white/60 transition-colors hover:text-white"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* 정보 */}
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-white/40">정보</p>
            <div className="mt-4 flex flex-col gap-2 text-sm text-white/60">
              <p>사업자등록번호: 000-00-00000</p>
              <p>대표: 홍길동</p>
              <p>서울특별시 강남구 테헤란로 123</p>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-none bg-tech/20 px-2 py-1 text-xs font-medium uppercase tracking-widest text-tech">
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
                로봇배송 준비중
              </span>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center text-xs text-white/30">
          © 2026 GigaCoffee. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
