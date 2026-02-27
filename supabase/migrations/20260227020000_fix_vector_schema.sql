-- =====================================================
-- vector 타입 스키마 참조 수정
-- extensions.vector → vector (search_path로 해소)
-- =====================================================

-- 1. 기존 함수 제거
drop function if exists gigacoffee.search_products_by_embedding(extensions.vector, float, int);

-- 2. 기존 인덱스 제거
drop index if exists gigacoffee.idx_products_embedding;

-- 3. 기존 컬럼 제거 후 재추가 (타입 참조 수정)
alter table gigacoffee.products drop column if exists embedding;
alter table gigacoffee.products add column embedding vector(768);

-- 4. 인덱스 재생성 (스키마 접두사 제거)
create index idx_products_embedding
  on gigacoffee.products
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- 5. 검색 함수 재생성 (스키마 접두사 제거)
create or replace function gigacoffee.search_products_by_embedding(
  query_embedding vector(768),
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

grant execute on function gigacoffee.search_products_by_embedding to anon, authenticated;
