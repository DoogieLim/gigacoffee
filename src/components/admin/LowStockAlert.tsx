import Link from "next/link"
import { Badge } from "@/components/ui/Badge"
import { ROUTES } from "@/lib/constants/routes"

interface LowStockAlertProps {
  count: number
}

export function LowStockAlert({ count }: LowStockAlertProps) {
  if (count === 0) return null

  return (
    <Link href={ROUTES.ADMIN_INVENTORY}>
      <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        <Badge variant="danger">{count}</Badge>
        <span>재고 부족 상품이 있습니다. 재고 관리 페이지에서 확인하세요.</span>
      </div>
    </Link>
  )
}
