import type { Product, Category, ProductOption } from "@/types/product.types"

export interface CreateProductData {
  categoryId: string
  name: string
  price: number
  imageUrl?: string | null
  description?: string | null
  isAvailable?: boolean
  options?: ProductOption[] | null
}

export interface UpdateProductData {
  categoryId?: string
  name?: string
  price?: number
  imageUrl?: string | null
  description?: string | null
  isAvailable?: boolean
  options?: ProductOption[] | null
}

export interface ProductRepository {
  findAll(options?: { categoryId?: string; availableOnly?: boolean }): Promise<Product[]>
  findById(id: string): Promise<Product | null>
  findCategories(activeOnly?: boolean): Promise<Category[]>
  create(data: CreateProductData): Promise<Product>
  update(id: string, data: UpdateProductData): Promise<Product>
  delete(id: string): Promise<void>
  /** 벡터 임베딩으로 유사 상품 검색 (pgvector 코사인 유사도) */
  searchByEmbedding(embedding: number[], limit?: number): Promise<Product[]>
  /** 상품의 임베딩 벡터를 저장 */
  updateEmbedding(id: string, embedding: number[]): Promise<void>
}
