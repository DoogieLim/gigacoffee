"use server"

import { revalidatePath } from "next/cache"
import { productRepo } from "@/lib/db"
import { createClient } from "@/lib/supabase/server"
import { generateEmbedding, buildProductEmbeddingText } from "@/lib/gemini/embeddings"
import type { CreateProductData, UpdateProductData } from "@/lib/db/repositories/product.repository"

export async function getProducts(categoryId?: string) {
  return productRepo.findAll({ categoryId, availableOnly: true })
}

export async function getCategories() {
  return productRepo.findCategories(true)
}

export async function getAllCategories() {
  return productRepo.findCategories(false)
}

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("인증이 필요합니다.")

  const { data: roleData } = await supabase
    .from("roles")
    .select("role")
    .eq("user_id", user.id)
    .single()

  type RoleData = { role: string }
  const role = (roleData as unknown as RoleData | null)?.role
  if (!role || !["admin", "staff"].includes(role)) throw new Error("권한이 없습니다.")
}

/** 임베딩 생성 후 저장 (실패해도 상품 저장은 유지) */
async function syncEmbedding(product: {
  id: string
  name: string
  description?: string | null
  category?: { name?: string } | null
}) {
  try {
    const text = buildProductEmbeddingText({
      name: product.name,
      description: product.description,
      categoryName: product.category?.name,
    })
    const embedding = await generateEmbedding(text)
    await productRepo.updateEmbedding(product.id, embedding)
  } catch (err) {
    // 임베딩 실패는 무시 (상품 저장 자체에는 영향 없음)
    console.error("[embedding] 임베딩 생성/저장 실패:", err)
  }
}

export async function createProduct(data: CreateProductData) {
  await requireAdmin()
  const product = await productRepo.create(data)
  revalidatePath("/admin/products")
  // 백그라운드에서 임베딩 생성 (await 없이 — 결과를 기다리지 않음)
  void syncEmbedding(product)
  return product
}

export async function updateProduct(id: string, data: UpdateProductData) {
  await requireAdmin()
  const product = await productRepo.update(id, data)
  revalidatePath("/admin/products")
  revalidatePath(`/admin/products/${id}`)
  void syncEmbedding(product)
  return product
}

export async function deleteProduct(id: string) {
  await requireAdmin()
  await productRepo.delete(id)
  revalidatePath("/admin/products")
}
