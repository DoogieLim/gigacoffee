import { createClient } from "@supabase/supabase-js"

// DB용 (eatsy schema)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { db: { schema: "eatsy" } }
)

// Storage용 (schema 옵션 불필요)
const storageClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const BUCKET = "products"

const categories = [
  { name: "커피",            slug: "coffee",    sort_order: 1 },
  { name: "라떼",            slug: "latte",     sort_order: 2 },
  { name: "콜드브루",        slug: "coldbrew",  sort_order: 3 },
  { name: "에이드 & 주스",   slug: "ade-juice", sort_order: 4 },
  { name: "스무디 & 프라페", slug: "smoothie",  sort_order: 5 },
  { name: "티",              slug: "tea",       sort_order: 6 },
]

// source_image_url: 다운로드 원본 / image_url: 업로드 후 CDN URL로 교체됨
const productsByCategorySlug: Record<string, {
  name: string; price: number; source_image_url: string; description: string
}[]> = {
  coffee: [
    {
      name: "메가리카노 (ICE)",
      price: 3000,
      source_image_url: "https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?w=600&auto=compress",
      description: "메가커피 시그니처 아이스 아메리카노. 진하고 깔끔한 에스프레소의 맛을 느껴보세요.",
    },
    {
      name: "카페모카 (ICE)",
      price: 3700,
      source_image_url: "https://images.pexels.com/photos/2396220/pexels-photo-2396220.jpeg?w=600&auto=compress",
      description: "에스프레소와 초콜릿 소스가 어우러진 달콤한 아이스 카페모카.",
    },
    {
      name: "카푸치노 (HOT)",
      price: 3000,
      source_image_url: "https://images.pexels.com/photos/350478/pexels-photo-350478.jpeg?w=600&auto=compress",
      description: "풍성한 우유 거품과 에스프레소가 만나는 클래식 카푸치노.",
    },
  ],
  latte: [
    {
      name: "헤이즐넛 라떼 (ICE)",
      price: 3200,
      source_image_url: "https://images.pexels.com/photos/1793035/pexels-photo-1793035.jpeg?w=600&auto=compress",
      description: "고소한 헤이즐넛 시럽과 부드러운 우유가 조화로운 라떼.",
    },
    {
      name: "바닐라 라떼 (ICE)",
      price: 3200,
      source_image_url: "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?w=600&auto=compress",
      description: "달콤한 바닐라 향이 가득한 부드러운 아이스 라떼.",
    },
    {
      name: "티라미수 라떼 (ICE)",
      price: 3900,
      source_image_url: "https://images.pexels.com/photos/3024840/pexels-photo-3024840.jpeg?w=600&auto=compress",
      description: "이탈리아 디저트 티라미수를 음료로. 달콤 쌉싸름한 맛.",
    },
    {
      name: "연유 라떼 (HOT)",
      price: 3700,
      source_image_url: "https://images.pexels.com/photos/1148086/pexels-photo-1148086.jpeg?w=600&auto=compress",
      description: "진한 연유의 달콤함과 에스프레소가 어우러진 따뜻한 라떼.",
    },
    {
      name: "흑당 라떼 (ICE)",
      price: 3000,
      source_image_url: "https://images.pexels.com/photos/7362079/pexels-photo-7362079.jpeg?w=600&auto=compress",
      description: "달콤한 흑당 시럽이 층을 이루는 비주얼 맛집 라떼.",
    },
    {
      name: "흑당 버블 라떼 (ICE)",
      price: 3500,
      source_image_url: "https://images.pexels.com/photos/5947036/pexels-photo-5947036.jpeg?w=600&auto=compress",
      description: "흑당 라떼에 쫀득한 타피오카 버블을 더했습니다.",
    },
    {
      name: "흑당 버블 밀크티 라떼 (ICE)",
      price: 3800,
      source_image_url: "https://images.pexels.com/photos/8330777/pexels-photo-8330777.jpeg?w=600&auto=compress",
      description: "진한 홍차와 흑당, 버블이 만나는 인기 밀크티 라떼.",
    },
  ],
  coldbrew: [
    {
      name: "콜드브루 오리지널 (ICE)",
      price: 3300,
      source_image_url: "https://images.pexels.com/photos/2615323/pexels-photo-2615323.jpeg?w=600&auto=compress",
      description: "12시간 저온 추출한 부드럽고 깊은 콜드브루 원액.",
    },
    {
      name: "콜드브루 라떼 (ICE)",
      price: 3800,
      source_image_url: "https://images.pexels.com/photos/4346379/pexels-photo-4346379.jpeg?w=600&auto=compress",
      description: "12시간 저온 추출 콜드브루에 부드러운 우유를 블렌딩.",
    },
  ],
  "ade-juice": [
    {
      name: "레몬 에이드 (ICE)",
      price: 3500,
      source_image_url: "https://images.pexels.com/photos/2109099/pexels-photo-2109099.jpeg?w=600&auto=compress",
      description: "상큼한 레몬즙과 탄산이 만나는 청량한 레몬 에이드.",
    },
    {
      name: "자몽 에이드 (ICE)",
      price: 3500,
      source_image_url: "https://images.pexels.com/photos/1453000/pexels-photo-1453000.jpeg?w=600&auto=compress",
      description: "새콤달콤한 자몽의 풍미가 가득한 탄산 에이드.",
    },
    {
      name: "청포도 에이드 (ICE)",
      price: 3500,
      source_image_url: "https://images.pexels.com/photos/7788838/pexels-photo-7788838.jpeg?w=600&auto=compress",
      description: "달콤한 청포도 과즙과 탄산이 어우러지는 에이드.",
    },
    {
      name: "딸기바나나 주스 (ICE)",
      price: 3800,
      source_image_url: "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?w=600&auto=compress",
      description: "신선한 딸기와 바나나를 갈아 만든 과일 주스.",
    },
    {
      name: "딸기 주스 (ICE)",
      price: 3900,
      source_image_url: "https://images.pexels.com/photos/3408354/pexels-photo-3408354.jpeg?w=600&auto=compress",
      description: "100% 딸기로 만든 진한 딸기 주스.",
    },
  ],
  smoothie: [
    {
      name: "쿠키 프라페 (ICE)",
      price: 3900,
      source_image_url: "https://images.pexels.com/photos/3727254/pexels-photo-3727254.jpeg?w=600&auto=compress",
      description: "달콤한 쿠키 크럼블과 크림이 올라간 인기 프라페.",
    },
    {
      name: "민트 프라페 (ICE)",
      price: 3900,
      source_image_url: "https://images.pexels.com/photos/8325816/pexels-photo-8325816.jpeg?w=600&auto=compress",
      description: "상쾌한 민트 향과 초코칩이 조화로운 프라페.",
    },
    {
      name: "스트로베리 치즈홀릭 (ICE)",
      price: 4500,
      source_image_url: "https://images.pexels.com/photos/3625372/pexels-photo-3625372.jpeg?w=600&auto=compress",
      description: "딸기와 크림치즈가 만나는 달콤 새콤한 시그니처 스무디.",
    },
    {
      name: "유니콘 프라페 (ICE)",
      price: 4800,
      source_image_url: "https://images.pexels.com/photos/4551831/pexels-photo-4551831.jpeg?w=600&auto=compress",
      description: "화려한 컬러의 유니콘 프라페. 맛도 비주얼도 특별합니다.",
    },
  ],
  tea: [
    {
      name: "자몽차 (HOT/ICE)",
      price: 3000,
      source_image_url: "https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?w=600&auto=compress",
      description: "향긋한 자몽과 꿀이 어우러진 따뜻하고 건강한 차.",
    },
    {
      name: "레몬차 (HOT/ICE)",
      price: 3000,
      source_image_url: "https://images.pexels.com/photos/230477/pexels-photo-230477.jpeg?w=600&auto=compress",
      description: "상큼한 레몬과 꿀의 조화. 목 건강에 좋은 레몬차.",
    },
    {
      name: "허니자몽 블랙티 (ICE)",
      price: 3500,
      source_image_url: "https://images.pexels.com/photos/1493080/pexels-photo-1493080.jpeg?w=600&auto=compress",
      description: "홍차의 깊은 맛에 자몽과 꿀을 더한 프리미엄 블랙티.",
    },
  ],
}

