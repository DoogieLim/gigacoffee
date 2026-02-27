import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { ROUTES } from "@/lib/constants/routes"

export default function HomePage() {
  return (
    <div className="flex flex-col bg-neutral-50 min-h-screen">

      {/* ── App Header Hero ── */}
      <section className="px-5 pt-8 pb-6">
        <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-1">Welcome back</h2>
        <h1 className="text-3xl font-black text-brand tracking-tighter">
          기다림 없는<br />
          <span className="text-tech italic">로봇 배송</span> 서비스
        </h1>
      </section>

      {/* ── Robot Delivery Status Card (Starbucks Style) ── */}
      <section className="px-5 mb-8">
        <div className="relative overflow-hidden rounded-3xl bg-brand p-6 text-white shadow-premium">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-2 w-2 rounded-full bg-tech animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-tech">System Active</span>
            </div>
            <h3 className="text-xl font-bold mb-2">로봇 배송이 가능합니다</h3>
            <p className="text-xs text-white/60 leading-relaxed mb-6">
              현재 내 위치까지 배송 가능한 로봇이<br />
              3대 대기 중입니다.
            </p>
            <Link href={ROUTES.MENU}>
              <Button className="w-full bg-white text-brand font-bold rounded-2xl h-12 hover:bg-neutral-100 active:scale-95 transition-transform">
                지금 주문하기
              </Button>
            </Link>
          </div>
          {/* Decorative Robot Silhouette */}
          <div className="absolute -right-4 -bottom-4 text-9xl opacity-10 rotate-12">🤖</div>
        </div>
      </section>

      {/* ── Quick Actions ── */}
      <section className="grid grid-cols-2 gap-4 px-5 mb-10">
        <div className="rounded-3xl bg-white p-5 shadow-premium border border-neutral-100 flex flex-col items-center text-center active:scale-95 transition-transform">
          <div className="h-12 w-12 rounded-2xl bg-accent-muted text-accent flex items-center justify-center mb-3">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-xs font-bold text-neutral-800">최근 주문</span>
        </div>
        <div className="rounded-3xl bg-white p-5 shadow-premium border border-neutral-100 flex flex-col items-center text-center active:scale-95 transition-transform">
          <div className="h-12 w-12 rounded-2xl bg-tech/10 text-tech flex items-center justify-center mb-3">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="text-xs font-bold text-neutral-800">로봇 위치</span>
        </div>
      </section>

      {/* ── Featured Menu ── */}
      <section className="bg-white rounded-t-[40px] px-5 pt-10 pb-20 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] flex-1">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-neutral-900">추천 메뉴</h2>
          <Link href={ROUTES.MENU} className="text-xs font-bold text-tech">전체보기</Link>
        </div>

        <div className="space-y-4">
          {[
            { name: "시그니처 로봇 라떼", price: "4,500", desc: "기술의 정점으로 내린 고소한 라떼", icon: "☕" },
            { name: "블루 에너지 에이드", price: "5,200", desc: "시원한 파란색 탄산 에너지", icon: "🍹" },
            { name: "메카 쿠키 세트", price: "3,800", desc: "바삭하고 달콤한 로봇 모양 쿠키", icon: "🍪" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-neutral-50 pb-4 last:border-0 hover:bg-neutral-50 rounded-xl transition-colors p-2">
              <div className="h-14 w-14 rounded-2xl bg-neutral-100 flex items-center justify-center text-2xl">
                {item.icon}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-neutral-900">{item.name}</h4>
                <p className="text-[10px] text-neutral-500">{item.desc}</p>
              </div>
              <span className="text-sm font-black text-brand">₩{item.price}</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
