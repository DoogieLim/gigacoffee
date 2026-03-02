import type { Store } from "@/types/store.types"

export interface UserRoleRow {
  userId: string
  storeId: string | null
  profile: { name: string; email: string } | null
  role: { name: string } | null
}

export interface AdminAccessRequest {
  id: string
  userId: string
  reason: string | null
  status: "pending" | "approved" | "rejected"
  createdAt: string
  profile: { name: string; email: string } | null
}

export interface RoleRepository {
  findUserRoles(): Promise<UserRoleRow[]>
  findUserStores(userId: string): Promise<Store[]>
  isFranchiseAdmin(userId: string): Promise<boolean>
  findPendingAdminRequests(): Promise<AdminAccessRequest[]>
  findMyAdminRequest(userId: string): Promise<AdminAccessRequest | null>
  createAdminRequest(userId: string, reason: string): Promise<void>
  approveAdminRequest(requestId: string, reviewerId: string, adminRoleId: string): Promise<void>
  rejectAdminRequest(requestId: string, reviewerId: string): Promise<void>
}
