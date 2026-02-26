"use client"

import { useState, useEffect } from "react"
import { InventoryTable } from "@/components/admin/InventoryTable"
import { Modal } from "@/components/ui/Modal"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"
import { getInventoryList, adjustStock } from "@/actions/inventory.actions"
import type { Inventory } from "@/types/inventory.types"

const TYPE_OPTIONS = [
  { value: "in", label: "입고" },
  { value: "adjust", label: "수동 조정" },
]

export default function InventoryPage() {
  const [inventory, setInventory] = useState<Inventory[]>([])
  const [selected, setSelected] = useState<Inventory | null>(null)
  const [changeQty, setChangeQty] = useState("")
  const [reason, setReason] = useState("")
  const [type, setType] = useState<"in" | "adjust">("in")
  const [isLoading, setIsLoading] = useState(false)

  async function loadInventory() {
    const data = await getInventoryList()
    setInventory(data as Inventory[])
  }

  useEffect(() => { loadInventory() }, [])

  async function handleAdjust() {
    if (!selected || !changeQty) return
    setIsLoading(true)
    try {
      await adjustStock({
        product_id: selected.product_id,
        change_qty: parseInt(changeQty),
        reason,
        type,
      })
      setSelected(null)
      await loadInventory()
    } finally {
      setIsLoading(false)
    }
  }

  const lowStockCount = inventory.filter((i) => i.quantity <= i.low_stock_threshold).length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">재고 관리</h1>
        {lowStockCount > 0 && (
          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
            재고 부족 {lowStockCount}건
          </span>
        )}
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <InventoryTable inventory={inventory} onAdjust={setSelected} />
      </div>

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={`재고 조정 - ${selected?.product?.name}`}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">현재 재고: {selected?.quantity}개</p>
          <Select
            label="조정 유형"
            value={type}
            onChange={(e) => setType(e.target.value as "in" | "adjust")}
            options={TYPE_OPTIONS}
          />
          <Input
            label="변동량 (+ 입고 / - 차감)"
            type="number"
            value={changeQty}
            onChange={(e) => setChangeQty(e.target.value)}
            placeholder="예: 50, -10"
          />
          <Input
            label="사유"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="재고 조정 사유를 입력하세요"
          />
          <Button onClick={handleAdjust} isLoading={isLoading}>
            조정 완료
          </Button>
        </div>
      </Modal>
    </div>
  )
}
