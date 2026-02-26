export const ROLES = {
  ADMIN: "admin",
  STAFF: "staff",
  MEMBER: "member",
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_LABELS: Record<Role, string> = {
  admin: "관리자",
  staff: "스태프",
  member: "일반회원",
}
