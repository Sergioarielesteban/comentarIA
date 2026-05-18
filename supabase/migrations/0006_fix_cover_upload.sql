-- Corrige subida de portada: columnas + trigger simplificado + RPC segura

alter table public.user_restaurants
  add column if not exists cover_image_url text,
  add column if not exists cover_image_source text,
  add column if not exists cover_image_updated_at timestamptz;

-- Solo congelar identidad del restaurante; la portada se cambia vía API/RPC
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

-- Actualizar portada tras subir a Storage (evita bloqueos RLS/trigger)
create or replace function public.set_restaurant_cover(p_url text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_row public.user_restaurants%rowtype;
begin
  if v_user_id is null then
    raise exception 'No autenticado' using errcode = '42501';
  end if;

  if p_url is null
     or length(trim(p_url)) = 0
     or p_url !~ '^https://'
     or strpos(p_url, 'restaurant-covers') = 0
     or strpos(p_url, v_user_id::text) = 0 then
    raise exception 'URL de imagen no válida para tu cuenta.';
  end if;

  update public.user_restaurants
  set
    cover_image_url = trim(p_url),
    cover_image_source = 'upload',
    cover_image_updated_at = now(),
    updated_at = now()
  where user_id = v_user_id
  returning * into v_row;

  if v_row.id is null then
    raise exception 'No tienes un restaurante vinculado.';
  end if;

  return jsonb_build_object(
    'cover_image_url', v_row.cover_image_url,
    'cover_image_source', v_row.cover_image_source,
    'cover_image_updated_at', v_row.cover_image_updated_at
  );
end;
$$;

revoke all on function public.set_restaurant_cover(text) from public;
grant execute on function public.set_restaurant_cover(text) to authenticated;
