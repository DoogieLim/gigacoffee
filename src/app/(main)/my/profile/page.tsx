import { getMyProfile } from "@/actions/member.actions"
import { ProfileForm } from "@/components/profile/ProfileForm"

export default async function ProfilePage() {
  const profile = await getMyProfile()

  if (!profile) {
    return <p className="text-center py-12">로그인이 필요합니다.</p>
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">프로필 수정</h1>
      <ProfileForm initialName={profile.name ?? ""} initialPhone={profile.phone ?? ""} />
    </div>
  )
}
