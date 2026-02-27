-- =====================================================
-- Claude Code 관리 스키마
-- gigacoffee 앱 데이터와 완전히 분리
-- 목적: AI 에이전트 세션 간 컨텍스트 유지, 팀 협업 규칙 관리
-- =====================================================

create schema if not exists claude_mgmt;

-- =====================================================
-- 1. global_rules: AI 행동 규칙
-- =====================================================
create table if not exists claude_mgmt.global_rules (
  id          uuid primary key default gen_random_uuid(),
  category    text not null,
  rule_key    text not null unique,
  rule_value  text not null,
  description text,
  is_active   boolean not null default true,
  priority    int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

insert into claude_mgmt.global_rules (category, rule_key, rule_value, description, priority) values
  ('language',      'conversation_language',  '한글',                     '사용자와의 모든 대화는 항상 한글로 진행',                              100),
  ('editor',        'vscode_file_open',        'code --new-window',        'VS Code Extension 환경에서 파일은 채팅 출력 대신 새 에디터 창에서 열기', 90),
  ('safety',        'destructive_ops',         'confirm_required',         'git reset --hard, DROP TABLE 등 파괴적 작업 전 사용자 확인 필수',        100),
  ('response_style','after_task_report',       'list_changed_files',       '작업 완료 후 변경된 파일 목록을 간략히 보고',                           70)
on conflict (rule_key) do nothing;

-- =====================================================
-- 2. project_context: 프로젝트 진행 상태
-- =====================================================
create table if not exists claude_mgmt.project_context (
  id           uuid primary key default gen_random_uuid(),
  project_name text not null default 'gigacoffee',
  context_type text not null,
  title        text not null,
  body         text,
  status       text not null default 'active',
  priority     int not null default 0,
  tags         text[] default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  resolved_at  timestamptz,
  created_by   text default 'claude'
);

create index if not exists idx_project_context_type_status  on claude_mgmt.project_context (context_type, status);
create index if not exists idx_project_context_project      on claude_mgmt.project_context (project_name, status);

insert into claude_mgmt.project_context (project_name, context_type, title, body, status, priority, tags) values
  ('gigacoffee', 'resolved_issue', 'Supabase PGRST002 해결',
   'PostgREST Exposed Schemas에 존재하지 않는 eatsy 스키마가 등록되어 있어 캐시 빌드 실패. Management API로 제거하여 해결.',
   'done', 80, ARRAY['supabase', 'postgrest', 'infra']),

  ('gigacoffee', 'resolved_issue', 'vector(768) 컬럼으로 인한 PostgREST 장애 해결',
   'pgvector extension 타입이 PostgREST 직렬화 불가. product_embeddings 테이블로 분리하고 float4[] 사용하도록 마이그레이션.',
   'done', 80, ARRAY['supabase', 'pgvector', 'embeddings']),

  ('gigacoffee', 'resolved_issue', '자연어 상품 검색 구현',
   'Gemini gemini-embedding-001 모델로 768차원 임베딩 생성. product_embeddings 테이블에 22개 상품 임베딩 저장. 코사인 유사도 TypeScript 계산.',
   'done', 70, ARRAY['search', 'gemini', 'embeddings']),

  ('gigacoffee', 'known_issue', 'middleware.ts 삭제됨',
   'git status에서 D로 표시. 인증 미들웨어 없는 상태. src/proxy.ts가 Next.js 16 방식으로 대체 중이나 검토 필요.',
   'active', 60, ARRAY['auth', 'middleware']),

  ('gigacoffee', 'known_issue', 'Redis 클라이언트 mock 구현 상태',
   'src/lib/redis/ 디렉토리가 있으나 실제 Redis 미연결. 세션 관리 기능 미작동.',
   'active', 40, ARRAY['redis', 'session']),

  ('gigacoffee', 'next_todo', 'LLM 기반 복합 검색 구현',
   'Gemini 생성 모델로 쿼리 파싱 → semanticQuery + priceRange + categoryHint 추출. 현재는 regex 정렬 파싱만 있음.',
   'active', 50, ARRAY['search', 'gemini', 'feature']),

  ('gigacoffee', 'next_todo', 'middleware.ts 복구 또는 proxy.ts 완성',
   '삭제된 인증 미들웨어 복구. Next.js 16 proxy 방식으로 관리자 라우트 보호 확인.',
   'active', 60, ARRAY['auth', 'security'])
;

-- =====================================================
-- 3. decisions: 기술 의사결정 기록 (ADR)
-- =====================================================
create table if not exists claude_mgmt.decisions (
  id            uuid primary key default gen_random_uuid(),
  adr_number    int not null unique,
  title         text not null,
  status        text not null default 'accepted',
  context       text not null,
  decision      text not null,
  consequences  text,
  alternatives  jsonb default '[]',
  tags          text[] default '{}',
  superseded_by int,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  decided_by    text default 'claude'
);

insert into claude_mgmt.decisions (adr_number, title, status, context, decision, consequences, alternatives, tags) values
  (1, 'Supabase를 기본 DB 및 Auth 솔루션으로 선택', 'accepted',
   'MVP 빠른 구축 필요. 인증·실시간·스토리지 기능이 모두 필요한 상황.',
   'Repository 패턴으로 추상화하여 교체 가능하게 설계. src/lib/db/index.ts import만 변경하면 DB 교체 가능.',
   '빠른 개발 가능. 향후 GCP PostgreSQL+Prisma 등으로 교체 시 구현체만 추가하면 됨.',
   '[{"name": "Firebase", "reason": "NoSQL이라 관계형 쿼리 불리"}, {"name": "PlanetScale", "reason": "MySQL 기반, pgvector 미지원"}]',
   ARRAY['db', 'auth', 'architecture']),

  (2, 'gigacoffee 스키마로 앱 데이터 격리', 'accepted',
   'Supabase 기본 public 스키마 대신 앱 전용 스키마 분리 필요. claude_mgmt 관리 스키마와도 분리.',
   'gigacoffee: 앱 데이터, claude_mgmt: AI 관리 데이터, public: PostgREST 기본 노출 스키마로 역할 분리.',
   '스키마별 접근 권한 제어 가능. MCP로 claude_mgmt만 노출하여 앱 데이터 보호.',
   '[]', ARRAY['db', 'schema', 'architecture']),

  (3, 'Next.js App Router + Server Actions 채택', 'accepted',
   'API 라우트보다 Server Actions이 타입 안전하고 Next.js 16과 더 잘 통합됨.',
   '데이터 변경은 Server Actions, 조회는 서버 컴포넌트 직접 사용. REST API는 외부 연동용으로만.',
   '클라이언트-서버 경계 명확. REST API는 src/app/api/ 하위에 별도 구현.',
   '[{"name": "tRPC", "reason": "Next.js App Router와 통합 복잡"}]',
   ARRAY['frontend', 'architecture', 'nextjs']),

  (4, 'Gemini 임베딩 기반 자연어 상품 검색', 'accepted',
   '사용자가 "시원한 음료", "달콤한 커피" 같은 자연어로 상품을 검색할 수 있어야 함.',
   'gemini-embedding-001 모델로 768차원 벡터 생성. product_embeddings 테이블(float4[])에 저장. TypeScript 코사인 유사도 계산.',
   'PostgREST vector 타입 직렬화 문제로 pgvector RPC 대신 TypeScript 계산 방식 채택. 22개 상품 임베딩 완료.',
   '[{"name": "OpenAI Embeddings", "reason": "유료 API"}, {"name": "pgvector RPC", "reason": "PostgREST 직렬화 문제"}]',
   ARRAY['search', 'ml', 'gemini', 'pgvector']),

  (5, 'Claude Code 하이브리드 컨텍스트 관리 시스템 도입', 'accepted',
   '세션 간 대화 연속성 유지와 팀 협업 환경 준비 필요.',
   '파일 기반(CLAUDE.md, memory/*.md)은 git으로 공유. DB 기반(claude_mgmt 스키마)은 실시간 상태 관리. MCP로 세션 시작 시 자동 로드.',
   '팀원 온보딩 시 git clone + .env.secret 설정만으로 동일 환경 구성 가능.',
   '[{"name": "파일 전용", "reason": "동시 편집 충돌, 실시간 업데이트 어려움"}, {"name": "DB 전용", "reason": "git 공유 불가, 오프라인 접근 불가"}]',
   ARRAY['claude-code', 'architecture', 'team'])
on conflict (adr_number) do nothing;

-- =====================================================
-- 4. team_rules: 팀 협업 규칙
-- =====================================================
create table if not exists claude_mgmt.team_rules (
  id          uuid primary key default gen_random_uuid(),
  category    text not null,
  rule_key    text not null unique,
  rule_value  text not null,
  description text,
  example     text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

insert into claude_mgmt.team_rules (category, rule_key, rule_value, description, example) values
  ('git_workflow',       'branch_naming',       'feature/{issue-number}-{short-desc}',
   'feature 브랜치 네이밍 규칙',
   'feature/42-add-vector-search'),

  ('git_workflow',       'main_branch_policy',  'PR required, no direct push',
   'main 브랜치 직접 푸시 금지, PR + 리뷰 후 머지', null),

  ('commit_convention',  'commit_format',       'feat|fix|docs|refactor|chore|test: 한글 설명',
   '커밋 메시지 형식. 본문은 한글 사용',
   'feat: 벡터 임베딩 기반 자연어 상품 검색 추가'),

  ('code_review',        'review_checklist',
   'TypeScript 타입 안전성 | 서버/클라이언트 컴포넌트 경계 | Repository 패턴 준수 | 에러 처리',
   'PR 리뷰 체크리스트', null),

  ('naming',             'file_naming',         'kebab-case 파일명, PascalCase 컴포넌트명',
   '파일과 컴포넌트 네이밍 규칙',
   'product-card.tsx 파일 안에 export function ProductCard()'),

  ('testing',            'test_policy',         'Vitest(unit) + Playwright(E2E) - 미구현',
   '테스트 러너 정책. 현재 테스트 미설정 상태', null),

  ('architecture',       'data_access_rule',    'Repository 패턴 경유 필수',
   '페이지/액션에서 Supabase 직접 호출 금지. 반드시 src/lib/db/를 통해 접근',
   'productRepo.findAll() 사용, supabase.from("products") 직접 호출 금지')
on conflict (rule_key) do nothing;

-- =====================================================
-- 5. session_log: 세션 활동 기록
-- =====================================================
create table if not exists claude_mgmt.session_log (
  id             uuid primary key default gen_random_uuid(),
  session_id     text not null,
  project_name   text not null default 'gigacoffee',
  action_type    text not null,
  summary        text not null,
  details        jsonb,
  files_touched  text[] default '{}',
  created_at     timestamptz not null default now()
);

create index if not exists idx_session_log_session  on claude_mgmt.session_log (session_id, created_at desc);
create index if not exists idx_session_log_project  on claude_mgmt.session_log (project_name, created_at desc);

-- =====================================================
-- 6. updated_at 자동 갱신 트리거
-- =====================================================
create or replace function claude_mgmt.update_updated_at()
returns trigger language plpgsql set search_path = claude_mgmt as $$
begin new.updated_at = now(); return new; end; $$;

create or replace trigger trg_global_rules_updated_at
  before update on claude_mgmt.global_rules
  for each row execute function claude_mgmt.update_updated_at();

create or replace trigger trg_project_context_updated_at
  before update on claude_mgmt.project_context
  for each row execute function claude_mgmt.update_updated_at();

create or replace trigger trg_decisions_updated_at
  before update on claude_mgmt.decisions
  for each row execute function claude_mgmt.update_updated_at();

create or replace trigger trg_team_rules_updated_at
  before update on claude_mgmt.team_rules
  for each row execute function claude_mgmt.update_updated_at();

-- =====================================================
-- 7. RPC: 세션 시작 시 전체 컨텍스트 한 번에 조회
-- =====================================================
create or replace function claude_mgmt.load_session_context(
  p_project_name text default 'gigacoffee'
)
returns jsonb language sql stable set search_path = claude_mgmt as $$
  select jsonb_build_object(
    'loaded_at',        now(),
    'project',          p_project_name,
    'global_rules',     (
      select jsonb_agg(jsonb_build_object('category', category, 'key', rule_key, 'value', rule_value) order by priority desc)
      from claude_mgmt.global_rules where is_active = true
    ),
    'current_tasks',    (
      select jsonb_agg(jsonb_build_object('title', title, 'body', body, 'tags', tags) order by priority desc)
      from claude_mgmt.project_context
      where project_name = p_project_name and context_type = 'current_task' and status = 'active'
    ),
    'next_todos',       (
      select jsonb_agg(jsonb_build_object('title', title, 'body', body, 'priority', priority) order by priority desc)
      from claude_mgmt.project_context
      where project_name = p_project_name and context_type = 'next_todo' and status = 'active'
    ),
    'known_issues',     (
      select jsonb_agg(jsonb_build_object('title', title, 'body', body, 'tags', tags))
      from claude_mgmt.project_context
      where project_name = p_project_name and context_type = 'known_issue' and status in ('active', 'blocked')
    ),
    'recent_decisions', (
      select jsonb_agg(jsonb_build_object(
        'adr', 'ADR-' || lpad(adr_number::text, 3, '0'),
        'title', title, 'status', status, 'decision', decision, 'tags', tags
      ) order by adr_number desc)
      from claude_mgmt.decisions where status = 'accepted'
    ),
    'team_rules',       (
      select jsonb_agg(jsonb_build_object('category', category, 'key', rule_key, 'value', rule_value, 'example', example))
      from claude_mgmt.team_rules where is_active = true
    )
  );
$$;

-- =====================================================
-- 8. 권한 설정
-- =====================================================
grant usage on schema claude_mgmt to anon, authenticated, service_role;
grant select on all tables in schema claude_mgmt to anon, authenticated;
grant all    on all tables in schema claude_mgmt to service_role;
grant execute on function claude_mgmt.load_session_context(text) to anon, authenticated, service_role;
