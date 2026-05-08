import type { BookingStatus, Locale, PaymentStatus } from "@/types/app";

type NavKey = "home" | "services" | "booking" | "dashboard" | "contact" | "admin";

type Dictionary = {
  localeLabel: string;
  brand: {
    name: string;
    tagline: string;
    city: string;
    whatsappLabel: string;
  };
  nav: Record<NavKey, string>;
  auth: {
    signIn: string;
    signUp: string;
    signOut: string;
    email: string;
    password: string;
    fullName: string;
    phone: string;
    signInTitle: string;
    signInSubtitle: string;
    signUpTitle: string;
    signUpSubtitle: string;
    signInSubmit: string;
    signUpSubmit: string;
    noAccount: string;
    hasAccount: string;
    authErrorTitle: string;
    authErrorBody: string;
    invalidCredentials: string;
    accountCreated: string;
    emailConfirmationRequired: string;
    emailNotConfirmed: string;
    signInFailed: string;
    signUpFailed: string;
    userExists: string;
  };
  home: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    trustBadges: string[];
    servicesTitle: string;
    servicesBody: string;
    whyTitle: string;
    whyBody: string;
    whyItems: { title: string; body: string }[];
    howItWorksTitle: string;
    howItWorks: { title: string; body: string }[];
    testimonialsTitle: string;
    testimonials: { name: string; role: string; quote: string }[];
  };
  services: {
    title: string;
    body: string;
    from: string;
    duration: string;
    details: string;
    addonsTitle: string;
    featureTitle: string;
    notFound: string;
  };
  booking: {
    title: string;
    subtitle: string;
    loginRequiredTitle: string;
    loginRequiredBody: string;
    loginRequiredCta: string;
    steps: string[];
    fields: {
      service: string;
      date: string;
      timeWindow: string;
      district: string;
      address: string;
      apartmentDetails: string;
      comment: string;
      addons: string;
      fullName: string;
      phone: string;
      email: string;
    };
    review: {
      title: string;
      service: string;
      addons: string;
      contact: string;
      address: string;
      total: string;
      note: string;
      emptyAddons: string;
    };
    timeWindows: string[];
    districts: string[];
    buttons: {
      next: string;
      back: string;
      submit: string;
      submitting: string;
    };
    validation: {
      required: string;
      phone: string;
      serviceMissing: string;
    };
    successRedirect: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    upcoming: string;
    history: string;
    empty: string;
    lastActivity: string;
    quickContact: string;
    reopenWhatsapp: string;
    bookingDetails: string;
  };
  admin: {
    title: string;
    subtitle: string;
    filters: {
      search: string;
      status: string;
      paymentStatus: string;
      service: string;
    };
    table: {
      booking: string;
      client: string;
      service: string;
      date: string;
      status: string;
      payment: string;
      total: string;
      actions: string;
    };
    notes: string;
    saveStatus: string;
    savePayment: string;
    noAccess: string;
    empty: string;
  };
  contact: {
    title: string;
    subtitle: string;
    faqTitle: string;
    faq: { question: string; answer: string }[];
    infoTitle: string;
    infoLines: string[];
  };
  footer: {
    rights: string;
    cityLine: string;
  };
  misc: {
    all: string;
    notSpecified: string;
    loading: string;
    none: string;
  };
  metadata: {
    defaultTitle: string;
    description: string;
  };
};

const bookingStatusLabels: Record<Locale, Record<BookingStatus, string>> = {
  kk: {
    draft: "Драфт",
    new: "Жаңа",
    whatsapp_sent: "WhatsApp жіберілді",
    pending_confirmation: "Растауды күтіп тұр",
    confirmed: "Расталды",
    in_progress: "Жұмыста",
    completed: "Аяқталды",
    cancelled: "Бас тартылды",
  },
  ru: {
    draft: "Черновик",
    new: "Новый",
    whatsapp_sent: "Отправлен в WhatsApp",
    pending_confirmation: "Ждёт подтверждения",
    confirmed: "Подтверждён",
    in_progress: "В работе",
    completed: "Завершён",
    cancelled: "Отменён",
  },
};

