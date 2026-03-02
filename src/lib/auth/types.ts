export interface AuthUser {
  id: string
  email: string
  name: string
  // `role` is set when the user has a record in the `roles` table
  // (admin/staff). 일반 사용자는 undefined.
  role?: string
  // kiosk 전용 계정인지 여부. 클라이언트에서는 NEXT_PUBLIC_KIOSK_EMAIL
  // 환경변수와 비교하여 결정하며 서버에서는 process.env.KIOSK_EMAIL을 사용.
  isKiosk?: boolean
  phone?: string | null
  avatar_url?: string | null
  fcm_token?: string | null
}

export interface AuthProvider {
  getUser(): Promise<AuthUser | null>
  signIn(email: string, password: string): Promise<AuthUser>
  signUp(email: string, password: string, name: string): Promise<AuthUser>
  signOut(): Promise<void>
  signInWithOAuth(provider: "kakao" | "google", next?: string): Promise<void>
  resetPassword(email: string): Promise<void>
  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void
}
