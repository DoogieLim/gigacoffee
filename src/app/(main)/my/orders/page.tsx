import { createClient } from "@/lib/supabase/server"
import { orderRepo } from "@/lib/db"
import { formatDateTime, formatPrice } from "@/lib/utils/format"
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/constants/payment"

export default async function MyOrdersPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return <p className="text-center py-12">로그인이 필요합니다.</p>

  const orders = await orderRepo.findByUser(user.id)

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">주문 내역</h1>
      <div className="flex flex-col gap-4">
        {orders.length === 0 ? (
          <p className="text-center text-gray-500 py-12">주문 내역이 없습니다.</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500">{formatDateTime(order.created_at)}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS]}`}>
                  {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
                </span>
              </div>
              <div className="text-sm text-gray-700">
                {order.order_items.map((item, i) => (
                  <span key={i}>{item.product_name}</span>
                )).reduce((acc: React.ReactNode[], el, i) => i === 0 ? [el] : [...acc, ", ", el], [])}
              </div>
              <div className="mt-2 font-semibold text-amber-700">{formatPrice(order.total_amount)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
