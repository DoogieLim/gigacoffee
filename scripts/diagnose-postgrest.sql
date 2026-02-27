-- ============================================================
-- PostgREST PGRST002 진단 쿼리
-- Supabase SQL Editor에서 실행하세요
-- ============================================================

-- 1. gigacoffee 스키마의 비표준(USER-DEFINED) 컬럼 타입 확인
SELECT table_name, column_name, data_type, udt_schema, udt_name
FROM information_schema.columns
WHERE table_schema = 'gigacoffee'
  AND data_type = 'USER-DEFINED'
ORDER BY table_name, column_name;

-- 2. gigacoffee 스키마의 모든 테이블 컬럼 타입 확인
SELECT table_name, column_name, data_type, udt_schema, udt_name
FROM information_schema.columns
WHERE table_schema = 'gigacoffee'
ORDER BY table_name, column_name;

-- 3. gigacoffee 스키마에 남아 있는 함수 목록 (타입 포함)
SELECT p.proname AS function_name,
       pg_catalog.pg_get_function_arguments(p.oid) AS arguments,
       pg_catalog.pg_get_function_result(p.oid) AS return_type
FROM pg_catalog.pg_proc p
JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'gigacoffee'
ORDER BY p.proname;

-- 4. public 스키마에 남아 있는 search 함수 확인
SELECT p.proname AS function_name,
       pg_catalog.pg_get_function_arguments(p.oid) AS arguments
FROM pg_catalog.pg_proc p
JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname LIKE '%search%'
ORDER BY p.proname;

-- 5. gigacoffee 스키마 권한 확인
SELECT grantee, privilege_type
FROM information_schema.role_usage_grants
WHERE object_schema = 'gigacoffee'
ORDER BY grantee;

-- 6. PostgREST 스키마 캐시 강제 리로드 (마지막에 실행)
SELECT pg_notify('pgrst', 'reload schema');
