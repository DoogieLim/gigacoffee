/**
 * Gemini 임베딩 생성 → SQL UPDATE 파일 출력
 * PostgREST 없이 동작 (DB 직접 접근 불필요)
 * 실행: npx tsx --env-file=.env.local scripts/generate-embeddings.ts
 * 결과: scripts/embeddings.sql → Supabase SQL Editor에서 실행
 */

import * as fs from "fs"
import * as path from "path"
import { generateEmbedding, buildProductEmbeddingText } from "../src/lib/gemini/embeddings"

// seed-menu.ts의 상품 데이터와 동일한 구조
const categories: Record<string, string> = {
  coffee:    "커피",
  latte:     "라떼",
  coldbrew:  "콜드브루",
  "ade-juice": "에이드 & 주스",
  smoothie:  "스무디 & 프라페",
  tea:       "티",
}

const productsByCategorySlug: Record<string, { name: string; description: string }[]> = {
  coffee: [
    { name: "메가리카노 (ICE)",  description: "메가커피 시그니처 아이스 아메리카노. 진하고 깔끔한 에스프레소의 맛을 느껴보세요." },
    { name: "카페모카 (ICE)",    description: "에스프레소와 초콜릿 소스가 어우러진 달콤한 아이스 카페모카." },
    { name: "카푸치노 (HOT)",    description: "풍성한 우유 거품과 에스프레소가 만나는 클래식 카푸치노." },
  ],
  latte: [
    { name: "헤이즐넛 라떼 (ICE)",        description: "고소한 헤이즐넛 시럽과 부드러운 우유가 조화로운 라떼." },
    { name: "바닐라 라떼 (ICE)",           description: "달콤한 바닐라 향이 가득한 부드러운 아이스 라떼." },
    { name: "티라미수 라떼 (ICE)",         description: "이탈리아 디저트 티라미수를 음료로. 달콤 쌉싸름한 맛." },
    { name: "연유 라떼 (HOT)",             description: "진한 연유의 달콤함과 에스프레소가 어우러진 따뜻한 라떼." },
    { name: "흑당 라떼 (ICE)",             description: "달콤한 흑당 시럽이 층을 이루는 비주얼 맛집 라떼." },
    { name: "흑당 버블 라떼 (ICE)",        description: "흑당 라떼에 쫀득한 타피오카 버블을 더했습니다." },
    { name: "흑당 버블 밀크티 라떼 (ICE)", description: "진한 홍차와 흑당, 버블이 만나는 인기 밀크티 라떼." },
  ],
  coldbrew: [
    { name: "콜드브루 오리지널 (ICE)", description: "12시간 저온 추출한 부드럽고 깊은 콜드브루 원액." },
    { name: "콜드브루 라떼 (ICE)",     description: "12시간 저온 추출 콜드브루에 부드러운 우유를 블렌딩." },
  ],
  "ade-juice": [
    { name: "레몬 에이드 (ICE)",     description: "상큼한 레몬즙과 탄산이 만나는 청량한 레몬 에이드." },
    { name: "자몽 에이드 (ICE)",     description: "새콤달콤한 자몽의 풍미가 가득한 탄산 에이드." },
    { name: "청포도 에이드 (ICE)",   description: "달콤한 청포도 과즙과 탄산이 어우러지는 에이드." },
    { name: "딸기바나나 주스 (ICE)", description: "신선한 딸기와 바나나를 갈아 만든 과일 주스." },
    { name: "딸기 주스 (ICE)",       description: "100% 딸기로 만든 진한 딸기 주스." },
  ],
  smoothie: [
    { name: "쿠키 프라페 (ICE)",          description: "달콤한 쿠키 크럼블과 크림이 올라간 인기 프라페." },
    { name: "민트 프라페 (ICE)",          description: "상쾌한 민트 향과 초코칩이 조화로운 프라페." },
    { name: "스트로베리 치즈홀릭 (ICE)", description: "딸기와 크림치즈가 만나는 달콤 새콤한 시그니처 스무디." },
    { name: "유니콘 프라페 (ICE)",        description: "화려한 컬러의 유니콘 프라페. 맛도 비주얼도 특별합니다." },
  ],
  tea: [
    { name: "자몽차 (HOT/ICE)",       description: "향긋한 자몽과 꿀이 어우러진 따뜻하고 건강한 차." },
    { name: "레몬차 (HOT/ICE)",       description: "상큼한 레몬과 꿀의 조화. 목 건강에 좋은 레몬차." },
    { name: "허니자몽 블랙티 (ICE)", description: "홍차의 깊은 맛에 자몽과 꿀을 더한 프리미엄 블랙티." },
  ],
}

