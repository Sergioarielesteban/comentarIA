-- ComentarIA / Espejo Ciego — esquema base + extensiones SaaS
-- Ejecutar en el SQL Editor de Supabase

create table if not exists restaurantes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  place_id text,
  nombre text not null,
  direccion text,
  rating numeric(3,1),
  total_resenas integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists resenas_cache (
  id uuid default gen_random_uuid() primary key,
  restaurante_id uuid references restaurantes(id) on delete cascade not null unique,
  data jsonb not null,
  fetched_at timestamptz default now()
);

create table if not exists analisis (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  restaurante_id uuid references restaurantes(id) on delete cascade not null,
  data jsonb not null,
  reviews_hash text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists analisis_restaurante_unique on analisis (restaurante_id);

create table if not exists chat_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  restaurante_id uuid references restaurantes(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

create index if not exists chat_messages_user_restaurant_idx
  on chat_messages (user_id, restaurante_id, created_at desc);

alter table restaurantes enable row level security;
alter table resenas_cache enable row level security;
alter table analisis enable row level security;
alter table chat_messages enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'own_restaurantes' and tablename = 'restaurantes') then
    create policy "own_restaurantes" on restaurantes for all using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own_analisis' and tablename = 'analisis') then
    create policy "own_analisis" on analisis for all using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own_resenas' and tablename = 'resenas_cache') then
    create policy "own_resenas" on resenas_cache for all using (
      exists (select 1 from restaurantes r where r.id = resenas_cache.restaurante_id and r.user_id = auth.uid())
    );
  end if;
  if not exists (select 1 from pg_policies where policyname = 'own_chat' and tablename = 'chat_messages') then
    create policy "own_chat" on chat_messages for all using (auth.uid() = user_id);
  end if;
end $$;
