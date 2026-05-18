-- Imagen de portada del restaurante vinculado (una cuenta = un restaurante)
alter table public.user_restaurants
  add column if not exists cover_image_url text,
  add column if not exists cover_image_source text,
  add column if not exists cover_image_updated_at timestamptz;

-- Congelar imagen junto con place_id (solo INSERT inicial / admin futuro)
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
  -- Permitir rellenar imagen si aún era null (migración legacy); no cambiar si ya existía
  if OLD.cover_image_url is not null
     and NEW.cover_image_url is distinct from OLD.cover_image_url then
    NEW.cover_image_url := OLD.cover_image_url;
  end if;
  if OLD.cover_image_source is not null
     and NEW.cover_image_source is distinct from OLD.cover_image_source then
    NEW.cover_image_source := OLD.cover_image_source;
  end if;
  if OLD.cover_image_updated_at is not null
     and NEW.cover_image_updated_at is distinct from OLD.cover_image_updated_at then
    NEW.cover_image_updated_at := OLD.cover_image_updated_at;
  end if;
  NEW.updated_at := now();
  return NEW;
end;
$$;
