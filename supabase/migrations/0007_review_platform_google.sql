-- ComentarIA — Plataforma multiproveedor de reseñas + Google Business Profile
-- Ejecutar en Supabase SQL Editor (idempotente).

-- ============================================================
-- review_accounts (OAuth por plataforma, 1 cuenta Google por usuario)
-- ============================================================
create table if not exists public.review_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null default 'google',
  account_email text,
  google_account_name text,
  access_token_encrypted text,
  refresh_token_encrypted text,
  expires_at timestamptz,
  scopes text[],
  connected_at timestamptz not null default now(),
  revoked_at timestamptz,
  needs_reconnect boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, platform)
);

create index if not exists review_accounts_user_idx
  on public.review_accounts (user_id);

alter table public.review_accounts enable row level security;

drop policy if exists "review_accounts_select_own" on public.review_accounts;
create policy "review_accounts_select_own"
  on public.review_accounts for select
  using (auth.uid() = user_id);

drop policy if exists "review_accounts_insert_own" on public.review_accounts;
create policy "review_accounts_insert_own"
  on public.review_accounts for insert
  with check (auth.uid() = user_id);

drop policy if exists "review_accounts_update_own" on public.review_accounts;
create policy "review_accounts_update_own"
  on public.review_accounts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Tokens: escritura vía service role en servidor (RLS no expone a otros usuarios).

-- ============================================================
-- review_locations (1 local vinculado por usuario)
-- ============================================================
create table if not exists public.review_locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  review_account_id uuid references public.review_accounts(id) on delete set null,
  platform text not null default 'google',
  platform_location_id text not null,
  google_account_name text,
  name text not null,
  address text,
  rating numeric(3,1),
  reviews_count integer,
  cover_image_url text,
  connected boolean not null default true,
  locked_at timestamptz not null default now(),
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, platform, platform_location_id)
);

create unique index if not exists review_locations_one_per_user_idx
  on public.review_locations (user_id)
  where connected = true;

create index if not exists review_locations_user_idx
  on public.review_locations (user_id);

alter table public.review_locations enable row level security;

drop policy if exists "review_locations_select_own" on public.review_locations;
create policy "review_locations_select_own"
  on public.review_locations for select
  using (auth.uid() = user_id);

drop policy if exists "review_locations_insert_own" on public.review_locations;
create policy "review_locations_insert_own"
  on public.review_locations for insert
  with check (
    auth.uid() = user_id
    and not exists (
      select 1 from public.review_locations rl
      where rl.user_id = auth.uid() and rl.connected = true
    )
  );

drop policy if exists "review_locations_update_own" on public.review_locations;
create policy "review_locations_update_own"
  on public.review_locations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.review_locations_freeze_identity()
returns trigger
language plpgsql
as $$
begin
  if NEW.user_id is distinct from OLD.user_id then
    raise exception 'user_id es inmutable';
  end if;
  if NEW.platform_location_id is distinct from OLD.platform_location_id then
    raise exception 'No puedes cambiar de restaurante. Contacta con soporte.';
  end if;
  if NEW.platform is distinct from OLD.platform then
    raise exception 'platform es inmutable';
  end if;
  if NEW.locked_at is distinct from OLD.locked_at then
    NEW.locked_at := OLD.locked_at;
  end if;
  NEW.updated_at := now();
  return NEW;
end;
$$;

drop trigger if exists review_locations_freeze on public.review_locations;
create trigger review_locations_freeze
  before update on public.review_locations
  for each row
  execute function public.review_locations_freeze_identity();

-- ============================================================
-- reviews
-- ============================================================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  location_id uuid not null references public.review_locations(id) on delete cascade,
  platform text not null default 'google',
  platform_review_id text not null,
  author_name text,
  rating integer,
  text text,
  review_date timestamptz,
  update_date timestamptz,
  reply_text text,
  reply_updated_at timestamptz,
  replied boolean not null default false,
  sentiment text,
  risk_score numeric(4,2),
  themes jsonb,
  raw_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (location_id, platform_review_id)
);

