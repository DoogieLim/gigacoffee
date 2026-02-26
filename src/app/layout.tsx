import type { Metadata } from "next"
import { Geist, Playfair_Display } from "next/font/google"
import "./globals.css"
import { ToastContainer } from "@/components/ui/Toast"

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] })
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
})

export const metadata: Metadata = {
  title: "인생고민 카페",
  description: "당신의 인생고민을 함께 나누는 카페",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${geist.variable} ${playfair.variable} font-sans antialiased`}>
        {children}
        <ToastContainer />
      </body>
    </html>
  )
}
