import { createClient } from "@supabase/supabase-js"

async function check() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { db: { schema: "eatsy" } }
  )

  const cats = await supabase.from("categories").select("*")
  console.log("카테고리 - 에러:", cats.error)
  console.log("카테고리 - 데이터 수:", cats.data?.length)
  cats.data?.slice(0, 3).forEach((c: any) => console.log(`  ✓ ${c.name}`))

  const prods = await supabase.from("products").select("name,price").limit(5)
  console.log("\n상품 - 에러:", prods.error)
  console.log("상품 - 데이터 수:", prods.data?.length)
  prods.data?.slice(0, 3).forEach((p: any) => console.log(`  ✓ ${p.name} (${p.price}원)`))

  const inv = await supabase.from("inventory").select("*").limit(5)
  console.log("\n재고 - 에러:", inv.error)
  console.log("재고 - 데이터 수:", inv.data?.length)
}

check()
