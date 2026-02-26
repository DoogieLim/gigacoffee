import type { Product, Category } from "@/types/product.types"

export interface ProductRepository {
  findAll(options?: { categoryId?: string; availableOnly?: boolean }): Promise<Product[]>
  findById(id: string): Promise<Product | null>
  findCategories(activeOnly?: boolean): Promise<Category[]>
}
