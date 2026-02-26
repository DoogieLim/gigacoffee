"use client"

import { useFcmToken } from "@/hooks/useFcmToken"

interface FcmInitializerProps {
  userId: string | null
}

export function FcmInitializer({ userId }: FcmInitializerProps) {
  useFcmToken(userId)
  return null
}
