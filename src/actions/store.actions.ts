"use server"

import { createClient } from "@/lib/supabase/server"
import { storeRepo, roleRepo } from "@/lib/db"
import type { Store } from "@/types/store.types"

async function assertFranchiseAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("로그인이 필요합니다.")
  const ok = await roleRepo.isFranchiseAdmin(user.id)
  if (!ok) throw new Error("프랜차이즈 관리자 권한이 필요합니다.")
}

export async function getStores(activeOnly = false): Promise<Store[]> {
  return storeRepo.findAll(activeOnly)
}

export async function createStore(data: {
  name: string
  slug: string
  address?: string
  phone?: string
}): Promise<Store> {
  await assertFranchiseAdmin()
  return storeRepo.create(data)
}

export async function updateStore(
  id: string,
  data: Partial<Omit<Store, "id" | "created_at">>
): Promise<Store> {
  await assertFranchiseAdmin()
  return storeRepo.update(id, data)
}
