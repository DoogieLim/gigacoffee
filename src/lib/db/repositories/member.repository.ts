export interface ProfileRow {
  id: string
  name: string
  email: string
  phone: string | null
  avatar_url: string | null
  is_active: boolean
  fcm_token: string | null
  created_at: string
  updated_at: string
}

export interface UpdateProfileData {
  name?: string
  phone?: string | null
  avatar_url?: string | null
  fcm_token?: string | null
}

export interface MemberRepository {
  findById(id: string): Promise<ProfileRow | null>
  findAll(): Promise<ProfileRow[]>
  findPhoneAndToken(id: string): Promise<{ phone: string | null; fcm_token: string | null } | null>
  update(id: string, data: UpdateProfileData): Promise<void>
}
