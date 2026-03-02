import { createServiceClient } from "@/lib/supabase/server"
import type { DeliveryRepository } from "../repositories/delivery.repository"
import type { DeliverySetting } from "@/types/order.types"

export class SupabaseDeliveryRepository implements DeliveryRepository {
  private async db() {
    return createServiceClient()
  }

  async findAll(storeId?: string | null): Promise<DeliverySetting[]> {
    const supabase = await this.db()
    let query = supabase
      .from("delivery_settings")
      .select("*")
      .order("type")
    if (storeId) query = query.eq("store_id", storeId)
    const { data } = await query
    return (data ?? []) as unknown as DeliverySetting[]
  }

  async update(type: "robot" | "rider", fee: number, isEnabled: boolean, storeId: string): Promise<DeliverySetting> {
    const supabase = await this.db()
    const { data, error } = await supabase
      .from("delivery_settings")
      .update({ fee, is_enabled: isEnabled, updated_at: new Date().toISOString() })
      .eq("type", type)
      .eq("store_id", storeId)
      .select()
      .single()
    if (error || !data) throw new Error("배달 설정 업데이트에 실패했습니다.")
    return data as unknown as DeliverySetting
  }
}
