import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { ROUTES } from "@/lib/constants/routes"

export default function OrderCompletePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="text-6xl">✅</div>
      <h1 className="text-2xl font-bold text-gray-900">주문이 완료되었습니다!</h1>
      <p className="text-gray-600">잠시 후 카카오 알림톡으로 확인 메시지가 발송됩니다.</p>
      <div className="flex gap-3">
        <Link href={ROUTES.MY_ORDERS}>
          <Button variant="outline">주문 내역 보기</Button>
        </Link>
        <Link href={ROUTES.MENU}>
          <Button>메뉴로 돌아가기</Button>
        </Link>
      </div>
    </div>
  )
}
