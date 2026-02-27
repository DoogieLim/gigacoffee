-- public 스키마에 벡터 검색 함수 생성 (PostgREST 기본 노출 스키마)
-- vector(768) 대신 float8[] 로 받아 내부에서 캐스팅 → PostgREST 직렬화 호환
-- Supabase SQL Editor에서 실행하세요

-- 기존 함수 제거 (시그니처 변경이므로 DROP 필요)
DROP FUNCTION IF EXISTS public.search_products_by_embedding(vector, float, int);

CREATE OR REPLACE FUNCTION public.search_products_by_embedding(
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
