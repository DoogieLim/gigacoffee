export interface Category {
  id: string
  name: string
  slug: string
  sort_order: number
  is_active: boolean
}

export interface ProductOption {
  name: string
  choices: { label: string; price_delta: number }[]
}

export interface Product {
  id: string
  category_id: string
  name: string
  price: number
  image_url: string | null
  is_available: boolean
  options: ProductOption[]
  category?: Category
  created_at: string
}

export interface SelectedOption {
  name: string
  choice: string
  price_delta: number
}
