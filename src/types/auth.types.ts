export type UserRole = "admin" | "staff" | "member"

export interface AuthUser {
  id: string
  email: string
  name: string
  role?: UserRole
  phone?: string | null
  avatar_url?: string | null
  fcm_token?: string | null
}

export interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
}
