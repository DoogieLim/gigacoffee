"use client"

import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import type { Inventory } from "@/types/inventory.types"

interface InventoryTableProps {
  inventory: Inventory[]
  onAdjust: (item: Inventory) => void
}

export function InventoryTable({ inventory, onAdjust }: InventoryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="pb-3 pr-4 font-medium">상품명</th>
            <th className="pb-3 pr-4 font-medium">카테고리</th>
            <th className="pb-3 pr-4 font-medium text-right">현재고</th>
            <th className="pb-3 pr-4 font-medium text-right">임계값</th>
            <th className="pb-3 pr-4 font-medium">상태</th>
            <th className="pb-3 font-medium">관리</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {inventory.map((item) => {
            const isLow = item.quantity <= item.low_stock_threshold
            return (
              <tr key={item.product_id} className={isLow ? "bg-red-50" : ""}>
                <td className="py-3 pr-4 font-medium text-gray-900">
                  {item.product?.name ?? "-"}
                </td>
                <td className="py-3 pr-4 text-gray-600">
                  {item.product?.category?.name ?? "-"}
                </td>
                <td className={`py-3 pr-4 text-right font-semibold ${isLow ? "text-red-600" : "text-gray-900"}`}>
                  {item.quantity}
                </td>
                <td className="py-3 pr-4 text-right text-gray-600">{item.low_stock_threshold}</td>
                <td className="py-3 pr-4">
                  {isLow ? (
                    <Badge variant="danger">재고 부족</Badge>
                  ) : (
                    <Badge variant="success">정상</Badge>
                  )}
                </td>
                <td className="py-3">
                  <Button variant="outline" size="sm" onClick={() => onAdjust(item)}>
                    재고 조정
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
