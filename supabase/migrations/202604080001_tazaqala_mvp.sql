create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  full_name text,
  phone text,
  preferred_locale text not null default 'kk' check (preferred_locale in ('kk', 'ru')),
  city text not null default 'Алматы',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  base_price_kzt integer not null check (base_price_kzt >= 0),
  duration_min integer not null check (duration_min > 0),
  category text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  image_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.service_translations (
  service_id uuid not null references public.services(id) on delete cascade,
  locale text not null check (locale in ('kk', 'ru')),
  title text not null,
  subtitle text not null,
  summary text not null,
  description text not null,
  primary key (service_id, locale)
);

create table public.service_features (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  sort_order integer not null default 0
);

create table public.service_feature_translations (
  feature_id uuid not null references public.service_features(id) on delete cascade,
  locale text not null check (locale in ('kk', 'ru')),
  text text not null,
  primary key (feature_id, locale)
);

create table public.service_addons (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references public.services(id) on delete cascade,
  price_kzt integer not null check (price_kzt >= 0),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.service_addon_translations (
  addon_id uuid not null references public.service_addons(id) on delete cascade,
  locale text not null check (locale in ('kk', 'ru')),
  title text not null,
  description text not null,
  primary key (addon_id, locale)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_number text unique,
  user_id uuid not null references public.profiles(id) on delete cascade,
  service_id uuid not null references public.services(id),
  locale text not null check (locale in ('kk', 'ru')),
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  city text not null default 'Алматы',
  district text,
  address_line text not null,
  apartment_details text,
  scheduled_date date not null,
  time_window text not null,
  comment text,
  subtotal_kzt integer not null default 0,
  addons_total_kzt integer not null default 0,
  total_kzt integer not null default 0,
  status text not null default 'new' check (status in ('draft', 'new', 'whatsapp_sent', 'pending_confirmation', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'pending_whatsapp', 'paid', 'refunded')),
  whatsapp_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.booking_items (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  item_type text not null check (item_type in ('service', 'addon')),
  ref_id uuid,
  title_snapshot text not null,
  price_kzt integer not null check (price_kzt >= 0),
  quantity integer not null default 1 check (quantity > 0),
  line_total_kzt integer not null check (line_total_kzt >= 0)
);

create table public.booking_status_events (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  actor_user_id uuid references public.profiles(id) on delete set null,
  event_type text not null,
  from_status text,
  to_status text,
  note text,
  created_at timestamptz not null default timezone('utc', now())
);

create index bookings_user_id_idx on public.bookings(user_id);
create index bookings_service_id_idx on public.bookings(service_id);
create index booking_items_booking_id_idx on public.booking_items(booking_id);
create index booking_status_events_booking_id_idx on public.booking_status_events(booking_id);
create index service_features_service_id_idx on public.service_features(service_id);
create index service_addons_service_id_idx on public.service_addons(service_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.set_booking_number()
returns trigger
language plpgsql
as $$
declare
  v_counter integer;
begin
  if new.booking_number is not null then
    return new;
  end if;

  select count(*) + 1
  into v_counter
  from public.bookings
  where created_at::date = timezone('utc', now())::date;

  new.booking_number := 'TZQ-' || to_char(timezone('utc', now())::date, 'YYYYMMDD') || '-' || lpad(v_counter::text, 4, '0');
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_first_user boolean;
begin
  select not exists(select 1 from public.profiles) into v_first_user;

  insert into public.profiles (id, role, full_name, phone, preferred_locale, city)
  values (
    new.id,
    case when v_first_user then 'admin' else 'customer' end,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    nullif(new.raw_user_meta_data->>'phone', ''),
    coalesce(nullif(new.raw_user_meta_data->>'preferred_locale', ''), 'kk'),
    'Алматы'
  );

  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger services_set_updated_at before update on public.services for each row execute function public.set_updated_at();
create trigger service_addons_set_updated_at before update on public.service_addons for each row execute function public.set_updated_at();
create trigger bookings_set_updated_at before update on public.bookings for each row execute function public.set_updated_at();
create trigger bookings_set_number before insert on public.bookings for each row execute function public.set_booking_number();
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.service_translations enable row level security;
alter table public.service_features enable row level security;
alter table public.service_feature_translations enable row level security;
alter table public.service_addons enable row level security;
alter table public.service_addon_translations enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_items enable row level security;
alter table public.booking_status_events enable row level security;

create policy "profiles_select_self_or_admin" on public.profiles
for select using (id = auth.uid() or public.is_admin());

create policy "profiles_update_self_or_admin" on public.profiles
for update using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

create policy "services_public_read" on public.services for select using (true);
create policy "service_translations_public_read" on public.service_translations for select using (true);
create policy "service_features_public_read" on public.service_features for select using (true);
create policy "service_feature_translations_public_read" on public.service_feature_translations for select using (true);
create policy "service_addons_public_read" on public.service_addons for select using (true);
create policy "service_addon_translations_public_read" on public.service_addon_translations for select using (true);

create policy "bookings_select_owner_or_admin" on public.bookings
for select using (user_id = auth.uid() or public.is_admin());

create policy "bookings_insert_owner_or_admin" on public.bookings
for insert with check (user_id = auth.uid() or public.is_admin());

create policy "bookings_update_owner_or_admin" on public.bookings
for update using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "booking_items_select_owner_or_admin" on public.booking_items
for select using (
  exists (
    select 1 from public.bookings
    where bookings.id = booking_items.booking_id
      and (bookings.user_id = auth.uid() or public.is_admin())
  )
);

create policy "booking_items_insert_owner_or_admin" on public.booking_items
for insert with check (
  exists (
    select 1 from public.bookings
    where bookings.id = booking_items.booking_id
      and (bookings.user_id = auth.uid() or public.is_admin())
  )
);

create policy "booking_status_events_select_owner_or_admin" on public.booking_status_events
for select using (
  exists (
    select 1 from public.bookings
    where bookings.id = booking_status_events.booking_id
      and (bookings.user_id = auth.uid() or public.is_admin())
  )
);

create policy "booking_status_events_insert_owner_or_admin" on public.booking_status_events
for insert with check (
  exists (
    select 1 from public.bookings
    where bookings.id = booking_status_events.booking_id
      and (bookings.user_id = auth.uid() or public.is_admin())
  )
);

insert into public.services (id, slug, base_price_kzt, duration_min, category, sort_order, image_url) values
('11111111-1111-1111-1111-111111111111', 'apartment-cleaning', 18000, 180, 'apartment_cleaning', 1, 'https://images.pexels.com/photos/9462149/pexels-photo-9462149.jpeg?auto=compress&cs=tinysrgb&w=1200'),
('22222222-2222-2222-2222-222222222222', 'deep-cleaning', 32000, 300, 'deep_cleaning', 2, 'https://images.pexels.com/photos/9462746/pexels-photo-9462746.jpeg?auto=compress&cs=tinysrgb&w=1200'),
('33333333-3333-3333-3333-333333333333', 'post-renovation-cleaning', 45000, 420, 'post_renovation', 3, 'https://images.pexels.com/photos/5691545/pexels-photo-5691545.jpeg?auto=compress&cs=tinysrgb&w=1200'),
('44444444-4444-4444-4444-444444444444', 'move-in-move-out-cleaning', 28000, 240, 'move_in_out', 4, 'https://images.pexels.com/photos/3791617/pexels-photo-3791617.jpeg?auto=compress&cs=tinysrgb&w=1200'),
('55555555-5555-5555-5555-555555555555', 'sofa-and-carpet-cleaning', 22000, 180, 'upholstery', 5, 'https://images.pexels.com/photos/9462191/pexels-photo-9462191.jpeg?auto=compress&cs=tinysrgb&w=1200'),
('66666666-6666-6666-6666-666666666666', 'window-cleaning', 16000, 150, 'windows', 6, 'https://images.pexels.com/photos/9462734/pexels-photo-9462734.jpeg?auto=compress&cs=tinysrgb&w=1200'),
('77777777-7777-7777-7777-777777777777', 'office-cleaning', 35000, 240, 'office', 7, 'https://images.pexels.com/photos/5882570/pexels-photo-5882570.jpeg?auto=compress&cs=tinysrgb&w=1200'),
('88888888-8888-8888-8888-888888888888', 'express-cleaning', 12000, 120, 'express', 8, 'https://images.pexels.com/photos/4440568/pexels-photo-4440568.jpeg?auto=compress&cs=tinysrgb&w=1200');

insert into public.service_translations (service_id, locale, title, subtitle, summary, description) values
('11111111-1111-1111-1111-111111111111', 'kk', 'Пәтер тазалау', 'Күнделікті және апталық таза режим.', 'Үйді тез қалпына келтіруге арналған базалық формат.', 'Бөлмелерді шаңнан тазалау, еден, асүй мен жуыну аймағын жинау.'),
('11111111-1111-1111-1111-111111111111', 'ru', 'Уборка квартиры', 'Базовый формат для регулярной чистоты.', 'Подходит для еженедельного ухода и быстрого освежения пространства.', 'Пыль, полы, кухня и санузлы без перегруза лишними опциями.'),
('22222222-2222-2222-2222-222222222222', 'kk', 'Deep clean', 'Жиналып қалған кір мен шаңға қарсы.', 'Маусымдық не ұзақ үзілістен кейінгі толық тазалау.', 'Қиын жерлер, беттер, сантехника және асүйді терең деңгейде өңдейміз.'),
('22222222-2222-2222-2222-222222222222', 'ru', 'Генеральная уборка', 'Для случаев, когда нужна полная перезагрузка.', 'Глубокая проработка кухни, санузлов, пыли и сложных зон.', 'Идеально после долгого периода без уборки или перед важным событием.'),
('33333333-3333-3333-3333-333333333333', 'kk', 'Жөндеуден кейін', 'Құрылыс шаңы мен қалдықтарына қарсы формат.', 'Ремонттан кейін өмірге қайта кіруге дайын тазалық.', 'Шаң, із, қалдық және күрделі беттермен жұмыс істейміз.'),
('33333333-3333-3333-3333-333333333333', 'ru', 'Уборка после ремонта', 'Для ввода квартиры или дома после работ.', 'Собираем строительную пыль и приводим пространство в порядок.', 'Подходит для новых квартир, офисов и обновлённых помещений.'),
('44444444-4444-4444-4444-444444444444', 'kk', 'Көшу кезіндегі тазалау', 'Көшу алдында не кейін ыңғайлы формат.', 'Жаңа этапты таза стартпен бастауға арналған сервис.', 'Шығу алдында объектіні өткізуге немесе кіру алдында дайындауға көмектесеміз.'),
('44444444-4444-4444-4444-444444444444', 'ru', 'Уборка при переезде', 'Перед сдачей или сразу после заезда.', 'Помогаем быстро подготовить пространство к новому этапу.', 'Удобно для арендных квартир, домов и офисных переездов.'),
('55555555-5555-5555-5555-555555555555', 'kk', 'Диван мен кілем', 'Жұмсақ жиһаз бен тоқымаға арналған формат.', 'Иіс, дақ және шаң жиналған беттерді сергітеді.', 'Диван, кресло, кілем және текстиль аймақтарына жұмыс істейміз.'),
('55555555-5555-5555-5555-555555555555', 'ru', 'Чистка диванов и ковров', 'Для мягкой мебели и текстиля.', 'Освежаем тканевые поверхности и убираем накопившуюся грязь.', 'Подходит для диванов, кресел, ковров и домашних текстильных зон.'),
('66666666-6666-6666-6666-666666666666', 'kk', 'Терезе жуу', 'Ішкі әйнек пен жақтауларды тазалау.', 'Күн түсетін бөлмелерге таза жарық қайтарады.', 'Әйнек, рама және кір жиналатын аймақтарды тазалаймыз.'),
('66666666-6666-6666-6666-666666666666', 'ru', 'Мойка окон', 'Для внутреннего стекла и рам.', 'Возвращает свет и аккуратный вид помещению.', 'Подходит для квартир, домов, офисов и витрин.'),
('77777777-7777-7777-7777-777777777777', 'kk', 'Офис тазалау', 'Команда мен клиентке арналған таза орта.', 'Күнделікті немесе жоспарлы офис күтімі.', 'Ресепшн, жұмыс аймағы, асүй және санитарлық зоналарға бағытталған.'),
('77777777-7777-7777-7777-777777777777', 'ru', 'Уборка офиса', 'Для рабочих пространств и клиентских зон.', 'Подходит для регулярного обслуживания небольших и средних офисов.', 'Рабочие столы, кухня, санузлы, переговорки и входная зона.'),
('88888888-8888-8888-8888-888888888888', 'kk', 'Экспресс уборка', 'Жылдам визит және базалық refresh.', 'Қысқа уақытта көрінетін тазалық керек болғанда.', 'Шұғыл қонақ, түсірілім не кездесу алдында ыңғайлы формат.'),
('88888888-8888-8888-8888-888888888888', 'ru', 'Экспресс уборка', 'Быстрый визит для визуального порядка.', 'Когда нужно быстро освежить пространство перед встречей или гостями.', 'Самый быстрый формат из каталога для базового результата.');

insert into public.service_features (id, service_id, sort_order) values
('f1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 1),
('f2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 1),
('f3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 1),
('f4444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 1),
('f5555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 1),
('f6666666-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666', 1),
('f7777777-7777-7777-7777-777777777777', '77777777-7777-7777-7777-777777777777', 1),
('f8888888-8888-8888-8888-888888888888', '88888888-8888-8888-8888-888888888888', 1);

insert into public.service_feature_translations (feature_id, locale, text) values
('f1111111-1111-1111-1111-111111111111', 'kk', 'Еден, шаң, асүй және жуыну аймақтары'),
('f1111111-1111-1111-1111-111111111111', 'ru', 'Полы, пыль, кухня и санузлы'),
('f2222222-2222-2222-2222-222222222222', 'kk', 'Күрделі аймақтар мен терең тазалау'),
('f2222222-2222-2222-2222-222222222222', 'ru', 'Сложные зоны и глубокая проработка'),
('f3333333-3333-3333-3333-333333333333', 'kk', 'Құрылыс шаңы мен іздерді шығару'),
('f3333333-3333-3333-3333-333333333333', 'ru', 'Удаление строительной пыли и следов'),
('f4444444-4444-4444-4444-444444444444', 'kk', 'Көшу алдындағы не кейінгі толық дайындық'),
('f4444444-4444-4444-4444-444444444444', 'ru', 'Подготовка помещения до или после переезда'),
('f5555555-5555-5555-5555-555555555555', 'kk', 'Мягкая мебель мен тоқыма беттер'),
('f5555555-5555-5555-5555-555555555555', 'ru', 'Мягкая мебель и текстиль'),
('f6666666-6666-6666-6666-666666666666', 'kk', 'Әйнек, рама және жиектер'),
('f6666666-6666-6666-6666-666666666666', 'ru', 'Стекло, рамы и кромки'),
('f7777777-7777-7777-7777-777777777777', 'kk', 'Жұмыс аймағы, ресепшн және асүй'),
('f7777777-7777-7777-7777-777777777777', 'ru', 'Рабочая зона, ресепшн и кухня'),
('f8888888-8888-8888-8888-888888888888', 'kk', 'Тез визуалды refresh'),
('f8888888-8888-8888-8888-888888888888', 'ru', 'Быстрый визуальный refresh');

insert into public.service_addons (id, service_id, price_kzt, sort_order) values
('b1111111-1111-1111-1111-111111111111', null, 5000, 1),
('b2222222-2222-2222-2222-222222222222', null, 6000, 2),
('b3333333-3333-3333-3333-333333333333', null, 7000, 3),
('b4444444-4444-4444-4444-444444444444', null, 4500, 4),
('b5555555-5555-5555-5555-555555555555', null, 4000, 5);

insert into public.service_addon_translations (addon_id, locale, title, description) values
('b1111111-1111-1111-1111-111111111111', 'kk', 'Тоңазытқыш іші', 'Тоңазытқыштың ішкі бөлігін толық тазалау'),
('b1111111-1111-1111-1111-111111111111', 'ru', 'Холодильник внутри', 'Полная очистка внутренней части холодильника'),
('b2222222-2222-2222-2222-222222222222', 'kk', 'Духовка', 'Ішкі май мен күйені шығару'),
('b2222222-2222-2222-2222-222222222222', 'ru', 'Духовка', 'Удаление жира и нагара внутри'),
('b3333333-3333-3333-3333-333333333333', 'kk', 'Сыртқы терезелер', 'Күрделі жақтар мен сыртқы әйнектер'),
('b3333333-3333-3333-3333-333333333333', 'ru', 'Внешние окна', 'Сложные внешние стороны и стекло'),
('b4444444-4444-4444-4444-444444444444', 'kk', 'Pet-safe режим', 'Жануар бар үйге ыңғайлы құралдар'),
('b4444444-4444-4444-4444-444444444444', 'ru', 'Pet-safe режим', 'Подбор средств для домов с питомцами'),
('b5555555-5555-5555-5555-555555555555', 'kk', 'Балкон', 'Балкон мен лоджияны базалық тазалау'),
('b5555555-5555-5555-5555-555555555555', 'ru', 'Балкон', 'Базовая уборка балкона или лоджии');
