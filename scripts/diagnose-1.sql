-- gigacoffee 스키마의 비표준 타입 컬럼 + 커스텀 타입/도메인 확인
SELECT 'column' AS kind, table_name AS name, column_name AS detail, udt_schema, udt_name
FROM information_schema.columns
WHERE table_schema = 'gigacoffee'
  AND data_type = 'USER-DEFINED'

UNION ALL

-- gigacoffee 스키마에 정의된 커스텀 타입
SELECT 'type' AS kind, typname AS name, typtype::text AS detail, nspname AS udt_schema, typname AS udt_name
FROM pg_type t
JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'gigacoffee'
  AND t.typtype NOT IN ('b', 'p')  -- base, pseudo 제외

ORDER BY kind, name;
