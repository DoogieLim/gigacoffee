import { notFound } from "next/navigation"
import { createServiceClient } from "@/lib/supabase/server"
import { OrderTrackingClient } from "./OrderTrackingClient"

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServiceClient()

  const { data: order } = await supabase
    .from("orders")
    .select(`
      id, status, delivery_type, delivery_address,
      total_amount, delivery_fee, memo, created_at,
      delivery_status, robot_pin,
      order_items(product_name, quantity, line_total)
    `)
    .eq("id", id)
    .single()

  if (!order) notFound()

  return <OrderTrackingClient initialOrder={order as unknown as Parameters<typeof OrderTrackingClient>[0]["initialOrder"]} />
}
