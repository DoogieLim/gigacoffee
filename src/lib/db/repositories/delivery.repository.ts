import type { DeliverySetting } from "@/types/order.types"

export interface DeliveryRepository {
  findAll(): Promise<DeliverySetting[]>
  update(type: "robot" | "rider", fee: number, isEnabled: boolean): Promise<DeliverySetting>
}
