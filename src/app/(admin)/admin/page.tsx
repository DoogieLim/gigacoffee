import { orderRepo, inventoryRepo } from "@/lib/db"
import { getAdminStoreId } from "@/lib/utils/admin-store"
import { StatsCard } from "@/components/admin/StatsCard"
import { LowStockAlert } from "@/components/admin/LowStockAlert"
import { OrderTable } from "@/components/admin/OrderTable"
import { formatPrice } from "@/lib/utils/format"

async function getDashboardData() {
  const storeId = await getAdminStoreId()
  const [todayOrders, inventory] = await Promise.all([
    orderRepo.findToday(storeId),
    inventoryRepo.findAll(storeId),
  ])

  const todaySales = todayOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total_amount, 0)
  const lowStockCount = inventory.filter((i) => i.quantity <= i.low_stock_threshold).length

  return { todayOrders, todaySales, todayOrderCount: todayOrders.length, lowStockCount }
}

export default async function AdminDashboardPage() {
  const { todayOrders, todaySales, todayOrderCount, lowStockCount } = await getDashboardData()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
      <LowStockAlert count={lowStockCount} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="오늘 매출" value={formatPrice(todaySales)} />
        <StatsCard title="오늘 주문" value={`${todayOrderCount}건`} />
        <StatsCard title="재고 부족" value={`${lowStockCount}개`} />
      </div>
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">오늘의 주문</h2>
        <OrderTable orders={todayOrders} />
      </div>
    </div>
  )
}
