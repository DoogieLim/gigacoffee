"use server"

import { deliveryRepo } from "@/lib/db"
import { getAdminStoreId } from "@/lib/utils/admin-store"
import type { DeliverySetting } from "@/types/order.types"

// 관리자 페이지용: admin_store_id 쿠키 기반
export async function getDeliverySettings(): Promise<DeliverySetting[]> {
  const storeId = await getAdminStoreId()
  return deliveryRepo.findAll(storeId)
}

// 사용자 체크아웃 페이지용: storeId 명시
export async function getStoreDeliverySettings(storeId: string): Promise<DeliverySetting[]> {
  return deliveryRepo.findAll(storeId)
}

export async function updateDeliverySetting(
  type: "robot" | "rider",
  fee: number,
  isEnabled: boolean
): Promise<void> {
  if (fee < 0) throw new Error("배달비는 0원 이상이어야 합니다.")
  const storeId = await getAdminStoreId()
  if (!storeId) throw new Error("매장을 먼저 선택해주세요.")
  await deliveryRepo.update(type, fee, isEnabled, storeId)
}
