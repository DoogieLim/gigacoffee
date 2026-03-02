export const ROLES = {
  FRANCHISE_ADMIN: "franchise_admin",
  ADMIN: "admin",
  STAFF: "staff",
  MEMBER: "member",
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_LABELS: Record<Role, string> = {
  franchise_admin: "프랜차이즈 관리자",
  admin: "매장 관리자",
  staff: "스태프",
  member: "일반회원",
}
