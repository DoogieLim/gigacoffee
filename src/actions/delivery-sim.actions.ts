"use server"

import { orderRepo } from "@/lib/db"
import { requireAnyRole } from "@/lib/auth/action-auth"
import type { DeliveryStatus, Order } from "@/types/order.types"

/**
 * 배달 시뮬레이터용 Server Action
 * - 관리자만 호출 가능
 * - delivery_status 컬럼 업데이트
 * - 로봇 배달 시 PIN 자동 생성
 */

function generatePin(): string {
  return String(Math.floor(1000 + Math.random() * 9000))
}

export async function updateDeliveryStatus(
  orderId: string,
  deliveryStatus: DeliveryStatus
): Promise<Order> {
  await requireAnyRole(["admin", "staff", "franchise_admin"])

  // 로봇 주문 접수 시 PIN 자동 생성
  let pin: string | undefined
  if (deliveryStatus === "robot_order_accepted") {
    pin = generatePin()
  }

  // 배달 상태 업데이트
  const order = await orderRepo.updateDeliveryStatus(orderId, deliveryStatus, pin)

  // 완료/취소 상태면 주문 상태도 동기화
  if (deliveryStatus === "robot_completed" || deliveryStatus === "rider_completed") {
    await orderRepo.updateStatus(orderId, "completed")
  } else if (deliveryStatus === "robot_cancelled" || deliveryStatus === "rider_cancelled") {
    await orderRepo.updateStatus(orderId, "cancelled")
  } else if (
    deliveryStatus === "robot_delivery_started" ||
    deliveryStatus === "rider_delivering"
  ) {
    await orderRepo.updateStatus(orderId, "out_for_delivery")
  }

  return order
}

export async function getDeliveryOrders(): Promise<Order[]> {
  await requireAnyRole(["admin", "staff", "franchise_admin"])

  const allOrders = await orderRepo.findAll(100)
  return allOrders.filter(
    (o) => o.delivery_type === "robot" || o.delivery_type === "rider"
  )
}

export async function getOrderForSimulator(orderId: string): Promise<Order | null> {
  await requireAnyRole(["admin", "staff", "franchise_admin"])
  return orderRepo.findFullById(orderId)
}