create index if not exists reviews_location_idx
  on public.reviews (location_id, review_date desc nulls last);

create index if not exists reviews_user_replied_idx
  on public.reviews (user_id, replied, review_date desc);

alter table public.reviews enable row level security;

drop policy if exists "reviews_select_own" on public.reviews;
create policy "reviews_select_own"
  on public.reviews for select
  using (auth.uid() = user_id);

drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own"
  on public.reviews for insert
  with check (auth.uid() = user_id);

drop policy if exists "reviews_update_own" on public.reviews;
create policy "reviews_update_own"
  on public.reviews for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- review_reply_drafts
-- ============================================================
create table if not exists public.review_reply_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  review_id uuid not null references public.reviews(id) on delete cascade,
  suggested_reply text not null,
  edited_reply text,
  status text not null default 'draft'
    check (status in ('draft', 'approved', 'published', 'failed')),
  tone_profile_used jsonb,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  published_at timestamptz,
  error_message text
);

create index if not exists review_reply_drafts_review_idx
  on public.review_reply_drafts (review_id, created_at desc);

alter table public.review_reply_drafts enable row level security;

drop policy if exists "review_reply_drafts_select_own" on public.review_reply_drafts;
create policy "review_reply_drafts_select_own"
  on public.review_reply_drafts for select
  using (auth.uid() = user_id);

drop policy if exists "review_reply_drafts_insert_own" on public.review_reply_drafts;
create policy "review_reply_drafts_insert_own"
  on public.review_reply_drafts for insert
  with check (auth.uid() = user_id);

drop policy if exists "review_reply_drafts_update_own" on public.review_reply_drafts;
create policy "review_reply_drafts_update_own"
  on public.review_reply_drafts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- brand_voice_profiles
-- ============================================================
create table if not exists public.brand_voice_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  location_id uuid not null references public.review_locations(id) on delete cascade,
  tone text,
  formality text,
  emoji_usage text,
  response_length text,
  forbidden_phrases text[],
  preferred_phrases text[],
  signature text,
  profile_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (location_id)
);

alter table public.brand_voice_profiles enable row level security;

drop policy if exists "brand_voice_profiles_select_own" on public.brand_voice_profiles;
create policy "brand_voice_profiles_select_own"
  on public.brand_voice_profiles for select
  using (auth.uid() = user_id);

drop policy if exists "brand_voice_profiles_insert_own" on public.brand_voice_profiles;
create policy "brand_voice_profiles_insert_own"
  on public.brand_voice_profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "brand_voice_profiles_update_own" on public.brand_voice_profiles;
create policy "brand_voice_profiles_update_own"
  on public.brand_voice_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- oauth_states (state CSRF para OAuth, server-side)
-- ============================================================
create table if not exists public.oauth_states (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  state_token text not null unique,
  platform text not null default 'google',
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists oauth_states_expires_idx
  on public.oauth_states (expires_at);

alter table public.oauth_states enable row level security;
-- Sin policies: solo service role / security definer.

-- ============================================================
-- usage_daily — nuevos contadores
-- ============================================================
alter table public.usage_daily
  add column if not exists reply_suggestions integer not null default 0;

alter table public.usage_daily
  add column if not exists review_syncs integer not null default 0;

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
  if p_type not in (
    'chat','analysis','reviews_refresh','place_search',
    'reply_suggest','review_sync'
  ) then
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
  elsif p_type = 'reply_suggest' then
    update public.usage_daily
      set reply_suggestions = reply_suggestions + 1,
          llm_tokens_estimate = llm_tokens_estimate + greatest(p_tokens, 0),
          updated_at = now()
      where user_id = v_user_id and usage_date = current_date
      returning * into v_row;
  elsif p_type = 'review_sync' then
    update public.usage_daily
      set review_syncs = review_syncs + 1,
          updated_at = now()
      where user_id = v_user_id and usage_date = current_date
      returning * into v_row;
  end if;

  return v_row;
end;
$$;
