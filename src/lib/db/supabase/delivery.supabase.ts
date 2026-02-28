import { createServiceClient } from "@/lib/supabase/server"
import type { DeliveryRepository } from "../repositories/delivery.repository"
import type { DeliverySetting } from "@/types/order.types"

export class SupabaseDeliveryRepository implements DeliveryRepository {
  private async db() {
    return createServiceClient()
  }

  async findAll(): Promise<DeliverySetting[]> {
    const supabase = await this.db()
    const { data } = await supabase
      .from("delivery_settings")
      .select("*")
      .order("type")
    return (data ?? []) as DeliverySetting[]
  }

  async update(type: "robot" | "rider", fee: number, isEnabled: boolean): Promise<DeliverySetting> {
    const supabase = await this.db()
    const { data, error } = await supabase
      .from("delivery_settings")
      .update({ fee, is_enabled: isEnabled, updated_at: new Date().toISOString() })
      .eq("type", type)
      .select()
      .single()
    if (error || !data) throw new Error("배달 설정 업데이트에 실패했습니다.")
    return data as DeliverySetting
  }
}
