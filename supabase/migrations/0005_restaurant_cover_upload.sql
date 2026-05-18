-- Subida de foto/logo del restaurante por el usuario (Storage + validación URL)

-- Permitir cambiar portada (place_id sigue congelado)
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

  if TG_OP = 'UPDATE' and NEW.cover_image_url is distinct from OLD.cover_image_url then
    if NEW.cover_image_source = 'upload' then
      if NEW.cover_image_url is null
         or position('/restaurant-covers/' || NEW.user_id::text || '/' in NEW.cover_image_url) = 0 then
        raise exception 'La imagen debe subirse desde Ajustes de la app.';
      end if;
    elsif NEW.cover_image_source = 'outscraper' then
      if NEW.cover_image_url is not null and NEW.cover_image_url !~ '^https?://' then
        raise exception 'URL de imagen inválida.';
      end if;
    elsif NEW.cover_image_source = 'fallback' then
      if NEW.cover_image_url is not null and NEW.cover_image_url !~ '^/' then
        raise exception 'URL de imagen inválida.';
      end if;
    else
      raise exception 'Fuente de imagen no permitida.';
    end if;
  end if;

  NEW.updated_at := now();
  return NEW;
end;
$$;

-- Bucket público para portadas (solo el usuario escribe en su carpeta)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'restaurant-covers',
  'restaurant-covers',
  true,
  4194304,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Políticas Storage
drop policy if exists "restaurant_covers_select_public" on storage.objects;
create policy "restaurant_covers_select_public"
  on storage.objects for select
  using (bucket_id = 'restaurant-covers');

drop policy if exists "restaurant_covers_insert_own" on storage.objects;
create policy "restaurant_covers_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'restaurant-covers'
    and name like (auth.uid()::text || '/%')
  );

drop policy if exists "restaurant_covers_update_own" on storage.objects;
create policy "restaurant_covers_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'restaurant-covers'
    and name like (auth.uid()::text || '/%')
  );

drop policy if exists "restaurant_covers_delete_own" on storage.objects;
create policy "restaurant_covers_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'restaurant-covers'
    and name like (auth.uid()::text || '/%')
  );
