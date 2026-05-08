import { createClient } from "@/lib/supabase/server";
import type { CatalogAddon, CatalogService, Locale } from "@/types/app";

const SERVICE_IMAGE_MAP: Record<string, string> = {
  "11111111-1111-1111-1111-111111111111":
    "https://images.pexels.com/photos/9462149/pexels-photo-9462149.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "22222222-2222-2222-2222-222222222222":
    "https://images.pexels.com/photos/9462746/pexels-photo-9462746.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "33333333-3333-3333-3333-333333333333":
    "https://images.pexels.com/photos/5691545/pexels-photo-5691545.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "44444444-4444-4444-4444-444444444444":
    "https://images.pexels.com/photos/3791617/pexels-photo-3791617.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "55555555-5555-5555-5555-555555555555":
    "https://images.pexels.com/photos/9462191/pexels-photo-9462191.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "66666666-6666-6666-6666-666666666666":
    "https://images.pexels.com/photos/9462734/pexels-photo-9462734.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "77777777-7777-7777-7777-777777777777":
    "https://images.pexels.com/photos/5882570/pexels-photo-5882570.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "88888888-8888-8888-8888-888888888888":
    "https://images.pexels.com/photos/4440568/pexels-photo-4440568.jpeg?auto=compress&cs=tinysrgb&w=1200",
};

function resolveServiceImage(id: string, imageUrl: string | null) {
  return SERVICE_IMAGE_MAP[id] ?? imageUrl;
}

const fallbackAddons: Record<Locale, CatalogAddon[]> = {
  kk: [
    {
      id: "fallback-fridge",
      serviceId: null,
      title: "Тоңазытқыш іші",
      description: "Тоңазытқыштың ішкі бөлігін толық тазалау",
      priceKzt: 5000,
    },
    {
      id: "fallback-oven",
      serviceId: null,
      title: "Духовка",
      description: "Ішкі май мен күйені тазалау",
      priceKzt: 6000,
    },
    {
      id: "fallback-windows",
      serviceId: null,
      title: "Сыртқы терезелер",
      description: "Сыртқы әйнек пен жақтауларды тазалау",
      priceKzt: 7000,
    },
  ],
  ru: [
    {
      id: "fallback-fridge",
      serviceId: null,
      title: "Холодильник внутри",
      description: "Полная очистка внутренней части холодильника",
      priceKzt: 5000,
    },
    {
      id: "fallback-oven",
      serviceId: null,
      title: "Духовка",
      description: "Удаление жира и нагара внутри",
      priceKzt: 6000,
    },
    {
      id: "fallback-windows",
      serviceId: null,
      title: "Внешние окна",
      description: "Стекло и сложные внешние стороны",
      priceKzt: 7000,
    },
  ],
};

const fallbackTranslations: Record<
  Locale,
  Array<Pick<CatalogService, "title" | "subtitle" | "summary" | "description" | "features">>
> = {
  kk: [
    {
      title: "Пәтер тазалау",
      subtitle: "Күнделікті және апталық таза режим.",
      summary: "Үйді тез қалпына келтіруге арналған базалық формат.",
      description: "Бөлмелерді шаңнан тазалау, еден, асүй мен жуыну аймағын жинау.",
      features: ["Еден, шаң, асүй және жуыну аймақтары"],
    },
    {
      title: "Deep clean",
      subtitle: "Жиналып қалған кір мен шаңға қарсы.",
      summary: "Маусымдық не ұзақ үзілістен кейінгі толық тазалау.",
      description: "Қиын жерлер, беттер, сантехника және асүйді терең деңгейде өңдейміз.",
      features: ["Күрделі аймақтар мен терең тазалау"],
    },
    {
      title: "Жөндеуден кейін",
      subtitle: "Құрылыс шаңы мен қалдықтарына қарсы формат.",
      summary: "Ремонттан кейін өмірге қайта кіруге дайын тазалық.",
      description: "Шаң, із, қалдық және күрделі беттермен жұмыс істейміз.",
      features: ["Құрылыс шаңы мен іздерді шығару"],
    },
    {
      title: "Офис тазалау",
      subtitle: "Команда мен клиентке арналған таза орта.",
      summary: "Күнделікті немесе жоспарлы офис күтімі.",
      description: "Ресепшн, жұмыс аймағы, асүй және санитарлық зоналарға бағытталған.",
      features: ["Жұмыс аймағы, ресепшн және асүй"],
    },
  ],
  ru: [
    {
      title: "Уборка квартиры",
      subtitle: "Базовый формат для регулярной чистоты.",
      summary: "Подходит для еженедельного ухода и быстрого освежения пространства.",
      description: "Пыль, полы, кухня и санузлы без перегруза лишними опциями.",
      features: ["Полы, пыль, кухня и санузлы"],
    },
    {
      title: "Генеральная уборка",
      subtitle: "Для случаев, когда нужна полная перезагрузка.",
      summary: "Глубокая проработка кухни, санузлов, пыли и сложных зон.",
      description: "Идеально после долгого периода без уборки или перед важным событием.",
      features: ["Сложные зоны и глубокая проработка"],
    },
    {
      title: "Уборка после ремонта",
      subtitle: "Для квартиры или дома после работ.",
      summary: "Собираем строительную пыль и приводим пространство в порядок.",
      description: "Подходит для новых квартир, офисов и обновленных помещений.",
      features: ["Удаление строительной пыли и следов"],
    },
    {
      title: "Уборка офиса",
      subtitle: "Для рабочих пространств и клиентских зон.",
      summary: "Подходит для регулярного обслуживания небольших и средних офисов.",
      description: "Рабочие столы, кухня, санузлы, переговорки и входная зона.",
      features: ["Рабочая зона, ресепшн и кухня"],
    },
  ],
};

