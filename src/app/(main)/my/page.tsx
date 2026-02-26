import Link from "next/link"
import { getCurrentUser } from "@/actions/auth.actions"
import { ROUTES } from "@/lib/constants/routes"
import { signOutAction } from "@/actions/auth.actions"
import { Button } from "@/components/ui/Button"

export default async function MyPage() {
  const user = await getCurrentUser()

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-gray-600">로그인이 필요합니다.</p>
        <Link href={ROUTES.LOGIN}>
          <Button>로그인하기</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">마이페이지</h1>
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="font-semibold text-gray-900">{user.name}</p>
          <p className="text-sm text-gray-600">{user.email}</p>
        </div>
        <nav className="flex flex-col gap-2">
          <Link href={ROUTES.MY_ORDERS} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-4 hover:bg-gray-50">
            <span className="font-medium">주문 내역</span>
            <span className="text-gray-400">›</span>
          </Link>
          <Link href={ROUTES.MY_PROFILE} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-4 hover:bg-gray-50">
            <span className="font-medium">프로필 수정</span>
            <span className="text-gray-400">›</span>
          </Link>
        </nav>
        <form action={signOutAction}>
          <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
            로그아웃
          </Button>
        </form>
      </div>
    </div>
  )
}
