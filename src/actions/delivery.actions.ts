"use server"

import { deliveryRepo } from "@/lib/db"
import type { DeliverySetting } from "@/types/order.types"

export async function getDeliverySettings(): Promise<DeliverySetting[]> {
  return deliveryRepo.findAll()
}

export async function updateDeliverySetting(
  type: "robot" | "rider",
  fee: number,
  isEnabled: boolean
): Promise<void> {
  if (fee < 0) throw new Error("배달비는 0원 이상이어야 합니다.")
  await deliveryRepo.update(type, fee, isEnabled)
}
