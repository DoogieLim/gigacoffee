-- ============================================================
-- PostgREST PGRST002 복구 스크립트
-- gigacoffee 스키마의 vector 타입 함수가 스키마 캐시를 막고 있음
-- Supabase SQL Editor에서 전체 실행
-- ============================================================

-- 1. gigacoffee 스키마의 모든 search 함수 제거 (파라미터 타입 무관)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT oid::regprocedure::text AS sig
    FROM pg_proc
    WHERE pronamespace = 'gigacoffee'::regnamespace
      AND proname = 'search_products_by_embedding'
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || r.sig || ' CASCADE';
  END LOOP;
END;
$$;

-- 2. public 스키마의 모든 search 함수 제거 (이전 버전 정리)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT oid::regprocedure::text AS sig
    FROM pg_proc
    WHERE pronamespace = 'public'::regnamespace
      AND proname = 'search_products_by_embedding'
  LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || r.sig || ' CASCADE';
  END LOOP;
END;
$$;

-- 3. public 스키마에 float8[] 파라미터로 재생성
CREATE FUNCTION public.search_products_by_embedding(
  query_embedding float8[],
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
         1 - (p.embedding <=> query_embedding::vector) AS similarity
  FROM gigacoffee.products p
  WHERE p.is_available = true
    AND p.embedding IS NOT NULL
    AND 1 - (p.embedding <=> query_embedding::vector) > match_threshold
  ORDER BY p.embedding <=> query_embedding::vector
  LIMIT match_count;
$$;

GRANT EXECUTE ON FUNCTION public.search_products_by_embedding TO anon, authenticated;

-- 4. 스키마 캐시 리로드 트리거
SELECT pg_notify('pgrst', 'reload schema');