async function main() {
  const lines: string[] = []

  lines.push("-- =====================================================")
  lines.push("-- 상품 임베딩 데이터 (Gemini text-embedding-004)")
  lines.push(`-- 생성일시: ${new Date().toISOString()}`)
  lines.push("-- =====================================================")
  lines.push("")
  lines.push("SET search_path = gigacoffee, extensions, public;")
  lines.push("")
  lines.push("-- embedding 컬럼 재추가 (없을 경우)")
  lines.push("ALTER TABLE gigacoffee.products ADD COLUMN IF NOT EXISTS embedding vector(768);")
  lines.push("")
  lines.push("-- 상품별 임베딩 UPDATE")

  let total = 0
  let success = 0

  for (const [slug, products] of Object.entries(productsByCategorySlug)) {
    const categoryName = categories[slug]
    for (const product of products) {
      total++
      const text = buildProductEmbeddingText({ name: product.name, description: product.description, categoryName })
      process.stdout.write(`  [${product.name}] ... `)

      try {
        const embedding = await generateEmbedding(text)
        const vec = `[${embedding.join(",")}]`
        const safeName = product.name.replace(/'/g, "''")
        lines.push(`UPDATE gigacoffee.products SET embedding = '${vec}'::vector WHERE name = '${safeName}';`)
        console.log("✓")
        success++
      } catch (err) {
        console.log(`✗ ${(err as Error).message}`)
        lines.push(`-- ✗ 실패: ${product.name}`)
      }

      await new Promise((r) => setTimeout(r, 50))
    }
  }

  lines.push("")
  lines.push("-- HNSW 인덱스 재생성")
  lines.push("DROP INDEX IF EXISTS gigacoffee.idx_products_embedding;")
  lines.push("CREATE INDEX idx_products_embedding ON gigacoffee.products USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);")
  lines.push("")
  lines.push("-- 자연어 검색 함수")
  lines.push(`CREATE OR REPLACE FUNCTION gigacoffee.search_products_by_embedding(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.5,
  match_count     int   DEFAULT 10
)
RETURNS TABLE (
  id uuid, category_id uuid, name text, price int,
  image_url text, description text, is_available boolean,
  options jsonb, created_at timestamptz, similarity float
)
LANGUAGE sql STABLE
SET search_path = gigacoffee, extensions, public
AS $$
  SELECT p.id, p.category_id, p.name, p.price, p.image_url,
         p.description, p.is_available, p.options, p.created_at,
         1 - (p.embedding <=> query_embedding) AS similarity
  FROM gigacoffee.products p
  WHERE p.is_available = true
    AND p.embedding IS NOT NULL
    AND 1 - (p.embedding <=> query_embedding) > match_threshold
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
$$;`)
  lines.push("")
  lines.push("GRANT EXECUTE ON FUNCTION gigacoffee.search_products_by_embedding TO anon, authenticated;")

  const outPath = path.resolve(process.cwd(), "scripts/embeddings.sql")
  fs.writeFileSync(outPath, lines.join("\n"), "utf8")

  console.log(`\n✅ 완료 — 성공: ${success}/${total}`)
  console.log(`📄 SQL 파일 생성: ${outPath}`)
  console.log(`   → Supabase SQL Editor에서 실행하세요.`)
}

main()
