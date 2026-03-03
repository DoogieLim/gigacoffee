"use server"

import { inventoryRepo, productRepo } from "@/lib/db"
import { dispatch } from "@/lib/notifications/dispatcher"
import { getAdminStoreId } from "@/lib/utils/admin-store"
import { requireAdminAction } from "@/lib/auth/action-auth"
import type { AdjustStockInput } from "@/types/inventory.types"

export async function adjustStock(input: AdjustStockInput) {
  const userId = await requireAdminAction()

  const storeId = await getAdminStoreId()

  const inv = await inventoryRepo.findByProduct(input.product_id, storeId)
  const newQty = (inv?.quantity ?? 0) + input.change_qty

  await inventoryRepo.upsert(input.product_id, newQty, storeId)
  await inventoryRepo.insertHistory({
    productId: input.product_id,
    storeId,
    changeQty: input.change_qty,
    reason: input.reason,
    type: input.type,
    createdBy: userId,
  })

  if (inv && newQty <= inv.low_stock_threshold) {
    const product = await productRepo.findById(input.product_id)
    await dispatch({
      recipientId: userId,
      eventType: "LOW_STOCK",
      templateData: { productName: product?.name ?? "상품", quantity: String(newQty) },
    }).catch(console.error)
  }

  return { success: true, newQuantity: newQty }
}

export async function getInventoryList() {
  const storeId = await getAdminStoreId()
  return inventoryRepo.findAll(storeId)
}
