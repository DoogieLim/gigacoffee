import type { DeliverySetting } from "@/types/order.types"

export interface DeliveryRepository {
  findAll(storeId?: string | null): Promise<DeliverySetting[]>
  update(type: "robot" | "rider", fee: number, isEnabled: boolean, storeId: string): Promise<DeliverySetting>
}
