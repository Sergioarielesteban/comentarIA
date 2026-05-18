-- ComentarIA — Seguridad SaaS (Fase 1)
-- 1 cuenta = 1 restaurante, límites diarios server-side, caché de análisis.
-- Ejecutar en el SQL Editor de Supabase (idempotente).

-- ============================================================
-- 1) user_restaurants  (1 restaurante por usuario, bloqueado)
-- ============================================================
create table if not exists public.user_restaurants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  place_id text not null,
  name text not null,
  address text,
  rating numeric(3,1),
  total_reviews integer,
  locked_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create index if not exists user_restaurants_user_id_idx
  on public.user_restaurants (user_id);

alter table public.user_restaurants enable row level security;

drop policy if exists "user_restaurants_select_own" on public.user_restaurants;
create policy "user_restaurants_select_own"
  on public.user_restaurants for select
  using (auth.uid() = user_id);

drop policy if exists "user_restaurants_insert_own_once" on public.user_restaurants;
create policy "user_restaurants_insert_own_once"
  on public.user_restaurants for insert
  with check (
    auth.uid() = user_id
    and not exists (
      select 1 from public.user_restaurants ur where ur.user_id = auth.uid()
    )
  );

-- Solo se permite actualizar rating / total_reviews (refresco de reseñas).
-- place_id y name quedan inmutables vía trigger.
drop policy if exists "user_restaurants_update_own" on public.user_restaurants;
create policy "user_restaurants_update_own"
  on public.user_restaurants for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.user_restaurants_freeze_identity()
returns trigger
language plpgsql
as $$
begin
  if NEW.user_id is distinct from OLD.user_id then
    raise exception 'user_id es inmutable';
  end if;
  if NEW.place_id is distinct from OLD.place_id then
    raise exception 'No puedes cambiar de restaurante. Contacta con soporte.';
  end if;
  if NEW.locked_at is distinct from OLD.locked_at then
    NEW.locked_at := OLD.locked_at;
  end if;
  NEW.updated_at := now();
  return NEW;
end;
$$;

drop trigger if exists user_restaurants_freeze on public.user_restaurants;
create trigger user_restaurants_freeze
  before update on public.user_restaurants
  for each row
  execute function public.user_restaurants_freeze_identity();

-- DELETE no permitido al usuario final (sin policy = denegado por RLS).

-- ============================================================
-- 2) user_restaurant_reviews  (reseñas crudas del restaurante)
-- ============================================================
create table if not exists public.user_restaurant_reviews (
  id uuid primary key default gen_random_uuid(),
  user_restaurant_id uuid not null references public.user_restaurants(id) on delete cascade unique,
  data jsonb not null,
  fetched_at timestamptz not null default now()
);

alter table public.user_restaurant_reviews enable row level security;

drop policy if exists "user_restaurant_reviews_owner" on public.user_restaurant_reviews;
create policy "user_restaurant_reviews_owner"
  on public.user_restaurant_reviews for all
  using (
    exists (
      select 1 from public.user_restaurants ur
      where ur.id = user_restaurant_reviews.user_restaurant_id
        and ur.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.user_restaurants ur
      where ur.id = user_restaurant_reviews.user_restaurant_id
        and ur.user_id = auth.uid()
    )
  );

-- ============================================================
-- 3) usage_daily  (límites diarios server-side)
-- ============================================================
create table if not exists public.usage_daily (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_date date not null default current_date,
  chat_requests integer not null default 0,
  analysis_runs integer not null default 0,
  reviews_refreshes integer not null default 0,
  place_searches integer not null default 0,
  llm_tokens_estimate integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, usage_date)
);

create index if not exists usage_daily_user_date_idx
  on public.usage_daily (user_id, usage_date desc);

alter table public.usage_daily enable row level security;

drop policy if exists "usage_daily_select_own" on public.usage_daily;
create policy "usage_daily_select_own"
  on public.usage_daily for select
  using (auth.uid() = user_id);

-- INSERT / UPDATE solo vía RPC SECURITY DEFINER (sin policies directas).

-- RPC para incrementar contadores de forma atómica y segura.
create or replace function public.increment_usage(
  p_type text,
  p_tokens integer default 0
)
returns public.usage_daily
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_row public.usage_daily;
begin
  if v_user_id is null then
    raise exception 'No autorizado' using errcode = '42501';
  end if;
  if p_type not in ('chat','analysis','reviews_refresh','place_search') then
    raise exception 'Tipo de uso inválido';
  end if;

  insert into public.usage_daily (user_id, usage_date)
  values (v_user_id, current_date)
  on conflict (user_id, usage_date) do nothing;

  if p_type = 'chat' then
    update public.usage_daily
      set chat_requests = chat_requests + 1,
          llm_tokens_estimate = llm_tokens_estimate + greatest(p_tokens, 0),
          updated_at = now()
      where user_id = v_user_id and usage_date = current_date
      returning * into v_row;
  elsif p_type = 'analysis' then
    update public.usage_daily
      set analysis_runs = analysis_runs + 1,
          llm_tokens_estimate = llm_tokens_estimate + greatest(p_tokens, 0),
          updated_at = now()
      where user_id = v_user_id and usage_date = current_date
      returning * into v_row;
  elsif p_type = 'reviews_refresh' then
    update public.usage_daily
      set reviews_refreshes = reviews_refreshes + 1,
          updated_at = now()
      where user_id = v_user_id and usage_date = current_date
      returning * into v_row;
  elsif p_type = 'place_search' then
    update public.usage_daily
      set place_searches = place_searches + 1,
          updated_at = now()
      where user_id = v_user_id and usage_date = current_date
      returning * into v_row;
  end if;

  return v_row;
end;
$$;

revoke all on function public.increment_usage(text, integer) from public;
grant execute on function public.increment_usage(text, integer) to authenticated;

-- ============================================================
-- 4) restaurant_analysis_cache  (cache de análisis por hash de reseñas)
-- ============================================================
create table if not exists public.restaurant_analysis_cache (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  place_id text not null,
  reviews_hash text not null,
  analysis_json jsonb not null,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, place_id, reviews_hash)
);

create index if not exists rac_user_place_idx
  on public.restaurant_analysis_cache (user_id, place_id, generated_at desc);

alter table public.restaurant_analysis_cache enable row level security;

drop policy if exists "rac_select_own" on public.restaurant_analysis_cache;
create policy "rac_select_own"
  on public.restaurant_analysis_cache for select
  using (auth.uid() = user_id);

drop policy if exists "rac_insert_own" on public.restaurant_analysis_cache;
create policy "rac_insert_own"
  on public.restaurant_analysis_cache for insert
  with check (auth.uid() = user_id);
