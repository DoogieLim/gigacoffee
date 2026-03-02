import type { Store } from "@/types/store.types"

export interface CreateStoreData {
  name: string
  slug: string
  address?: string | null
  phone?: string | null
}

export interface StoreRepository {
  findAll(activeOnly?: boolean): Promise<Store[]>
  findById(id: string): Promise<Store | null>
  findBySlug(slug: string): Promise<Store | null>
  create(data: CreateStoreData): Promise<Store>
  update(id: string, data: Partial<Omit<Store, "id" | "created_at">>): Promise<Store>
}
