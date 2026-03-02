import { createClient } from "@/lib/supabase/server"
import { RiderClient } from "./RiderClient"

export default async function RiderPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .schema("gigacoffee")
    .from("orders")
    .select(`
      id, status, delivery_type, delivery_address,
      total_amount, created_at,
      order_items(product_name, quantity)
    `)
    .eq("status", "out_for_delivery")
    .in("delivery_type", ["robot", "rider"])
    .order("created_at", { ascending: true })

  return <RiderClient initialOrders={(orders ?? []) as Parameters<typeof RiderClient>[0]["initialOrders"]} />
}
