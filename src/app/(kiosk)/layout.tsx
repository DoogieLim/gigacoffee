import { KioskProvider } from "@/components/kiosk/KioskProvider"

export default function KioskLayout({ children }: { children: React.ReactNode }) {
  return (
    <KioskProvider>
      <div className="min-h-screen bg-neutral-900 text-white">
        <header className="flex h-16 items-center justify-center border-b border-white/10 bg-brand">
          <span className="font-display text-2xl font-black tracking-tighter text-white">
            GIGACʘFFEE
          </span>
        </header>
        <main>{children}</main>
      </div>
    </KioskProvider>
  )
}
