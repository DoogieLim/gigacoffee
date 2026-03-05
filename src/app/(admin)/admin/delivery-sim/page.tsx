import { getDeliveryOrders } from "@/actions/delivery-sim.actions"
import { DeliverySimClient } from "./DeliverySimClient"

export default async function DeliverySimPage() {
  const orders = await getDeliveryOrders()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">배달 시뮬레이터</h1>
        <p className="mt-1 text-sm text-gray-500">
          로봇/라이더 배달 상태를 시뮬레이션합니다. 배달 주문을 선택하고 상태를 단계별로 진행해보세요.
        </p>
      </div>
      <DeliverySimClient initialOrders={orders} />
    </div>
  )
}
