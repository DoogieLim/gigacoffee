"use client"

import { useEffect, useRef } from "react"
import { useCartStore } from "@/stores/cartStore"
import type { DeliveryAddress } from "@/types/order.types"

declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: { zonecode: string; roadAddress: string; jibunAddress: string }) => void
      }) => { open: () => void }
    }
  }
}

const KAKAO_POSTCODE_URL = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"

export function AddressInput() {
  const deliveryAddress = useCartStore((s) => s.deliveryAddress)
  const setDeliveryAddress = useCartStore((s) => s.setDeliveryAddress)
  const scriptLoaded = useRef(false)

  useEffect(() => {
    if (scriptLoaded.current) return
    const existing = document.querySelector(`script[src="${KAKAO_POSTCODE_URL}"]`)
    if (existing) { scriptLoaded.current = true; return }
    const script = document.createElement("script")
    script.src = KAKAO_POSTCODE_URL
    script.onload = () => { scriptLoaded.current = true }
    document.head.appendChild(script)
  }, [])

  function openPostcode() {
    if (!window.daum?.Postcode) return
    new window.daum.Postcode({
      oncomplete(data) {
        setDeliveryAddress({
          zonecode: data.zonecode,
          address: data.roadAddress || data.jibunAddress,
          detail: "",
        })
      },
    }).open()
  }

  function handleDetailChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!deliveryAddress) return
    setDeliveryAddress({ ...deliveryAddress, detail: e.target.value })
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          readOnly
          value={deliveryAddress ? `[${deliveryAddress.zonecode}] ${deliveryAddress.address}` : ""}
          placeholder="주소를 검색해주세요"
          className="flex-1 rounded-xl border border-border-subtle bg-neutral-50 px-3 py-2.5 text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={openPostcode}
          className="shrink-0 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand/90 active:scale-95"
        >
          주소 검색
        </button>
      </div>
      {deliveryAddress && (
        <input
          value={deliveryAddress.detail}
          onChange={handleDetailChange}
          placeholder="상세 주소 입력 (동, 호수 등)"
          className="w-full rounded-xl border border-border-subtle bg-white px-3 py-2.5 text-sm placeholder:text-neutral-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
        />
      )}
    </div>
  )
}
