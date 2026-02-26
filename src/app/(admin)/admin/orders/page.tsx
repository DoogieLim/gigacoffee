import { orderRepo } from "@/lib/db"
import { OrdersClient } from "@/components/admin/OrdersClient"

export default async function AdminOrdersPage() {
  const initialOrders = await orderRepo.findAll(50)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">주문 관리</h1>
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <OrdersClient initialOrders={initialOrders} />
      </div>
    </div>
  )
}
