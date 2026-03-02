import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OrderTrackingClient } from "./OrderTrackingClient"

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .schema("gigacoffee")
    .from("orders")
    .select(`
      id, status, delivery_type, delivery_address,
      total_amount, delivery_fee, memo, created_at,
      order_items(product_name, quantity, line_total)
    `)
    .eq("id", id)
    .single()

  if (!order) notFound()

  return <OrderTrackingClient initialOrder={order as Parameters<typeof OrderTrackingClient>[0]["initialOrder"]} />
}
