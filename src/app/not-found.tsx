import Link from "next/link"
import { ROUTES } from "@/lib/constants/routes"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-6xl font-bold text-amber-700">404</h1>
      <p className="text-xl text-gray-600">페이지를 찾을 수 없습니다.</p>
      <Link href={ROUTES.HOME} className="text-amber-700 underline hover:text-amber-800">
        홈으로 돌아가기
      </Link>
    </div>
  )
}