function nameToFilename(categorySlug: string, name: string, index: number): string {
  const slug = name
    .toLowerCase()
    .replace(/[()]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
  return `${categorySlug}/${slug}-${index}.jpg`
}

async function ensureBucket() {
  const { data: buckets, error } = await storageClient.storage.listBuckets()
  if (error) throw new Error(`버킷 목록 조회 실패: ${error.message}`)

  const exists = buckets.some((b) => b.name === BUCKET)
  if (!exists) {
    const { error: createError } = await storageClient.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    })
    if (createError) throw new Error(`버킷 생성 실패: ${createError.message}`)
    console.log(`✓ Storage 버킷 '${BUCKET}' 생성 완료`)
  } else {
    console.log(`✓ Storage 버킷 '${BUCKET}' 확인 완료`)
  }
}

async function uploadImage(sourceUrl: string, storagePath: string): Promise<string> {
  const res = await fetch(sourceUrl)
  if (!res.ok) throw new Error(`이미지 다운로드 실패 (${res.status}): ${sourceUrl}`)

  const buffer = await res.arrayBuffer()
  const contentType = res.headers.get("content-type") ?? "image/jpeg"

  const { error } = await storageClient.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType, upsert: true })

  if (error) throw new Error(`Storage 업로드 실패 (${storagePath}): ${error.message}`)

  const { data } = storageClient.storage.from(BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
}

