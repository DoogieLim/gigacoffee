import type { Metadata } from "next"
import { Geist, Playfair_Display } from "next/font/google"
import "./globals.css"
import { ToastContainer } from "@/components/ui/Toast"
import { PwaRegister } from "@/components/PwaRegister"

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] })
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
})

export const metadata: Metadata = {
  title: "GigaCoffee",
  description: "GigaCoffee - 당신의 하루를 위로하는 한 잔의 커피",
  themeColor: "#f59e0b",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${geist.variable} ${playfair.variable} font-sans antialiased`}>
        {children}
        <ToastContainer />
        <PwaRegister />
      </body>
    </html>
  )
}