const fallbackServiceBase = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    slug: "apartment-cleaning",
    basePriceKzt: 18000,
    durationMin: 180,
    category: "apartment_cleaning",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    slug: "deep-cleaning",
    basePriceKzt: 32000,
    durationMin: 300,
    category: "deep_cleaning",
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    slug: "post-renovation-cleaning",
    basePriceKzt: 45000,
    durationMin: 420,
    category: "post_renovation",
  },
  {
    id: "77777777-7777-7777-7777-777777777777",
    slug: "office-cleaning",
    basePriceKzt: 35000,
    durationMin: 240,
    category: "office",
  },
];

function getFallbackCatalogServices(locale: Locale): CatalogService[] {
  return fallbackServiceBase.map((service, index) => ({
    ...service,
    imageUrl: resolveServiceImage(service.id, null),
    ...fallbackTranslations[locale][index],
    addons: fallbackAddons[locale],
  }));
}

export async function getCatalogServices(locale: Locale): Promise<CatalogService[]> {
  const supabase = await createClient();

  let servicesResult;
  let addonsResult;

  try {
    [servicesResult, addonsResult] = await Promise.all([
      supabase
        .from("services")
        .select(
          `
          id,
          slug,
          base_price_kzt,
          duration_min,
          category,
          image_url,
          service_translations!inner(locale, title, subtitle, summary, description),
          service_features(
            id,
            sort_order,
            service_feature_translations(locale, text)
          )
        `
        )
        .eq("is_active", true)
        .eq("service_translations.locale", locale)
        .order("sort_order", { ascending: true }),
      supabase
        .from("service_addons")
        .select(
          `
          id,
          service_id,
          price_kzt,
          sort_order,
          is_active,
          service_addon_translations!inner(locale, title, description)
        `
        )
        .eq("is_active", true)
        .eq("service_addon_translations.locale", locale)
        .order("sort_order", { ascending: true }),
    ]);
  } catch (error) {
    console.warn("Supabase catalog lookup failed", error);
    return getFallbackCatalogServices(locale);
  }

  const { data: servicesData, error: servicesError } = servicesResult;
  const { data: addonsData, error: addonsError } = addonsResult;

  if (servicesError) {
    console.warn("Supabase services query failed", servicesError.message);
    return getFallbackCatalogServices(locale);
  }

  if (addonsError) {
    console.warn("Supabase addons query failed", addonsError.message);
    return getFallbackCatalogServices(locale);
  }

  const addons = (addonsData ?? []).map((addon: any) => ({
    id: addon.id,
    serviceId: addon.service_id,
    title: addon.service_addon_translations[0]?.title ?? "",
    description: addon.service_addon_translations[0]?.description ?? "",
    priceKzt: addon.price_kzt,
  })) satisfies CatalogAddon[];

  return (servicesData ?? []).map((service: any) => {
    const translation = service.service_translations[0];
    const features = (service.service_features ?? [])
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((feature: any) =>
        (feature.service_feature_translations ?? []).find((translation: any) => translation.locale === locale)?.text
      )
      .filter(Boolean);

    return {
      id: service.id,
      slug: service.slug,
      title: translation.title,
      subtitle: translation.subtitle,
      summary: translation.summary,
      description: translation.description,
      basePriceKzt: service.base_price_kzt,
      durationMin: service.duration_min,
      category: service.category,
      imageUrl: resolveServiceImage(service.id, service.image_url),
      features,
      addons: addons.filter((addon) => addon.serviceId === null || addon.serviceId === service.id),
    } satisfies CatalogService;
  });
}

export async function getCatalogServiceBySlug(
  locale: Locale,
  slug: string
): Promise<CatalogService | null> {
  const services = await getCatalogServices(locale);
  return services.find((service) => service.slug === slug) ?? null;
}
