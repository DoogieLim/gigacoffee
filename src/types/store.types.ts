export interface Store {
  id: string
  name: string
  slug: string
  address: string | null
  phone: string | null
  is_active: boolean
  created_at: string
}

export type StoreRole = "franchise_admin" | "store_admin" | "store_staff"

export interface AdminStoreContext {
  isFranchiseAdmin: boolean
  currentStoreId: string | null  // null = 전체 보기 (franchise_admin만)
  managedStores: Store[]         // 접근 가능한 매장 목록
}
