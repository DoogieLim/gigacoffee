"use server"

import { createClient } from "@/lib/supabase/server"
import { inventoryRepo, productRepo } from "@/lib/db"
import { dispatch } from "@/lib/notifications/dispatcher"
import type { AdjustStockInput } from "@/types/inventory.types"

export async function adjustStock(input: AdjustStockInput) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("로그인이 필요합니다.")

  const inv = await inventoryRepo.findByProduct(input.product_id)
  const newQty = (inv?.quantity ?? 0) + input.change_qty

  await inventoryRepo.upsert(input.product_id, newQty)
  await inventoryRepo.insertHistory({
    productId: input.product_id,
    changeQty: input.change_qty,
    reason: input.reason,
    type: input.type,
    createdBy: user.id,
  })

  if (inv && newQty <= inv.low_stock_threshold) {
    const product = await productRepo.findById(input.product_id)
    await dispatch({
      recipientId: user.id,
      eventType: "LOW_STOCK",
      templateData: { productName: product?.name ?? "상품", quantity: String(newQty) },
    }).catch(console.error)
  }

  return { success: true, newQuantity: newQty }
}

export async function getInventoryList() {
  return inventoryRepo.findAll()
}
