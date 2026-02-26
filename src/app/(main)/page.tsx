import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { ROUTES } from "@/lib/constants/routes"

export default function HomePage() {
  return (
    <div className="flex flex-col">

      {/* ── 히어로 섹션 ── */}
      <section className="relative flex min-h-[92vh] flex-col items-center justify-center bg-dark px-6 text-center">
        {/* 배경 그라데이션 */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_120%,rgba(27,54,82,0.6),transparent)]" />

        <div className="relative z-10 flex flex-col items-center">
          <span className="mb-6 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-white/40">
            <span className="h-px w-8 bg-white/20" />
            Specialty Coffee · Seoul
            <span className="h-px w-8 bg-white/20" />
          </span>

          <h1 className="font-display text-6xl font-bold italic leading-none tracking-tight text-white sm:text-7xl md:text-8xl lg:text-9xl">
            인생고민
          </h1>

          <p className="mt-6 font-display text-lg italic text-white/50 sm:text-xl">
            당신의 하루를 위로하는 한 잔의 커피
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href={ROUTES.MENU}>
              <Button size="lg" className="border border-white/20 bg-white text-ink hover:bg-white/90 rounded-none uppercase tracking-widest">
                메뉴 보기
              </Button>
            </Link>
            <Link href={ROUTES.ORDER}>
              <Button size="lg" className="border border-white/30 bg-transparent text-white hover:bg-white/10 rounded-none uppercase tracking-widest">
                지금 주문
              </Button>
            </Link>
          </div>
        </div>

        {/* 스크롤 힌트 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
          <svg className="h-5 w-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── 철학 섹션 ── */}
      <section className="bg-cream px-6 py-24 text-center">
        <p className="mx-auto max-w-2xl font-display text-2xl italic leading-relaxed text-ink sm:text-3xl">
          "한 잔의 커피가 하루를 바꿉니다.<br />
          <span className="text-ink-muted">우리는 그 순간을 정성으로 만듭니다.</span>"
        </p>
        <div className="mx-auto mt-8 h-px w-16 bg-border-warm" />
      </section>

      {/* ── 특징 섹션 ── */}
      <section className="bg-cream-dark px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 text-center text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">Why 인생고민</p>
          <h2 className="mb-12 text-center font-display text-3xl font-bold text-ink sm:text-4xl">
            특별한 이유가 있습니다
          </h2>

          <div className="grid gap-px bg-border-warm sm:grid-cols-3">
            {[
              {
                icon: (
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8 1.402 1.402c1 1 .03 2.7-1.32 2.7H4.12c-1.35 0-2.32-1.7-1.32-2.7L4 14.5" />
                  </svg>
                ),
                title: "스페셜티 원두",
                desc: "매일 아침 신선하게 로스팅한 스페셜티 원두로 최상의 한 잔을 만듭니다.",
              },
              {
                icon: (
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                ),
                title: "편안한 공간",
                desc: "도심 속에서 잠시 멈추고 자신만의 시간을 가질 수 있는 공간입니다.",
              },
              {
                icon: (
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3h3m-3 3h3M6.75 21h10.5" />
                  </svg>
                ),
                title: "스마트 주문",
                desc: "앱에서 미리 주문하고 기다림 없이 바로 픽업하세요.",
              },
            ].map((f) => (
              <div key={f.title} className="flex flex-col items-start bg-cream p-8 sm:p-10">
                <div className="text-ink-secondary">{f.icon}</div>
                <h3 className="mt-5 font-semibold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 로봇배송 티저 섹션 ── */}
      <section className="relative overflow-hidden bg-brand px-6 py-24">
        {/* 배경 패턴 */}
        <div className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-none bg-tech/20 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-tech">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tech opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-tech" />
            </span>
            Coming Soon
          </span>

          <h2 className="mt-6 font-display text-4xl font-bold text-white sm:text-5xl md:text-6xl">
            로봇이 배달합니다
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/60">
            가까운 미래, 자율주행 로봇이 당신이 있는 곳으로
            직접 커피를 배달합니다. 인생고민은 기술과 커피의
            경계를 넘습니다.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <div className="flex items-center gap-6 text-white/40">
              {[
                { label: "자율주행", icon: "→" },
                { label: "실시간 추적", icon: "→" },
                { label: "문 앞 배달", icon: "" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm text-white/60">{item.label}</span>
                  {item.icon && <span className="text-white/30">{item.icon}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* 로봇 일러스트 (텍스트 기반) */}
          <div className="mx-auto mt-12 flex h-32 w-32 items-center justify-center rounded-full border border-white/10 bg-white/5 text-5xl">
            🤖
          </div>
        </div>
      </section>

      {/* ── 메뉴 CTA 섹션 ── */}
      <section className="bg-cream px-6 py-24 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">Today&apos;s Menu</p>
        <h2 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">
          오늘의 한 잔을 고르세요
        </h2>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-ink-muted">
          에스프레소부터 시그니처 음료까지, 당신의 하루에 어울리는 커피가 있습니다.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href={ROUTES.MENU}>
            <Button size="lg" variant="primary">
              전체 메뉴 보기
            </Button>
          </Link>
          <Link href={ROUTES.BOARD}>
            <Button size="lg" variant="ghost">
              게시판
            </Button>
          </Link>
        </div>
      </section>

    </div>
  )
}
