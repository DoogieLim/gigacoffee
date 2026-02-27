-- =====================================================
-- GigaCoffee - 벡터 검색 기능 추가
-- Gemini text-embedding-004 모델 사용 (768차원)
-- 자연어로 상품 검색 가능 (예: "시원한 음료", "달콤한 케이크")
-- =====================================================

-- pgvector 확장 활성화 (Supabase에서는 extensions 스키마에 설치)
create extension if not exists vector schema extensions;

-- =====================================================
-- products 테이블에 embedding 컬럼 추가
-- =====================================================
alter table gigacoffee.products
  add column if not exists embedding extensions.vector(768);

-- HNSW 인덱스: 코사인 유사도 기반 빠른 근사 최근접 탐색
-- ef_construction=64, m=16 은 정확도/성능 균형 기본값
create index if not exists idx_products_embedding
  on gigacoffee.products
  using hnsw (embedding extensions.vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- =====================================================
-- 자연어 유사도 검색 RPC 함수
-- 사용: supabase.rpc('search_products_by_embedding', { ... })
-- =====================================================
create or replace function gigacoffee.search_products_by_embedding(
  query_embedding extensions.vector(768),
  match_threshold  float default 0.5,
  match_count      int   default 10
)
returns table (
  id           uuid,
  category_id  uuid,
  name         text,
  price        int,
  image_url    text,
  description  text,
  is_available boolean,
  options      jsonb,
  created_at   timestamptz,
  similarity   float
)
language sql stable
set search_path = gigacoffee, extensions, public
as $$
  select
    p.id,
    p.category_id,
    p.name,
    p.price,
    p.image_url,
    p.description,
    p.is_available,
    p.options,
    p.created_at,
    1 - (p.embedding <=> query_embedding) as similarity
  from gigacoffee.products p
  where
    p.is_available = true
    and p.embedding is not null
    and 1 - (p.embedding <=> query_embedding) > match_threshold
  order by p.embedding <=> query_embedding
  limit match_count;
$$;

-- RPC 함수 공개 권한 (anon, authenticated 모두 검색 가능)
grant execute on function gigacoffee.search_products_by_embedding to anon, authenticated;