const paymentStatusLabels: Record<Locale, Record<PaymentStatus, string>> = {
  kk: {
    unpaid: "Төленбеген",
    pending_whatsapp: "WhatsApp-та нақтыланады",
    paid: "Төленді",
    refunded: "Қайтарылды",
  },
  ru: {
    unpaid: "Не оплачено",
    pending_whatsapp: "Уточняется в WhatsApp",
    paid: "Оплачено",
    refunded: "Возврат",
  },
};

export const dictionaries: Record<Locale, Dictionary> = {
  kk: {
    localeLabel: "Қазақша",
    brand: {
      name: "TazaGo",
      tagline: "Қазақстан бойынша cleaning-сервис",
      city: "Қазақстан",
      whatsappLabel: "WhatsApp арқылы растау",
    },
    nav: {
      home: "Басты бет",
      services: "Қызметтер",
      booking: "Тапсырыс беру",
      dashboard: "Жеке кабинет",
      contact: "Байланыс",
      admin: "Админ",
    },
    auth: {
      signIn: "Кіру",
      signUp: "Тіркелу",
      signOut: "Шығу",
      email: "Электрон пошта",
      password: "Құпиясөз",
      fullName: "Аты-жөніңіз",
      phone: "Телефон",
      signInTitle: "Кабинетке кіру",
      signInSubtitle: "Тапсырыстарыңызды бақылап, менеджермен жылдам байланыса аласыз.",
      signUpTitle: "TazaGo-ға тіркелу",
      signUpSubtitle: "Бір рет тіркеліп, келесі тазалық тапсырыстарын әлдеқайда тез рәсімдейсіз.",
      signInSubmit: "Кіру",
      signUpSubmit: "Аккаунт ашу",
      noAccount: "Аккаунт жоқ па?",
      hasAccount: "Аккаунтыңыз бар ма?",
      authErrorTitle: "Кіру кезінде қате шықты",
      authErrorBody: "Сілтеме ескірген болуы мүмкін. Қайта кіріп көріңіз.",
      invalidCredentials: "Email немесе құпиясөз қате.",
      accountCreated: "Аккаунт ашылды. Енді кабинетке кіре аласыз.",
      emailConfirmationRequired:
        "Аккаунт құрылды, бірақ Supabase-та email растауы қосулы тұр. MVP үшін email confirm-ді өшіріңіз немесе поштаңызды растаңыз.",
      emailNotConfirmed:
        "Бұл email әлі расталмаған. Егер Supabase-та confirm email қосулы болса, алдымен поштаңызды растаңыз.",
      signInFailed: "Кіру кезінде қате шықты. Сәл кейінірек қайта көріңіз.",
      signUpFailed: "Тіркелу әзірге өтпей тұр. Деректерді тексеріп, қайта байқап көріңіз.",
      userExists: "Осы email-мен аккаунт бар. Кіру бетіне өтіп көріңіз.",
    },
    home: {
      eyebrow: "Қазақстан бойынша cleaning-сервис",
      title: "Үйіңіз таза, уақытыңыз бос, бәрі TazaGo-мен.",
      description:
        "Пәтер тазалау, терең жинау, офис тазалау, жөндеуден кейінгі тазалау, диван мен терезе жуу. Баға алдын ала көрінеді, ал нақтылау WhatsApp арқылы тез жүреді.",
      primaryCta: "Тапсырыс беру",
      secondaryCta: "Қызметтерді көру",
      trustBadges: [
        "Қазақстан бойынша қызмет",
        "Баға тек теңгемен",
        "Жанды менеджер қолдауы",
        "Қауіпсіз құралдар",
      ],
      servicesTitle: "Қызметтер каталогы",
      servicesBody: "Әр қызметтің өз бағасы, ұзақтығы, сипаттамасы және қосымша қызметтері бар.",
      whyTitle: "Неге бізді таңдайды",
      whyBody:
        "Біз үйді жай жинап қана қоймаймыз: ұқыпты команда, сенімді құралдар және түсінікті сервис арқылы күнделікті тазалықты жеңілдетеміз.",
      whyItems: [
        {
          title: "Ұқыпты мамандар",
          body: "Команда әр бөлмеге мұқият қарайды, асүй, еден және жуыну аймағын деталіне дейін жинайды.",
        },
        {
          title: "Қауіпсіз тазалық",
          body: "Үйге қолайлы құралдар мен тексерілген тәсілдер қолданамыз, сондықтан таза әрі жайлы нәтиже аласыз.",
        },
        {
          title: "Уақытты үнемдейсіз",
          body: "Баға алдын ала көрінеді, тапсырыс беру түсінікті, менеджер нақтылауды тез жүргізеді.",
        },
      ],
      howItWorksTitle: "Қалай жұмыс істейді",
      howItWorks: [
        {
          title: "1. Қызметті таңдайсыз",
          body: "Пәтер тазалау, deep clean, офис тазалау, терезе жуу, диван тазалау, жөндеуден кейінгі тазалау және басқасы.",
        },
        {
          title: "2. Күн мен мекенжайды толтырасыз",
          body: "Ыңғайлы уақытты, ауданды және толық мекенжайды көрсетесіз.",
        },
        {
          title: "3. WhatsApp-та растайсыз",
          body: "Менеджер тапсырысты нақтылап, финал растау мен төлемді чатта үйлестіреді.",
        },
      ],
      testimonialsTitle: "Клиенттер не дейді",
      testimonials: [
        {
          name: "Айару",
          role: "Алмалы ауданы",
          quote:
            "Пәтерге deep clean алдық, нәтиже топ. Сайттан тапсырыс беріп, ары қарай бәрі WhatsApp-та тез шешілді.",
        },
        {
          name: "Ермек",
          role: "Офис менеджері",
          quote: "Админ панельден статустарды бақылау ыңғайлы. MVP болса да, жұмыс логикасы дайын тұр.",
        },
        {
          name: "Лаура",
          role: "Медеу ауданы",
          quote:
            "Қосымша қызмет ретінде духовка мен тоңазытқыш қостық, бағасы бірден көрінді. Артық сұрақ қалмады.",
        },
      ],
    },
    services: {
      title: "Қызметтер каталогы",
      body: "Әр қызметтің өз бағасы, ұзақтығы, сипаттамасы және қосымша қызметтері бар.",
      from: "Бастап",
      duration: "Ұзақтығы",
      details: "Толығырақ",
      addonsTitle: "Қосымша қызметтер",
      featureTitle: "Не кіреді",
      notFound: "Қызмет табылмады.",
    },
    booking: {
      title: "Тапсырыс беру",
      subtitle: "Алты қадаммен өтінім жібересіз, содан кейін менеджер оны WhatsApp-та нақтылайды.",
      loginRequiredTitle: "Алдымен кіру керек",
      loginRequiredBody: "Тапсырысты кабинетке байлау үшін алдымен аккаунтқа кіріңіз.",
      loginRequiredCta: "Кіру бетіне өту",
      steps: ["Қызмет", "Күн мен уақыт", "Мекенжай", "Байланыс", "Қосымшалар", "Шолу"],
      fields: {
        service: "Қызмет",
        date: "Күн",
        timeWindow: "Уақыт аралығы",
        district: "Аудан",
        address: "Толық мекенжай",
        apartmentDetails: "Пәтер немесе үй туралы",
        comment: "Комментарий",
        addons: "Қосымша қызметтер",
        fullName: "Аты-жөні",
        phone: "Телефон",
        email: "Электрон пошта",
      },
      review: {
        title: "Өтінімді тексеру",
        service: "Қызмет",
        addons: "Қосымшалар",
        contact: "Байланыс",
        address: "Мекенжай",
        total: "Жалпы сома",
        note: "Жібергеннен кейін өтінім базаға сақталады, содан соң WhatsApp ашылады.",
        emptyAddons: "Қосымша қызмет таңдалмады",
      },
      timeWindows: ["09:00 - 12:00", "12:00 - 15:00", "15:00 - 18:00", "18:00 - 21:00"],
      districts: ["Алмалы", "Бостандық", "Медеу", "Әуезов", "Наурызбай", "Түрксіб"],
      buttons: {
        next: "Келесі",
        back: "Артқа",
        submit: "WhatsApp-қа жіберу",
        submitting: "Жіберіліп жатыр...",
      },
      validation: {
        required: "Міндетті өріс",
        phone: "Телефон нөмірін дұрыс толтырыңыз",
        serviceMissing: "Алдымен қызмет таңдаңыз",
      },
      successRedirect: "Өтінім сақталды, WhatsApp ашылып жатыр...",
    },
    dashboard: {
      title: "Жеке кабинет",
      subtitle: "Белсенді және өткен тапсырыстарыңыз осы жерде көрінеді.",
      upcoming: "Белсенді тапсырыстар",
      history: "Тарих",
      empty: "Әзірге тапсырыс жоқ. Алғашқы тазалыққа тапсырыс беріп көріңіз.",
      lastActivity: "Соңғы оқиға",
      quickContact: "Менеджерге жазу",
      reopenWhatsapp: "WhatsApp-ты қайта ашу",
      bookingDetails: "Тапсырыс мәліметтері",
    },
    admin: {
      title: "Операциялық панель",
      subtitle: "Тапсырыстарды іздеу, статус пен төлем күйін жаңарту үшін арналған панель.",
      filters: {
        search: "Нөмір, клиент немесе телефон",
        status: "Статус",
        paymentStatus: "Төлем",
        service: "Қызмет",
      },
      table: {
        booking: "Тапсырыс",
        client: "Клиент",
        service: "Қызмет",
        date: "Күн",
        status: "Статус",
        payment: "Төлем",
        total: "Сома",
        actions: "Әрекет",
      },
      notes: "Ішкі ескертпе",
      saveStatus: "Статусты сақтау",
      savePayment: "Төлемді сақтау",
      noAccess: "Бұл бет тек админге ашық.",
      empty: "Сүзгі бойынша тапсырыс табылмады.",
    },
    contact: {
      title: "Байланыс және FAQ",
      subtitle: "Жиі қойылатын сұрақтар мен бізбен тез байланысудың жолдары.",
      faqTitle: "Жиі сұрақтар",
      faq: [
        {
          question: "Тапсырыс қалай расталады?",
          answer: "Сайтта өтінім қалдырасыз, одан кейін менеджер WhatsApp-та уақыт пен құрамын нақтылайды.",
        },
        {
          question: "Төлем сайтта бола ма?",
          answer: "Жоқ, MVP нұсқасында төлем WhatsApp-та немесе алдын ала келісілген тәсілмен жүргізіледі.",
        },
        {
          question: "Қызмет құрамын өзгертуге бола ма?",
          answer: "Иә, негізгі қызметке духовка, тоңазытқыш, балкон, терезе сияқты қосымшаларды қоса аласыз.",
        },
        {
          question: "Қай қалада жұмыс істейсіздер?",
          answer: "Қазір Қазақстан бойынша тапсырыс қабылдаймыз.",
        },
      ],
      infoTitle: "Байланыс",
      infoLines: [
        "Қазақстан бойынша, күн сайын 09:00 - 21:00",
        "WhatsApp пен қоңырау арқылы жауап береміз",
        "Жеке және корпоративтік тапсырыстар қабылданады",
      ],
    },
    footer: {
      rights: "Барлық құқықтар қорғалған.",
      cityLine: "Қазақстан бойынша cleaning-сервис",
    },
    misc: {
      all: "Барлығы",
      notSpecified: "Көрсетілмеген",
      loading: "Жүктелуде...",
      none: "Жоқ",
    },
    metadata: {
      defaultTitle: "TazaGo",
      description: "Қазақстан бойынша екітілді cleaning-сервис: каталог, тапсырыс беру, жеке кабинет және админ панель.",
    },
  },
  ru: {
    localeLabel: "Русский",
    brand: {
      name: "TazaGo",
      tagline: "Cleaning-сервис по Казахстану",
      city: "Казахстан",
      whatsappLabel: "Подтверждение через WhatsApp",
    },
    nav: {
      home: "Главная",
      services: "Услуги",
      booking: "Заказ",
      dashboard: "Личный кабинет",
      contact: "Контакты",
      admin: "Админ",
    },
    auth: {
      signIn: "Войти",
      signUp: "Регистрация",
      signOut: "Выйти",
      email: "Электронная почта",
      password: "Пароль",
      fullName: "Имя и фамилия",
      phone: "Телефон",
      signInTitle: "Вход в кабинет",
      signInSubtitle: "Следите за заявками и быстро связывайтесь с менеджером.",
      signUpTitle: "Регистрация в TazaGo",
      signUpSubtitle: "Создайте аккаунт один раз и оформляйте следующие уборки заметно быстрее.",
      signInSubmit: "Войти",
      signUpSubmit: "Создать аккаунт",
      noAccount: "Нет аккаунта?",
      hasAccount: "Уже есть аккаунт?",
      authErrorTitle: "Не удалось войти",
      authErrorBody: "Возможно, ссылка устарела. Попробуйте авторизоваться снова.",
      invalidCredentials: "Неверный email или пароль.",
      accountCreated: "Аккаунт создан. Теперь можно войти в кабинет.",
      emailConfirmationRequired:
        "Аккаунт создан, но в Supabase включено подтверждение email. Для MVP его лучше отключить или подтвердить почту.",
      emailNotConfirmed:
        "Email еще не подтвержден. Если в Supabase включен confirm email, сначала нужно подтвердить почту.",
      signInFailed: "Во время входа произошла ошибка. Попробуйте еще раз чуть позже.",
      signUpFailed: "Сейчас не удалось завершить регистрацию. Попробуйте снова.",
      userExists: "Аккаунт с этим email уже есть. Попробуйте войти.",
    },
    home: {
      eyebrow: "Cleaning-сервис по Казахстану",
      title: "Чистый дом, легкий график и все это через TazaGo.",
      description:
        "Уборка квартир, deep clean, офисов, после ремонта, диванов и окон. Стоимость видна заранее, а финальное подтверждение проходит через WhatsApp.",
      primaryCta: "Оформить заказ",
      secondaryCta: "Посмотреть услуги",
      trustBadges: [
        "Работаем по Казахстану",
        "Цены только в тенге",
        "Живой менеджер",
        "Безопасные средства",
      ],
      servicesTitle: "Каталог услуг",
      servicesBody: "У каждой услуги есть цена, длительность, описание и дополнительные услуги.",
      whyTitle: "Почему выбирают нас",
      whyBody:
        "Мы не просто наводим порядок: аккуратная команда, безопасные средства и понятный сервис помогают поддерживать дом в чистоте без лишних хлопот.",
      whyItems: [
        {
          title: "Аккуратные специалисты",
          body: "Команда внимательно проходит по деталям и тщательно убирает кухню, полы и санузлы без спешки.",
        },
        {
          title: "Безопасная уборка",
          body: "Используем подходящие для дома средства и проверенные методы, чтобы сохранить и чистоту, и комфорт.",
        },
        {
          title: "Экономия времени",
          body: "Понятная цена и удобный формат заказа помогают быстро запланировать уборку без лишних созвонов и ожидания.",
        },
      ],
      howItWorksTitle: "Как это работает",
      howItWorks: [
        {
          title: "1. Выбираете услугу",
          body: "Уборка квартиры, deep clean, офис, окна, диваны, post-renovation и другие сценарии.",
        },
        {
          title: "2. Заполняете дату и адрес",
          body: "Указываете удобное временное окно, район и полный адрес.",
        },
        {
          title: "3. Подтверждаете в WhatsApp",
          body: "Менеджер уточняет детали, а финальное подтверждение и оплата идут уже в чате.",
        },
      ],
      testimonialsTitle: "Что говорят клиенты",
      testimonials: [
        {
          name: "Аяулым",
          role: "Алмалинский район",
          quote: "Брали deep clean для квартиры, результат сильный. Заказали на сайте, дальше все быстро добили в WhatsApp.",
        },
        {
          name: "Ермек",
          role: "Офис-менеджер",
          quote: "Удобно следить за статусами из админки. Для MVP логика уже выглядит боевой.",
        },
        {
          name: "Лаура",
          role: "Медеуский район",
          quote: "Добавили духовку и холодильник как допы, цена сразу стала понятной. Никакой путаницы.",
        },
      ],
    },
    services: {
      title: "Каталог услуг",
      body: "У каждой услуги есть цена, длительность, описание и дополнительные услуги.",
      from: "От",
      duration: "Длительность",
      details: "Подробнее",
      addonsTitle: "Дополнительные услуги",
      featureTitle: "Что входит",
      notFound: "Услуга не найдена.",
    },
    booking: {
      title: "Оформление заказа",
      subtitle: "Собираете заявку в шесть шагов, дальше менеджер подтверждает ее в WhatsApp.",
      loginRequiredTitle: "Сначала нужно войти",
      loginRequiredBody: "Чтобы привязать заказ к кабинету, сначала авторизуйтесь.",
      loginRequiredCta: "Перейти ко входу",
      steps: ["Услуга", "Дата и время", "Адрес", "Контакты", "Дополнения", "Проверка"],
      fields: {
        service: "Услуга",
        date: "Дата",
        timeWindow: "Временное окно",
        district: "Район",
        address: "Полный адрес",
        apartmentDetails: "Детали по квартире или дому",
        comment: "Комментарий",
        addons: "Дополнительные услуги",
        fullName: "Имя и фамилия",
        phone: "Телефон",
        email: "Электронная почта",
      },
      review: {
        title: "Проверьте заявку",
        service: "Услуга",
        addons: "Дополнения",
        contact: "Контакт",
        address: "Адрес",
        total: "Итого",
        note: "После отправки заявка сохранится в базе, а затем откроется WhatsApp.",
        emptyAddons: "Дополнительные услуги не выбраны",
      },
      timeWindows: ["09:00 - 12:00", "12:00 - 15:00", "15:00 - 18:00", "18:00 - 21:00"],
      districts: ["Алмалинский", "Бостандыкский", "Медеуский", "Ауэзовский", "Наурызбайский", "Турксибский"],
      buttons: {
        next: "Далее",
        back: "Назад",
        submit: "Отправить в WhatsApp",
        submitting: "Отправляем...",
      },
      validation: {
        required: "Обязательное поле",
        phone: "Введите корректный номер телефона",
        serviceMissing: "Сначала выберите услугу",
      },
      successRedirect: "Заявка сохранена, открываем WhatsApp...",
    },
    dashboard: {
      title: "Личный кабинет",
      subtitle: "Здесь хранятся ваши активные и прошлые заказы.",
      upcoming: "Активные заказы",
      history: "История",
      empty: "Пока заказов нет. Попробуйте оформить первую уборку.",
      lastActivity: "Последнее событие",
      quickContact: "Написать менеджеру",
      reopenWhatsapp: "Открыть WhatsApp снова",
      bookingDetails: "Детали заказа",
    },
    admin: {
      title: "Операционная панель",
      subtitle: "Поиск заказов, смена статусов и ручная отметка оплаты.",
      filters: {
        search: "Номер, клиент или телефон",
        status: "Статус",
        paymentStatus: "Оплата",
        service: "Услуга",
      },
      table: {
        booking: "Заказ",
        client: "Клиент",
        service: "Услуга",
        date: "Дата",
        status: "Статус",
        payment: "Оплата",
        total: "Сумма",
        actions: "Действие",
      },
      notes: "Внутренняя заметка",
      saveStatus: "Сохранить статус",
      savePayment: "Сохранить оплату",
      noAccess: "Эта страница доступна только администратору.",
      empty: "По текущему фильтру заказов нет.",
    },
    contact: {
      title: "Контакты и FAQ",
      subtitle: "Частые вопросы и быстрые способы связи.",
      faqTitle: "Популярные вопросы",
      faq: [
        {
          question: "Как подтверждается заказ?",
          answer: "Вы оставляете заявку на сайте, после чего менеджер уточняет время и состав заказа в WhatsApp.",
        },
        {
          question: "Оплата есть на сайте?",
          answer: "Нет, в MVP-версии оплата принимается вручную в WhatsApp или другим согласованным способом.",
        },
        {
          question: "Можно ли менять состав услуги?",
          answer: "Да, к основной услуге можно добавить духовку, холодильник, балкон, окна и pet-safe режим.",
        },
        {
          question: "В каком городе вы работаете?",
          answer: "Сейчас принимаем заказы по Казахстану.",
        },
      ],
      infoTitle: "Связь",
      infoLines: [
        "По Казахстану, ежедневно с 09:00 до 21:00",
        "Отвечаем в WhatsApp и по звонку",
        "Принимаем частные и корпоративные заказы",
      ],
    },
    footer: {
      rights: "Все права защищены.",
      cityLine: "Cleaning-сервис по Казахстану",
    },
    misc: {
      all: "Все",
      notSpecified: "Не указано",
      loading: "Загрузка...",
      none: "Нет",
    },
    metadata: {
      defaultTitle: "TazaGo",
      description: "Двухъязычный cleaning-сервис по Казахстану: каталог, оформление заказа, личный кабинет и админ-панель.",
    },
  },
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

export function getBookingStatusLabel(locale: Locale, status: BookingStatus) {
  return bookingStatusLabels[locale][status];
}

export function getPaymentStatusLabel(locale: Locale, status: PaymentStatus) {
  return paymentStatusLabels[locale][status];
}

const categoryLabels: Record<Locale, Record<string, string>> = {
  kk: {
    apartment_cleaning: "Пәтер тазалау",
    deep_cleaning: "Терең жинау",
    post_renovation: "Жөндеуден кейінгі жинау",
    move_in_out: "Көшу алдындағы жинау",
    upholstery: "Диван мен кілем тазалау",
    windows: "Терезе жуу",
    office: "Офис тазалау",
    express: "Экспресс жинау",
  },
  ru: {
    apartment_cleaning: "Уборка квартиры",
    deep_cleaning: "Генеральная уборка",
    post_renovation: "После ремонта",
    move_in_out: "Перед заездом или выездом",
    upholstery: "Чистка диванов и ковров",
    windows: "Мойка окон",
    office: "Уборка офиса",
    express: "Экспресс-уборка",
  },
};

const eventLabels: Record<Locale, Record<string, string>> = {
  kk: {
    created: "Өтінім құрылды",
    whatsapp_redirected: "WhatsApp-қа жіберілді",
    status_changed: "Статус жаңартылды",
    payment_status_changed: "Төлем статусы жаңартылды",
  },
  ru: {
    created: "Заявка создана",
    whatsapp_redirected: "Отправлена в WhatsApp",
    status_changed: "Статус обновлен",
    payment_status_changed: "Статус оплаты обновлен",
  },
};

export function getCategoryLabel(locale: Locale, category: string) {
  return categoryLabels[locale][category] ?? category;
}

export function getEventLabel(locale: Locale, eventType: string) {
  return eventLabels[locale][eventType] ?? eventType;
}

export function getLocaleHref(locale: Locale, path = "") {
  return `/${locale}${path}`;
}
