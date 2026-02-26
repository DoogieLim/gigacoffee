"use server"

import { productRepo } from "@/lib/db"

export async function getProducts(categoryId?: string) {
  return productRepo.findAll({ categoryId, availableOnly: true })
}

export async function getCategories() {
  return productRepo.findCategories(true)
}
