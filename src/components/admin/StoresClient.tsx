"use client"

import { useState } from "react"
import { createStore, updateStore } from "@/actions/store.actions"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import type { Store } from "@/types/store.types"

interface Props {
  initialStores: Store[]
}

interface StoreForm {
  name: string
  slug: string
  address: string
  phone: string
}

const emptyForm: StoreForm = { name: "", slug: "", address: "", phone: "" }

export function StoresClient({ initialStores }: Props) {
  const [stores, setStores] = useState<Store[]>(initialStores)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<StoreForm>(emptyForm)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function startCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
    setError(null)
  }

  function startEdit(store: Store) {
    setEditingId(store.id)
    setForm({
      name: store.name,
      slug: store.slug,
      address: store.address ?? "",
      phone: store.phone ?? "",
    })
    setShowForm(true)
    setError(null)
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    setError(null)
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.slug.trim()) {
      setError("매장명과 슬러그는 필수입니다.")
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      if (editingId) {
        const updated = await updateStore(editingId, {
          name: form.name,
          slug: form.slug,
          address: form.address || null,
          phone: form.phone || null,
        })
        setStores((prev) => prev.map((s) => (s.id === editingId ? updated : s)))
      } else {
        const created = await createStore({
          name: form.name,
          slug: form.slug,
          address: form.address || undefined,
          phone: form.phone || undefined,
        })
        setStores((prev) => [...prev, created])
      }
      cancelForm()
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleToggleActive(store: Store) {
    try {
      const updated = await updateStore(store.id, { is_active: !store.is_active })
      setStores((prev) => prev.map((s) => (s.id === store.id ? updated : s)))
    } catch (e) {
      setError(e instanceof Error ? e.message : "상태 변경에 실패했습니다.")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 신규 등록 버튼 */}
      {!showForm && (
        <div className="flex justify-end">
          <Button onClick={startCreate}>+ 매장 추가</Button>
        </div>
      )}

      {/* 폼 */}
      {showForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            {editingId ? "매장 수정" : "새 매장 추가"}
          </h2>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="매장명 *"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="GigaCoffee 강남점"
            />
            <Input
              label="슬러그 * (영문 소문자, 숫자, 하이픈)"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="gangnam"
            />
            <Input
              label="주소"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="서울시 강남구 테헤란로 1"
            />
            <Input
              label="전화번호"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="02-1234-5678"
            />
          </div>
          <div className="mt-4 flex gap-3">
            <Button onClick={handleSubmit} isLoading={isLoading}>
              {editingId ? "수정 완료" : "등록"}
            </Button>
            <Button variant="outline" onClick={cancelForm} disabled={isLoading}>
              취소
            </Button>
          </div>
        </div>
      )}

      {/* 매장 목록 */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-6 py-3 text-left font-medium text-gray-500">매장명</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500">슬러그</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500">주소</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500">전화</th>
              <th className="px-6 py-3 text-center font-medium text-gray-500">상태</th>
              <th className="px-6 py-3 text-center font-medium text-gray-500">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stores.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400">
                  등록된 매장이 없습니다.
                </td>
              </tr>
            )}
            {stores.map((store) => (
              <tr key={store.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{store.name}</td>
                <td className="px-6 py-4 text-gray-500">{store.slug}</td>
                <td className="px-6 py-4 text-gray-500">{store.address ?? "—"}</td>
                <td className="px-6 py-4 text-gray-500">{store.phone ?? "—"}</td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleToggleActive(store)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      store.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {store.is_active ? "운영중" : "비활성"}
                  </button>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => startEdit(store)}
                    className="text-sm font-medium text-amber-600 hover:text-amber-800"
                  >
                    수정
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
