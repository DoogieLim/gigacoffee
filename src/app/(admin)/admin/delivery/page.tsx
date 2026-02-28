"use client"

import { useState, useEffect } from "react"
import { getDeliverySettings, updateDeliverySetting } from "@/actions/delivery.actions"
import { Button } from "@/components/ui/Button"
import { formatPrice } from "@/lib/utils/format"
import type { DeliverySetting } from "@/types/order.types"

const TYPE_LABELS = {
  robot: "로봇배달",
  rider: "라이더 배달",
} as const

const TYPE_DESCRIPTIONS = {
  robot: "자율주행 로봇이 직접 배달합니다.",
  rider: "전문 라이더가 배달합니다.",
} as const

export default function DeliverySettingsPage() {
  const [settings, setSettings] = useState<DeliverySetting[]>([])
  const [editing, setEditing] = useState<Record<string, { fee: string; is_enabled: boolean }>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    getDeliverySettings().then((data) => {
      setSettings(data)
      const init: Record<string, { fee: string; is_enabled: boolean }> = {}
      data.forEach((s) => { init[s.type] = { fee: String(s.fee), is_enabled: s.is_enabled } })
      setEditing(init)
    })
  }, [])

  async function handleSave(type: "robot" | "rider") {
    const val = editing[type]
    if (!val) return
    const fee = parseInt(val.fee, 10)
    if (isNaN(fee) || fee < 0) {
      setMessage("배달비는 0원 이상의 숫자를 입력해주세요.")
      return
    }
    setSaving(type)
    try {
      await updateDeliverySetting(type, fee, val.is_enabled)
      setSettings((prev) =>
        prev.map((s) => s.type === type ? { ...s, fee, is_enabled: val.is_enabled } : s)
      )
      setMessage(`${TYPE_LABELS[type]} 설정이 저장되었습니다.`)
    } catch {
      setMessage("저장에 실패했습니다.")
    } finally {
      setSaving(null)
      setTimeout(() => setMessage(null), 3000)
    }
  }

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">배달 설정</h1>
      <p className="mb-8 text-sm text-gray-500">배달 유형별 배달비와 활성화 여부를 관리합니다.</p>

      {message && (
        <div className="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {message}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {(["robot", "rider"] as const).map((type) => {
          const current = settings.find((s) => s.type === type)
          const val = editing[type]
          if (!val) return null

          return (
            <div key={type} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{TYPE_LABELS[type]}</h2>
                  <p className="mt-0.5 text-xs text-gray-500">{TYPE_DESCRIPTIONS[type]}</p>
                </div>
                <label className="flex cursor-pointer items-center gap-2">
                  <span className="text-xs text-gray-500">{val.is_enabled ? "활성화" : "비활성화"}</span>
                  <div
                    onClick={() =>
                      setEditing((prev) => ({
                        ...prev,
                        [type]: { ...prev[type], is_enabled: !prev[type].is_enabled },
                      }))
                    }
                    className={`relative h-5 w-9 cursor-pointer rounded-full transition-colors ${
                      val.is_enabled ? "bg-brand" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        val.is_enabled ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </div>
                </label>
              </div>

              <div className="mb-4">
                <label className="mb-1.5 block text-xs font-medium text-gray-700">배달비 (원)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={val.fee}
                    onChange={(e) =>
                      setEditing((prev) => ({ ...prev, [type]: { ...prev[type], fee: e.target.value } }))
                    }
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
                {current && (
                  <p className="mt-1 text-xs text-gray-400">
                    현재 저장값: {current.fee === 0 ? "무료" : formatPrice(current.fee)}
                  </p>
                )}
              </div>

              <Button
                onClick={() => handleSave(type)}
                isLoading={saving === type}
                className="w-full"
              >
                저장
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
