create or replace function public.create_booking(
  p_service_id uuid,
  p_addon_ids uuid[] default '{}',
  p_locale text default 'kk',
  p_customer_name text default '',
  p_customer_phone text default '',
  p_customer_email text default '',
  p_city text default 'Алматы',
  p_district text default '',
  p_address_line text default '',
  p_apartment_details text default '',
  p_scheduled_date date default null,
  p_time_window text default '',
  p_comment text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_service record;
  v_addon record;
  v_addon_total integer := 0;
  v_total integer := 0;
  v_booking_id uuid;
  v_booking_number text;
  v_addon_titles text[] := '{}';
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select s.id, s.base_price_kzt, st.title
  into v_service
  from public.services s
  join public.service_translations st on st.service_id = s.id and st.locale = p_locale
  where s.id = p_service_id and s.is_active = true;

  if not found then
    raise exception 'service_not_found';
  end if;

  insert into public.bookings (
    user_id,
    service_id,
    locale,
    customer_name,
    customer_phone,
    customer_email,
    city,
    district,
    address_line,
    apartment_details,
    scheduled_date,
    time_window,
    comment,
    subtotal_kzt,
    addons_total_kzt,
    total_kzt,
    status,
    payment_status
  )
  values (
    v_user_id,
    p_service_id,
    p_locale,
    p_customer_name,
    p_customer_phone,
    nullif(p_customer_email, ''),
    p_city,
    p_district,
    p_address_line,
    nullif(p_apartment_details, ''),
    p_scheduled_date,
    p_time_window,
    nullif(p_comment, ''),
    v_service.base_price_kzt,
    0,
    v_service.base_price_kzt,
    'new',
    'unpaid'
  )
  returning id, booking_number into v_booking_id, v_booking_number;

  insert into public.booking_items (
    booking_id,
    item_type,
    ref_id,
    title_snapshot,
    price_kzt,
    quantity,
    line_total_kzt
  )
  values (
    v_booking_id,
    'service',
    p_service_id,
    v_service.title,
    v_service.base_price_kzt,
    1,
    v_service.base_price_kzt
  );

  for v_addon in
    select a.id, a.price_kzt, aat.title
    from public.service_addons a
    join public.service_addon_translations aat on aat.addon_id = a.id and aat.locale = p_locale
    where a.id = any(coalesce(p_addon_ids, '{}')) and a.is_active = true
  loop
    v_addon_total := v_addon_total + v_addon.price_kzt;
    v_addon_titles := array_append(v_addon_titles, v_addon.title);

    insert into public.booking_items (
      booking_id,
      item_type,
      ref_id,
      title_snapshot,
      price_kzt,
      quantity,
      line_total_kzt
    )
    values (
      v_booking_id,
      'addon',
      v_addon.id,
      v_addon.title,
      v_addon.price_kzt,
      1,
      v_addon.price_kzt
    );
  end loop;

  v_total := v_service.base_price_kzt + v_addon_total;

  update public.bookings
  set addons_total_kzt = v_addon_total,
      total_kzt = v_total
  where id = v_booking_id;

  insert into public.booking_status_events (
    booking_id,
    actor_user_id,
    event_type,
    from_status,
    to_status,
    note
  )
  values (
    v_booking_id,
    v_user_id,
    'created',
    null,
    'new',
    'website_booking'
  );

  return jsonb_build_object(
    'booking_id', v_booking_id,
    'booking_number', v_booking_number,
    'service_title', v_service.title,
    'addon_titles', to_jsonb(v_addon_titles),
    'total_kzt', v_total
  );
end;
$$;

create or replace function public.mark_booking_whatsapp_sent(
  p_booking_id uuid,
  p_whatsapp_url text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_current_status text;
  v_booking_user uuid;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select user_id, status into v_booking_user, v_current_status
  from public.bookings
  where id = p_booking_id;

  if not found then
    raise exception 'booking_not_found';
  end if;

  if v_booking_user <> v_user_id and not public.is_admin() then
    raise exception 'forbidden';
  end if;

  update public.bookings
  set whatsapp_url = p_whatsapp_url,
      status = 'whatsapp_sent',
      payment_status = 'pending_whatsapp'
  where id = p_booking_id;

  insert into public.booking_status_events (
    booking_id,
    actor_user_id,
    event_type,
    from_status,
    to_status,
    note
  )
  values (
    p_booking_id,
    v_user_id,
    'whatsapp_redirected',
    v_current_status,
    'whatsapp_sent',
    'whatsapp_redirect'
  );
end;
$$;

create or replace function public.admin_transition_booking(
  p_booking_id uuid,
  p_to_status text,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_from_status text;
  v_allowed boolean := false;
begin
  if v_user_id is null or not public.is_admin() then
    raise exception 'forbidden';
  end if;

  select status into v_from_status from public.bookings where id = p_booking_id;
  if not found then
    raise exception 'booking_not_found';
  end if;

  v_allowed :=
    (v_from_status = 'new' and p_to_status in ('pending_confirmation', 'cancelled')) or
    (v_from_status = 'whatsapp_sent' and p_to_status in ('pending_confirmation', 'cancelled')) or
    (v_from_status = 'pending_confirmation' and p_to_status in ('confirmed', 'cancelled')) or
    (v_from_status = 'confirmed' and p_to_status in ('in_progress', 'cancelled')) or
    (v_from_status = 'in_progress' and p_to_status = 'completed') or
    (v_from_status = 'draft' and p_to_status in ('new', 'cancelled'));

  if not v_allowed then
    raise exception 'invalid_transition';
  end if;

  update public.bookings
  set status = p_to_status
  where id = p_booking_id;

  insert into public.booking_status_events (
    booking_id,
    actor_user_id,
    event_type,
    from_status,
    to_status,
    note
  )
  values (
    p_booking_id,
    v_user_id,
    'status_changed',
    v_from_status,
    p_to_status,
    p_note
  );
end;
$$;

create or replace function public.admin_update_booking_payment_status(
  p_booking_id uuid,
  p_payment_status text,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_from_payment text;
begin
  if v_user_id is null or not public.is_admin() then
    raise exception 'forbidden';
  end if;

  select payment_status into v_from_payment from public.bookings where id = p_booking_id;
  if not found then
    raise exception 'booking_not_found';
  end if;

  if p_payment_status not in ('unpaid', 'pending_whatsapp', 'paid', 'refunded') then
    raise exception 'invalid_payment_status';
  end if;

  update public.bookings
  set payment_status = p_payment_status
  where id = p_booking_id;

  insert into public.booking_status_events (
    booking_id,
    actor_user_id,
    event_type,
    from_status,
    to_status,
    note
  )
  values (
    p_booking_id,
    v_user_id,
    'payment_status_changed',
    v_from_payment,
    p_payment_status,
    p_note
  );
end;
$$;

grant execute on function public.create_booking(uuid, uuid[], text, text, text, text, text, text, text, text, date, text, text) to authenticated;
grant execute on function public.mark_booking_whatsapp_sent(uuid, text) to authenticated;
grant execute on function public.admin_transition_booking(uuid, text, text) to authenticated;
grant execute on function public.admin_update_booking_payment_status(uuid, text, text) to authenticated;
