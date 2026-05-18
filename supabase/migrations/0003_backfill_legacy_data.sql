-- ComentarIA — Backfill de datos legacy
-- Copia datos de las tablas antiguas (restaurantes / resenas_cache / analisis)
-- hacia el nuevo modelo (user_restaurants / user_restaurant_reviews /
-- restaurant_analysis_cache) sin volver a llamar a Outscraper ni a la IA.
--
-- Es idempotente: se puede ejecutar varias veces sin duplicar datos.
-- Solo backfilla usuarios que NO tengan ya fila en user_restaurants.

begin;

-- ============================================================
-- 1) user_restaurants  ←  restaurantes
-- ============================================================
-- Reglas:
--  - Una cuenta = un restaurante. Si un usuario tenía más de uno en la
--    tabla antigua, nos quedamos con el más reciente.
--  - Si ya existe una fila en user_restaurants para ese usuario, no se toca.
--  - place_id se exige NOT NULL en el nuevo schema. Si la fila legacy no
--    tiene place_id, se usa un fallback "legacy:<id>" para no perder
--    la vinculación (el refresh real desde Outscraper lo actualizaría,
--    pero el trigger lo congela, así que se queda como identificador
--    estable hasta que soporte lo cambie manualmente).

with legacy_latest as (
  select distinct on (r.user_id)
    r.id          as legacy_id,
    r.user_id,
    r.place_id,
    r.nombre,
    r.direccion,
    r.rating,
    r.total_resenas,
    r.created_at,
    r.updated_at
  from public.restaurantes r
  order by r.user_id, r.updated_at desc nulls last, r.created_at desc
)
insert into public.user_restaurants (
  user_id,
  place_id,
  name,
  address,
  rating,
  total_reviews,
  locked_at,
  created_at,
  updated_at
)
select
  l.user_id,
  coalesce(nullif(trim(l.place_id), ''), 'legacy:' || l.legacy_id::text),
  l.nombre,
  l.direccion,
  l.rating,
  l.total_resenas,
  coalesce(l.created_at, now()),
  coalesce(l.created_at, now()),
  coalesce(l.updated_at, now())
from legacy_latest l
where not exists (
  select 1 from public.user_restaurants ur where ur.user_id = l.user_id
);

-- ============================================================
-- 2) user_restaurant_reviews  ←  resenas_cache
-- ============================================================
-- Coge las reseñas del restaurante legacy más reciente que ahora
-- está representado en user_restaurants, y las copia bajo el id nuevo.

with legacy_latest as (
  select distinct on (r.user_id)
    r.id      as legacy_id,
    r.user_id
  from public.restaurantes r
  order by r.user_id, r.updated_at desc nulls last, r.created_at desc
),
joined as (
  select
    ur.id            as user_restaurant_id,
    rc.data          as data,
    rc.fetched_at    as fetched_at
  from legacy_latest l
  join public.user_restaurants ur on ur.user_id = l.user_id
  join public.resenas_cache rc on rc.restaurante_id = l.legacy_id
)
insert into public.user_restaurant_reviews (
  user_restaurant_id,
  data,
  fetched_at
)
select
  j.user_restaurant_id,
  j.data,
  coalesce(j.fetched_at, now())
from joined j
on conflict (user_restaurant_id) do nothing;

-- ============================================================
-- 3) restaurant_analysis_cache  ←  analisis
-- ============================================================
-- Cachea el análisis legacy bajo (user_id, place_id, reviews_hash) del
-- nuevo modelo. Si no hay reviews_hash en la fila vieja, se usa
-- "legacy_import" para que la caché exista (el hash real se recalculará
-- la próxima vez que se procesen reseñas).

with legacy_latest as (
  select distinct on (r.user_id)
    r.id      as legacy_id,
    r.user_id
  from public.restaurantes r
  order by r.user_id, r.updated_at desc nulls last, r.created_at desc
),
joined as (
  select
    ur.user_id,
    ur.place_id,
    coalesce(nullif(trim(a.reviews_hash), ''), 'legacy_import') as reviews_hash,
    a.data        as analysis_json,
    a.created_at  as generated_at
  from legacy_latest l
  join public.user_restaurants ur on ur.user_id = l.user_id
  join public.analisis a on a.restaurante_id = l.legacy_id
)
insert into public.restaurant_analysis_cache (
  user_id,
  place_id,
  reviews_hash,
  analysis_json,
  generated_at,
  created_at
)
select
  j.user_id,
  j.place_id,
  j.reviews_hash,
  j.analysis_json,
  coalesce(j.generated_at, now()),
  coalesce(j.generated_at, now())
from joined j
on conflict (user_id, place_id, reviews_hash) do nothing;

commit;

-- ============================================================
-- Comprobación rápida (opcional, ejecutar manualmente para auditar)
-- ============================================================
-- select
--   (select count(*) from public.restaurantes)                  as legacy_restaurantes,
--   (select count(*) from public.user_restaurants)              as nuevos_restaurantes,
--   (select count(*) from public.user_restaurant_reviews)       as nuevos_reviews,
--   (select count(*) from public.restaurant_analysis_cache)     as nuevos_analisis;
