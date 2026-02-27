/**
 * Supabase 이미지 URL을 현재 프로젝트의 URL로 변환
 * 다른 프로젝트에 저장된 이미지도 접근 가능하게 함
 */
export function normalizeImageUrl(imageUrl: string | null): string | null {
  if (!imageUrl) return null

  // 이미 현재 프로젝트의 도메인이면 그대로 반환
  const currentDomain = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!currentDomain) return imageUrl

  if (imageUrl.includes(currentDomain)) {
    return imageUrl
  }

  // 다른 Supabase 프로젝트의 이미지라면, 경로만 추출
  // https://[old-domain]/storage/v1/object/public/...
  // → https://[current-domain]/storage/v1/object/public/...
  const pathMatch = imageUrl.match(/\/storage\/v1\/object\/.*/)
  if (pathMatch) {
    return `${currentDomain}${pathMatch[0]}`
  }

  // 변환 불가능하면 원본 반환
  return imageUrl
}
