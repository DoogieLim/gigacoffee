export interface AuthUser {
  id: string
  email: string
  name: string
  role?: string
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
