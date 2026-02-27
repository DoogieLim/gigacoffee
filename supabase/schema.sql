-- =====================================================
-- GigaCoffee - 카페 서비스 - Supabase DB 스키마
-- schema: gigacoffee
-- =====================================================

-- =====================================================
-- 스키마 생성 및 search_path 설정
-- =====================================================
create schema if not exists gigacoffee;
set search_path to gigacoffee, auth, public;

-- =====================================================
-- 확장 기능 (pgcrypto는 public 스키마에 설치)
-- uuid는 PostgreSQL 13+ 내장 gen_random_uuid() 사용
-- =====================================================
create extension if not exists "pgcrypto" schema public;

-- =====================================================
-- 공통: updated_at 자동 갱신 함수
-- =====================================================
create or replace function gigacoffee.update_updated_at()
returns trigger
language plpgsql
set search_path = gigacoffee, auth, public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================
-- 역할/권한
-- =====================================================
create table if not exists gigacoffee.roles (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique  -- 'admin' | 'staff' | 'member'
);

create table if not exists gigacoffee.permissions (
  id       uuid primary key default gen_random_uuid(),
  action   text not null,
  resource text not null,
  unique(action, resource)
);

create table if not exists gigacoffee.role_permissions (
  role_id       uuid references gigacoffee.roles(id) on delete cascade,
  permission_id uuid references gigacoffee.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

-- 기본 역할 삽입
insert into gigacoffee.roles (name) values ('admin'), ('staff'), ('member')
  on conflict (name) do nothing;

-- =====================================================
-- 프로필
-- =====================================================
create table if not exists gigacoffee.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  name       text not null default '',
  phone      text,
  avatar_url text,
  fcm_token  text,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on gigacoffee.profiles
  for each row execute function gigacoffee.update_updated_at();

-- 회원가입 시 profiles 자동 생성
create or replace function gigacoffee.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = gigacoffee, auth, public
as $$
begin
  insert into gigacoffee.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  -- 기본 'member' 역할 부여
  insert into gigacoffee.user_roles (user_id, role_id)
  select new.id, r.id from gigacoffee.roles r where r.name = 'member';
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function gigacoffee.handle_new_user();

-- =====================================================
-- 사용자 역할
-- =====================================================
create table if not exists gigacoffee.user_roles (
  user_id    uuid references gigacoffee.profiles(id) on delete cascade,
  role_id    uuid references gigacoffee.roles(id) on delete cascade,
  granted_by uuid references gigacoffee.profiles(id),
  granted_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

-- =====================================================
-- 상품 카테고리 & 상품
-- =====================================================
create table if not exists gigacoffee.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  sort_order int  not null default 0,
  is_active  boolean not null default true
);

create table if not exists gigacoffee.products (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid references gigacoffee.categories(id) on delete set null,
  name         text not null,
  price        int  not null,
  image_url    text,
  description  text,
  is_available boolean not null default true,
  options      jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger trg_products_updated_at
  before update on gigacoffee.products
  for each row execute function gigacoffee.update_updated_at();

-- =====================================================
-- 재고
-- =====================================================
create table if not exists gigacoffee.inventory (
  product_id          uuid primary key references gigacoffee.products(id) on delete cascade,
  quantity            int  not null default 0,
  low_stock_threshold int  not null default 5,
  updated_at          timestamptz not null default now()
);

create trigger trg_inventory_updated_at
  before update on gigacoffee.inventory
  for each row execute function gigacoffee.update_updated_at();

create type gigacoffee.stock_history_type as enum ('in', 'out', 'adjust', 'cancel');

create table if not exists gigacoffee.stock_histories (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid references gigacoffee.products(id) on delete cascade,
  change_qty    int  not null,
  reason        text,
  type          gigacoffee.stock_history_type not null,
  ref_order_id  uuid,
  created_by    uuid references gigacoffee.profiles(id),
  created_at    timestamptz not null default now()
);

-- =====================================================
-- 주문
-- =====================================================
create type gigacoffee.order_status as enum (
  'pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled'
);

create table if not exists gigacoffee.orders (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references gigacoffee.profiles(id) on delete set null,
  status       gigacoffee.order_status not null default 'pending',
  total_amount int  not null,
  memo         text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger trg_orders_updated_at
  before update on gigacoffee.orders
  for each row execute function gigacoffee.update_updated_at();

create table if not exists gigacoffee.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid references gigacoffee.orders(id) on delete cascade,
  product_id   uuid references gigacoffee.products(id) on delete set null,
  product_name text not null,
  quantity     int  not null,
  options      jsonb,
  line_total   int  not null
);

-- =====================================================
-- 재고 자동 차감 트리거
-- =====================================================
create or replace function gigacoffee.handle_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = gigacoffee, auth, public
as $$
declare
  item record;
begin
  if new.status = 'paid' and old.status != 'paid' then
    for item in
      select product_id, quantity from gigacoffee.order_items where order_id = new.id
    loop
      update gigacoffee.inventory
      set quantity = quantity - item.quantity
      where product_id = item.product_id;

      insert into gigacoffee.stock_histories (product_id, change_qty, reason, type, ref_order_id)
      values (item.product_id, -item.quantity, '주문 결제', 'out', new.id);
    end loop;

  elsif new.status = 'cancelled' and old.status in ('paid', 'preparing', 'ready') then
    for item in
      select product_id, quantity from gigacoffee.order_items where order_id = new.id
    loop
      update gigacoffee.inventory
      set quantity = quantity + item.quantity
      where product_id = item.product_id;

      insert into gigacoffee.stock_histories (product_id, change_qty, reason, type, ref_order_id)
      values (item.product_id, item.quantity, '주문 취소 환원', 'cancel', new.id);
    end loop;
  end if;

  return new;
end;
$$;

create trigger trg_order_inventory
  after update of status on gigacoffee.orders
  for each row execute function gigacoffee.handle_order_status_change();

-- =====================================================
-- 결제
-- =====================================================
create type gigacoffee.payment_status as enum (
  'paid', 'cancelled', 'failed', 'partial_cancelled'
);

create table if not exists gigacoffee.payments (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid references gigacoffee.orders(id) on delete cascade,
  portone_payment_id  text not null,
  merchant_uid        text,
  method              text,
  status              gigacoffee.payment_status not null default 'paid',
  amount              int  not null,
  raw_response        jsonb,
  created_at          timestamptz not null default now()
);

-- =====================================================
-- 게시판
-- =====================================================
create type gigacoffee.post_category as enum ('일반', '공지', '이벤트', '문의');

create table if not exists gigacoffee.posts (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid references gigacoffee.profiles(id) on delete set null,
  category    gigacoffee.post_category not null default '일반',
  title       text not null,
  content     text not null,
  is_pinned   boolean not null default false,
  is_hidden   boolean not null default false,
  view_count  int  not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_posts_updated_at
  before update on gigacoffee.posts
  for each row execute function gigacoffee.update_updated_at();

create table if not exists gigacoffee.comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid references gigacoffee.posts(id) on delete cascade,
  author_id  uuid references gigacoffee.profiles(id) on delete set null,
  content    text not null,
  is_hidden  boolean not null default false,
  created_at timestamptz not null default now()
);

-- =====================================================
-- 알림 로그
-- =====================================================
create type gigacoffee.notification_type as enum ('kakao', 'push', 'sms');
create type gigacoffee.notification_status as enum ('success', 'failed');

create table if not exists gigacoffee.notification_logs (
  id           uuid primary key default gen_random_uuid(),
  type         gigacoffee.notification_type not null,
  recipient_id uuid references gigacoffee.profiles(id) on delete set null,
  event_type   text not null,
  payload      jsonb,
  status       gigacoffee.notification_status not null,
  sent_at      timestamptz,
  created_at   timestamptz not null default now()
);

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================

alter table gigacoffee.profiles          enable row level security;
alter table gigacoffee.user_roles        enable row level security;
alter table gigacoffee.categories        enable row level security;
alter table gigacoffee.products          enable row level security;
alter table gigacoffee.inventory         enable row level security;
alter table gigacoffee.stock_histories   enable row level security;
alter table gigacoffee.orders            enable row level security;
alter table gigacoffee.order_items       enable row level security;
alter table gigacoffee.payments          enable row level security;
alter table gigacoffee.posts             enable row level security;
alter table gigacoffee.comments          enable row level security;
alter table gigacoffee.notification_logs enable row level security;

-- 헬퍼: 현재 사용자의 역할 확인
create or replace function gigacoffee.get_my_role()
returns text
language sql
security definer
set search_path = gigacoffee, auth, public
stable
as $$
  select r.name from gigacoffee.user_roles ur
  join gigacoffee.roles r on r.id = ur.role_id
  where ur.user_id = auth.uid()
  order by
    case r.name when 'admin' then 1 when 'staff' then 2 else 3 end
  limit 1;
$$;

-- profiles
create policy "본인 프로필 조회" on gigacoffee.profiles
  for select using (id = auth.uid() or gigacoffee.get_my_role() in ('admin', 'staff'));
create policy "본인 프로필 수정" on gigacoffee.profiles
  for update using (id = auth.uid());
create policy "어드민 모든 프로필 관리" on gigacoffee.profiles
  for all using (gigacoffee.get_my_role() = 'admin');

-- categories
create policy "카테고리 조회" on gigacoffee.categories for select using (true);
create policy "카테고리 관리" on gigacoffee.categories for all using (gigacoffee.get_my_role() = 'admin');

-- products
create policy "상품 조회" on gigacoffee.products for select using (true);
create policy "상품 관리" on gigacoffee.products for all
  using (gigacoffee.get_my_role() in ('admin', 'staff'));

-- inventory
create policy "재고 조회" on gigacoffee.inventory for select
  using (gigacoffee.get_my_role() in ('admin', 'staff'));
create policy "재고 관리" on gigacoffee.inventory for all
  using (gigacoffee.get_my_role() in ('admin', 'staff'));

-- stock_histories
create policy "재고이력 조회" on gigacoffee.stock_histories for select
  using (gigacoffee.get_my_role() in ('admin', 'staff'));
create policy "재고이력 관리" on gigacoffee.stock_histories for all
  using (gigacoffee.get_my_role() in ('admin', 'staff'));

-- orders
create policy "본인 주문 조회" on gigacoffee.orders
  for select using (user_id = auth.uid() or gigacoffee.get_my_role() in ('admin', 'staff'));
create policy "주문 생성" on gigacoffee.orders
  for insert with check (user_id = auth.uid());
create policy "주문 상태 관리" on gigacoffee.orders
  for update using (gigacoffee.get_my_role() in ('admin', 'staff'));

-- order_items
create policy "주문항목 조회" on gigacoffee.order_items
  for select using (
    exists (
      select 1 from gigacoffee.orders
      where gigacoffee.orders.id = order_items.order_id
        and (gigacoffee.orders.user_id = auth.uid() or gigacoffee.get_my_role() in ('admin', 'staff'))
    )
  );
create policy "주문항목 생성" on gigacoffee.order_items
  for insert with check (
    exists (
      select 1 from gigacoffee.orders
      where gigacoffee.orders.id = order_items.order_id and gigacoffee.orders.user_id = auth.uid()
    )
  );

-- payments
create policy "본인 결제 조회" on gigacoffee.payments
  for select using (
    exists (
      select 1 from gigacoffee.orders
      where gigacoffee.orders.id = payments.order_id
        and (gigacoffee.orders.user_id = auth.uid() or gigacoffee.get_my_role() in ('admin', 'staff'))
    )
  );
create policy "결제 관리" on gigacoffee.payments
  for all using (gigacoffee.get_my_role() in ('admin', 'staff'));

-- posts
create policy "게시글 조회" on gigacoffee.posts
  for select using (not is_hidden or gigacoffee.get_my_role() in ('admin', 'staff'));
create policy "게시글 작성" on gigacoffee.posts
  for insert with check (author_id = auth.uid());
create policy "게시글 수정" on gigacoffee.posts
  for update using (author_id = auth.uid() or gigacoffee.get_my_role() in ('admin', 'staff'));
create policy "게시글 삭제" on gigacoffee.posts
  for delete using (author_id = auth.uid() or gigacoffee.get_my_role() in ('admin', 'staff'));

-- comments
create policy "댓글 조회" on gigacoffee.comments
  for select using (not is_hidden or gigacoffee.get_my_role() in ('admin', 'staff'));
create policy "댓글 작성" on gigacoffee.comments
  for insert with check (author_id = auth.uid());
create policy "댓글 수정/삭제" on gigacoffee.comments
  for all using (author_id = auth.uid() or gigacoffee.get_my_role() in ('admin', 'staff'));

-- notification_logs
create policy "알림로그 조회" on gigacoffee.notification_logs
  for select using (gigacoffee.get_my_role() = 'admin');
create policy "알림로그 생성" on gigacoffee.notification_logs
  for insert with check (true);

-- =====================================================
-- 인덱스
-- =====================================================
create index if not exists idx_orders_user_id    on gigacoffee.orders(user_id);
create index if not exists idx_orders_status     on gigacoffee.orders(status);
create index if not exists idx_orders_created_at on gigacoffee.orders(created_at desc);
create index if not exists idx_order_items_order on gigacoffee.order_items(order_id);
create index if not exists idx_stock_histories_product on gigacoffee.stock_histories(product_id);
create index if not exists idx_notification_logs_recipient on gigacoffee.notification_logs(recipient_id);
create index if not exists idx_posts_created_at  on gigacoffee.posts(created_at desc);
create index if not exists idx_products_category on gigacoffee.products(category_id);
