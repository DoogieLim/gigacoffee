/**
 * 데이터 접근 레이어 - 단일 교체 포인트
 *
 * DB를 교체할 때 이 파일의 import 경로만 변경하면 됩니다.
 *
 * 현재: Supabase
 * 교체 예시:
 *   import { PrismaProductRepository } from "./prisma/product.prisma"
 *   export const productRepo: ProductRepository = new PrismaProductRepository(prisma)
 */

import type { ProductRepository } from "./repositories/product.repository"
import type { OrderRepository } from "./repositories/order.repository"
import type { InventoryRepository } from "./repositories/inventory.repository"
import type { BoardRepository } from "./repositories/board.repository"
import type { MemberRepository } from "./repositories/member.repository"
import type { NotificationRepository } from "./repositories/notification.repository"
import type { RoleRepository } from "./repositories/role.repository"
import type { PaymentRepository } from "./repositories/payment.repository"

import { SupabaseProductRepository } from "./supabase/product.supabase"
import { SupabaseOrderRepository } from "./supabase/order.supabase"
import { SupabaseInventoryRepository } from "./supabase/inventory.supabase"
import { SupabaseBoardRepository } from "./supabase/board.supabase"
import { SupabaseMemberRepository } from "./supabase/member.supabase"
import { SupabaseNotificationRepository } from "./supabase/notification.supabase"
import { SupabaseRoleRepository } from "./supabase/role.supabase"
import { SupabasePaymentRepository } from "./supabase/payment.supabase"

export const productRepo: ProductRepository = new SupabaseProductRepository()
export const orderRepo: OrderRepository = new SupabaseOrderRepository()
export const inventoryRepo: InventoryRepository = new SupabaseInventoryRepository()
export const boardRepo: BoardRepository = new SupabaseBoardRepository()
export const memberRepo: MemberRepository = new SupabaseMemberRepository()
export const notificationRepo: NotificationRepository = new SupabaseNotificationRepository()
export const roleRepo: RoleRepository = new SupabaseRoleRepository()
export const paymentRepo: PaymentRepository = new SupabasePaymentRepository()
