export interface UserRoleRow {
  userId: string
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
  findPendingAdminRequests(): Promise<AdminAccessRequest[]>
  findMyAdminRequest(userId: string): Promise<AdminAccessRequest | null>
  createAdminRequest(userId: string, reason: string): Promise<void>
  approveAdminRequest(requestId: string, reviewerId: string, adminRoleId: string): Promise<void>
  rejectAdminRequest(requestId: string, reviewerId: string): Promise<void>
}
