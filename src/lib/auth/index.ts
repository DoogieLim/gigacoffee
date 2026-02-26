// 현재 구현체: Supabase
// 교체 시: 이 파일에서 import만 변경하면 됩니다.
// 예) import { NextAuthProvider as authProvider } from './providers/nextauth'
// 예) import { ClerkAuthProvider as authProvider } from './providers/clerk'
export { SupabaseAuthProvider as AuthProviderClass } from "./providers/supabase"
export type { AuthProvider, AuthUser } from "./types"
