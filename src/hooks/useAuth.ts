"use client"

import { useCallback, useRef } from "react"
import { AuthProviderClass } from "@/lib/auth"
import type { AuthUser } from "@/lib/auth/types"

// AuthProvider 인터페이스를 통해 구현체와 독립된 훅
// AuthProviderClass 교체 시 이 파일 무변경

export function useAuth() {
  const providerRef = useRef<InstanceType<typeof AuthProviderClass> | null>(null)
  if (!providerRef.current) {
    providerRef.current = new AuthProviderClass()
  }
  const provider = providerRef.current
  const getUser = useCallback(() => provider.getUser(), [])
  const signIn = useCallback((email: string, password: string) => provider.signIn(email, password), [])
  const signUp = useCallback(
    (email: string, password: string, name: string) => provider.signUp(email, password, name),
    []
  )
  const signOut = useCallback(() => provider.signOut(), [])
  const signInWithOAuth = useCallback(
    (p: "kakao" | "google") => provider.signInWithOAuth(p),
    []
  )
  const resetPassword = useCallback((email: string) => provider.resetPassword(email), [])
  const onAuthStateChange = useCallback(
    (cb: (user: AuthUser | null) => void) => provider.onAuthStateChange(cb),
    []
  )

  return { getUser, signIn, signUp, signOut, signInWithOAuth, resetPassword, onAuthStateChange }
}
