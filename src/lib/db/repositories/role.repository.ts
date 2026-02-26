export interface UserRoleRow {
  userId: string
  profile: { name: string; email: string } | null
  role: { name: string } | null
}

export interface RoleRepository {
  findUserRoles(): Promise<UserRoleRow[]>
}
