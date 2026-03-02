import { storeRepo } from "@/lib/db"
import { StoreSelectClient } from "@/components/menu/StoreSelectClient"

export default async function StoresPage() {
  const stores = await storeRepo.findAll(true) // 활성 매장만

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">매장 선택</h1>
          <p className="mt-2 text-sm text-gray-500">주문하실 매장을 선택해주세요.</p>
        </div>
        <StoreSelectClient stores={stores} />
      </div>
    </div>
  )
}
