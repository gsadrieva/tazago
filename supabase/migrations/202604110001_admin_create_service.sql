create or replace function public.admin_create_service(
  p_slug text,
  p_base_price_kzt integer,
  p_duration_min integer,
  p_category text,
  p_image_url text default null,
  p_sort_order integer default 0,
  p_title_kk text default '',
  p_subtitle_kk text default '',
  p_summary_kk text default '',
  p_description_kk text default '',
  p_title_ru text default '',
  p_subtitle_ru text default '',
  p_summary_ru text default '',
  p_description_ru text default '',
  p_features_kk text[] default array[]::text[],
  p_features_ru text[] default array[]::text[]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_service_id uuid := gen_random_uuid();
  v_feature_id uuid;
  v_max_features integer := greatest(
    coalesce(array_length(p_features_kk, 1), 0),
    coalesce(array_length(p_features_ru, 1), 0)
  );
  v_index integer;
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;

  insert into public.services (
    id,
    slug,
    base_price_kzt,
    duration_min,
    category,
    image_url,
    sort_order
  )
  values (
    v_service_id,
    p_slug,
    p_base_price_kzt,
    p_duration_min,
    p_category,
    nullif(p_image_url, ''),
    coalesce(p_sort_order, 0)
  );

  insert into public.service_translations (service_id, locale, title, subtitle, summary, description)
  values
    (
      v_service_id,
      'kk',
      p_title_kk,
      p_subtitle_kk,
      p_summary_kk,
      p_description_kk
    ),
    (
      v_service_id,
      'ru',
      p_title_ru,
      p_subtitle_ru,
      p_summary_ru,
      p_description_ru
    );

  for v_index in 1..v_max_features loop
    if coalesce(nullif(p_features_kk[v_index], ''), nullif(p_features_ru[v_index], '')) is null then
      continue;
    end if;

    v_feature_id := gen_random_uuid();

    insert into public.service_features (id, service_id, sort_order)
    values (v_feature_id, v_service_id, v_index);

    insert into public.service_feature_translations (feature_id, locale, text)
    values
      (
        v_feature_id,
        'kk',
        coalesce(nullif(p_features_kk[v_index], ''), nullif(p_features_ru[v_index], ''), p_title_kk)
      ),
      (
        v_feature_id,
        'ru',
        coalesce(nullif(p_features_ru[v_index], ''), nullif(p_features_kk[v_index], ''), p_title_ru)
      );
  end loop;

  return v_service_id;
end;
$$;

revoke all on function public.admin_create_service(
  text,
  integer,
  integer,
  text,
  text,
  integer,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text[],
  text[]
) from public;

grant execute on function public.admin_create_service(
  text,
  integer,
  integer,
  text,
  text,
  integer,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text[],
  text[]
) to authenticated;
