-- ============================================================
-- vector(768) → float8[] 마이그레이션
-- embedding 컬럼을 products 테이블에서 분리하여 PostgREST 복구
-- Supabase SQL Editor에서 실행
-- ============================================================

-- 1. product_embeddings 테이블 생성 (float4[] — vector 직접 캐스팅 가능)
CREATE TABLE IF NOT EXISTS gigacoffee.product_embeddings (
  product_id uuid PRIMARY KEY REFERENCES gigacoffee.products(id) ON DELETE CASCADE,
  embedding   float4[] NOT NULL,
  updated_at  timestamptz DEFAULT now()
);

GRANT SELECT ON gigacoffee.product_embeddings TO anon, authenticated;
GRANT ALL    ON gigacoffee.product_embeddings TO service_role;

-- 2. 기존 vector(768) 데이터 → float4[] 로 이전 (pgvector 내장 캐스팅)
INSERT INTO gigacoffee.product_embeddings (product_id, embedding)
SELECT p.id, p.embedding::float4[]
FROM gigacoffee.products p
WHERE p.embedding IS NOT NULL
ON CONFLICT (product_id) DO UPDATE SET embedding = EXCLUDED.embedding;

-- 3. products 테이블에서 vector 컬럼 제거 (PostgREST 복구)
DROP INDEX IF EXISTS gigacoffee.idx_products_embedding;
ALTER TABLE gigacoffee.products DROP COLUMN IF EXISTS embedding;

-- 4. 스키마 캐시 리로드
SELECT pg_notify('pgrst', 'reload schema');

-- 확인 쿼리
SELECT COUNT(*) AS migrated_count FROM gigacoffee.product_embeddings;
