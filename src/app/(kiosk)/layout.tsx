import { KioskProvider } from "@/components/kiosk/KioskProvider"

export default function KioskLayout({ children }: { children: React.ReactNode }) {
  return (
    <KioskProvider>
      <div className="min-h-screen bg-gray-950 text-white">
        {/* 키오스크 상단 바 */}
        <header className="flex h-16 items-center justify-center border-b border-gray-800 bg-gray-900">
          <span className="font-display text-2xl font-black tracking-tighter text-amber-400">
            GIGACʘFFEE
          </span>
        </header>
        <main>{children}</main>
      </div>
    </KioskProvider>
  )
}