async function seed() {
  // 1. 버킷 준비
  await ensureBucket()

  // 2. 이미지 업로드 (카테고리/파일명 구조)
  console.log("\n이미지 업로드 중...")
  const uploadedUrlMap = new Map<string, string>() // sourceUrl → cdnUrl

  for (const [categorySlug, products] of Object.entries(productsByCategorySlug)) {
    for (let idx = 0; idx < products.length; idx++) {
      const product = products[idx]
      const filename = nameToFilename(categorySlug, product.name, idx + 1)
      process.stdout.write(`  ${filename} ... `)
      try {
        const cdnUrl = await uploadImage(product.source_image_url, filename)
        uploadedUrlMap.set(product.source_image_url, cdnUrl)
        console.log("✓")
      } catch (err) {
        console.log(`✗`)
      }
    }
  }
  console.log(`✓ 이미지 ${uploadedUrlMap.size}개 업로드 완료`)

  // 3. 카테고리 등록
  console.log("\n카테고리 등록 중...")
  const { data: insertedCategories, error: catError } = await supabase
    .from("categories")
    .insert(categories)
    .select()

  if (catError) {
    console.error("카테고리 등록 실패:", catError.message)
    process.exit(1)
  }
  console.log(`✓ 카테고리 ${insertedCategories.length}개 등록 완료`)

  const categoryMap = Object.fromEntries(
    insertedCategories.map((c) => [c.slug, c.id])
  )

  // 4. 상품 등록 (CDN URL 사용)
  const allProducts = Object.entries(productsByCategorySlug).flatMap(
    ([slug, products]) =>
      products.map(({ source_image_url, ...p }) => ({
        ...p,
        category_id: categoryMap[slug],
        image_url: uploadedUrlMap.get(source_image_url) ?? null,
      }))
  )

  console.log(`상품 ${allProducts.length}개 등록 중...`)
  const { data: insertedProducts, error: prodError } = await supabase
    .from("products")
    .insert(allProducts)
    .select()

  if (prodError) {
    console.error("상품 등록 실패:", prodError.message)
    process.exit(1)
  }
  console.log(`✓ 상품 ${insertedProducts.length}개 등록 완료`)

  // 5. 재고 초기화
  const inventoryData = insertedProducts.map((p) => ({
    product_id: p.id,
    quantity: 999,
    low_stock_threshold: 10,
  }))

  const { error: invError } = await supabase.from("inventory").insert(inventoryData)
  if (invError) {
    console.error("재고 등록 실패:", invError.message)
  } else {
    console.log(`✓ 재고 ${inventoryData.length}개 초기화 완료`)
  }

  console.log("\n✅ 시드 데이터 등록 완료!")
}

seed()
