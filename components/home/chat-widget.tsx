"use client";

import { MessageCircle, Send, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { formatPrice } from "@/lib/format";
import type { CatalogService, Locale } from "@/types/app";

type QuickAction = {
  id: string;
  label: string;
  kind: "intent" | "service" | "confirm" | "navigate";
  value?: string;
  href?: string;
  primary?: boolean;
};

type Message = {
  id: number;
  role: "assistant" | "user";
  text: string;
  actions?: QuickAction[];
};

type FlowState =
  | { mode: "menu"; selectedServiceSlug: null }
  | { mode: "service_selected"; selectedServiceSlug: string }
  | { mode: "confirming"; selectedServiceSlug: string };

type ChatWidgetProps = {
  locale: Locale;
  services: CatalogService[];
  isAuthenticated: boolean;
  bookingUrl: string;
  signUpUrl: string;
  signInUrl?: string;
};

type ChatCopy = {
  title: string;
  subtitle: string;
  welcome: string;
  placeholder: string;
  ariaLabel: string;
  menu: {
    services: string;
    prices: string;
    help: string;
    order: string;
  };
  chooseService: string;
  chooseAnother: string;
  allServices: string;
  mainMenu: string;
  details: string;
  orderCurrent: string;
  yes: string;
  no: string;
  pricesIntro: string;
  servicesIntro: string;
  helpIntro: string;
  noServiceSelected: string;
  confirmQuestion: string;
  goToBooking: string;
  goToSignup: string;
  goToSignin: string;
  signInCta: string;
  fallback: string;
  loginPrompt: string;
};

function getChatCopy(locale: Locale): ChatCopy {
  if (locale === "kk") {
    return {
      title: "Чат",
      subtitle: "Қажетті бөлімді таңдаңыз",
      welcome:
        "Сәлем! Мен қызметті таңдауға, бағасын көрсетуге және тапсырысқа өтуге көмектесемін. Неден бастаймыз?",
      placeholder: "Хабарлама жазыңыз...",
      ariaLabel: "Чатты ашу",
      menu: {
        services: "Қызметтер",
        prices: "Бағалар",
        help: "Таңдауға көмектесу",
        order: "Рәсімдеу",
      },
      chooseService: "Қызметті таңдау",
      chooseAnother: "Басқасын таңдау",
      allServices: "Барлық қызмет",
      mainMenu: "Басты мәзір",
      details: "Толығырақ",
      orderCurrent: "Рәсімдеу",
      yes: "Иә",
      no: "Жоқ",
      pricesIntro: "Қазір жиі таңдалатын қызметтердің бастапқы бағалары:",
      servicesIntro: "Қолжетімді қызметтер тізімі. Қайсысын ашып көрсетейін?",
      helpIntro: "Өзіңізге ыңғайлы нұсқаны таңдаңыз немесе қызмет атауын жазыңыз.",
      noServiceSelected: "Алдымен қай қызмет керек екенін таңдап алайық.",
      confirmQuestion: "Осы қызметті аламыз ба? Иә десеңіз, келесі қадамға өткіземін.",
      goToBooking: "Тамаша, қазір рәсімдеу бетіне өткіземін.",
      goToSignup: "Тамаша, алдымен тіркелу бетін ашамын, сосын рәсімдеуге қайтарамын.",
      goToSignin: "Аккаунтыңыз бар болса, кіру бетін ашып беремін.",
      signInCta: "Кіру",
      fallback:
        "Түсіндім. Қызметтерді көрсете аламын, бағасын айта аламын немесе бірден рәсімдеуге өткіземін.",
      loginPrompt: "Егер аккаунтыңыз бұрыннан бар болса, кіру бетіне де өте аласыз.",
    };
  }

  return {
    title: "Чат",
    subtitle: "Выберите, с чем помочь",
    welcome:
      "Здравствуйте! Я помогу выбрать услугу, показать цены и перевести вас к оформлению заказа. С чего начнём?",
    placeholder: "Напишите сообщение...",
    ariaLabel: "Открыть чат",
    menu: {
      services: "Услуги",
      prices: "Цены",
      help: "Помочь выбрать",
      order: "Оформить",
    },
    chooseService: "Выбрать услугу",
    chooseAnother: "Выбрать другую",
    allServices: "Все услуги",
    mainMenu: "Главное меню",
    details: "Подробнее",
    orderCurrent: "Оформить",
    yes: "Да",
    no: "Нет",
    pricesIntro: "Сейчас по популярным услугам такие стартовые цены:",
    servicesIntro: "Вот доступные услуги. Какую открыть подробнее?",
    helpIntro: "Выберите вариант ниже или напишите название услуги, и я сразу подскажу по ней.",
    noServiceSelected: "Сначала давайте выберем услугу, а потом переведу вас к оформлению.",
    confirmQuestion: "Берёте эту услугу? Если да, переведу вас на следующий шаг.",
    goToBooking: "Отлично, перевожу вас на страницу оформления.",
    goToSignup: "Отлично, сначала открою регистрацию, а потом верну вас к оформлению.",
    goToSignin: "Если аккаунт уже есть, могу сразу открыть страницу входа.",
    signInCta: "Войти",
    fallback:
      "Понял вас. Я могу показать услуги, назвать цены или сразу помочь перейти к оформлению.",
    loginPrompt: "Если у вас уже есть аккаунт, можно сразу перейти ко входу.",
  };
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[!?.,/\\()[\]{}:;"'`~@#$%^&*_+=<>|-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildBookingTarget(bookingUrl: string, serviceSlug: string) {
  return `${bookingUrl}?service=${encodeURIComponent(serviceSlug)}`;
}

function buildSignUpTarget(signUpUrl: string, bookingTarget: string) {
  return `${signUpUrl}?next=${encodeURIComponent(bookingTarget)}`;
}

function buildSignInTarget(signInUrl: string, bookingTarget: string) {
  return `${signInUrl}?next=${encodeURIComponent(bookingTarget)}`;
}

function createMenuActions(copy: ChatCopy): QuickAction[] {
  return [
    { id: "menu-services", label: copy.menu.services, kind: "intent", value: "services", primary: true },
    { id: "menu-prices", label: copy.menu.prices, kind: "intent", value: "prices" },
    { id: "menu-help", label: copy.menu.help, kind: "intent", value: "help" },
    { id: "menu-order", label: copy.menu.order, kind: "intent", value: "order" },
  ];
}

function createServiceActions(services: CatalogService[]): QuickAction[] {
  return services.map((service) => ({
    id: `service-${service.slug}`,
    label: service.title,
    kind: "service",
    value: service.slug,
  }));
}

function createServiceDetailActions(copy: ChatCopy): QuickAction[] {
  return [
    { id: "detail-order", label: copy.orderCurrent, kind: "intent", value: "order_selected", primary: true },
    { id: "detail-other", label: copy.chooseAnother, kind: "intent", value: "services" },
    { id: "detail-all", label: copy.allServices, kind: "intent", value: "services" },
    { id: "detail-menu", label: copy.mainMenu, kind: "intent", value: "menu" },
  ];
}

function createConfirmationActions(copy: ChatCopy): QuickAction[] {
  return [
    { id: "confirm-yes", label: copy.yes, kind: "confirm", value: "yes", primary: true },
    { id: "confirm-no", label: copy.no, kind: "confirm", value: "no" },
  ];
}

function createFallbackActions(copy: ChatCopy, signInTarget?: string): QuickAction[] {
  const actions = createMenuActions(copy);
  if (signInTarget) {
    actions.push({
      id: "fallback-signin",
      label: copy.signInCta,
      kind: "navigate",
      href: signInTarget,
    });
  }
  return actions;
}

function getServicePreview(service: CatalogService, locale: Locale) {
  const features = service.features.slice(0, 3).map((feature) => `• ${feature}`).join("\n");

  return [
    `${service.title}`,
    service.summary,
    `${locale === "kk" ? "Бастапқы баға" : "Стартовая цена"}: ${formatPrice(service.basePriceKzt, locale)}`,
    features ? `${locale === "kk" ? "Не кіреді" : "Что входит"}:\n${features}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function findServiceMatch(query: string, services: CatalogService[]) {
  return (
    services.find((service) => {
      const title = normalizeText(service.title);
      const slug = normalizeText(service.slug.replace(/-/g, " "));
      return (title.length > 2 && query.includes(title)) || query.includes(slug);
    }) ?? null
  );
}

function getIntent(query: string, locale: Locale) {
  const serviceWords =
    locale === "kk"
      ? ["қызмет", "қызметтер", "не бар", "қандай"]
      : ["услуг", "услуга", "услуги", "что есть", "какие"];
  const priceWords =
    locale === "kk"
      ? ["баға", "бағасы", "қанша", "тг", "теңге", "құны"]
      : ["цена", "цены", "стоимость", "сколько", "тг", "тенге"];
  const helpWords =
    locale === "kk"
      ? ["көмек", "көмектес", "таңдау", "ұсын", "подобрать"]
      : ["помоги", "помочь", "подобрать", "выбрать", "посоветуй"];
  const orderWords =
    locale === "kk"
      ? ["тапсырыс", "рәсімдеу", "алу", "бронь"]
      : ["заказ", "оформить", "беру", "бронь"];
  const loginWords =
    locale === "kk"
      ? ["кіру", "аккаунт", "тіркелгенмін"]
      : ["войти", "логин", "аккаунт", "зарегистрирован"];

  if (priceWords.some((word) => query.includes(word))) return "prices";
  if (serviceWords.some((word) => query.includes(word))) return "services";
  if (helpWords.some((word) => query.includes(word))) return "help";
  if (orderWords.some((word) => query.includes(word))) return "order";
  if (loginWords.some((word) => query.includes(word))) return "signin";

  return "unknown";
}

function isPositiveAnswer(query: string, locale: Locale) {
  const words = locale === "kk" ? ["иә", "ия", "аламыз", "келісемін"] : ["да", "беру", "берем", "согласен"];
  return words.some((word) => query === word || query.startsWith(`${word} `) || query.endsWith(` ${word}`));
}

function isNegativeAnswer(query: string, locale: Locale) {
  const words = locale === "kk" ? ["жоқ", "жок", "керек емес", "басқа"] : ["нет", "не надо", "другая", "другое"];
  return words.some((word) => query === word || query.includes(word));
}

export function ChatWidget({
  locale,
  services,
  isAuthenticated,
  bookingUrl,
  signUpUrl,
  signInUrl,
}: ChatWidgetProps) {
  const router = useRouter();
  const copy = useMemo(() => getChatCopy(locale), [locale]);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const nextIdRef = useRef(2);
  const [flow, setFlow] = useState<FlowState>({ mode: "menu", selectedServiceSlug: null });
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: 1,
      role: "assistant",
      text: copy.welcome,
      actions: createMenuActions(copy),
    },
  ]);

  const selectedService = useMemo(
    () => services.find((service) => service.slug === flow.selectedServiceSlug) ?? null,
    [flow.selectedServiceSlug, services]
  );
  const bookingTarget = selectedService ? buildBookingTarget(bookingUrl, selectedService.slug) : bookingUrl;
  const signInTarget = !isAuthenticated && signInUrl ? buildSignInTarget(signInUrl, bookingTarget) : undefined;

  function appendMessages(
    items: Array<Omit<Message, "id">>,
    nextFlow?: FlowState
  ) {
    setMessages((current) => [
      ...current,
      ...items.map((item) => ({
        ...item,
        id: nextIdRef.current++,
      })),
    ]);

    if (nextFlow) {
      setFlow(nextFlow);
    }
  }

  function showMainMenu(userLabel?: string) {
    appendMessages(
      [
        ...(userLabel ? [{ role: "user" as const, text: userLabel }] : []),
        {
          role: "assistant",
          text: copy.welcome,
          actions: createMenuActions(copy),
        },
      ],
      { mode: "menu", selectedServiceSlug: null }
    );
  }

  function showServices(userLabel?: string) {
    appendMessages(
      [
        ...(userLabel ? [{ role: "user" as const, text: userLabel }] : []),
        {
          role: "assistant",
          text: copy.servicesIntro,
          actions: createServiceActions(services),
        },
      ],
      { mode: "menu", selectedServiceSlug: null }
    );
  }

  function showPrices(userLabel?: string) {
    const preview = services
      .slice(0, 5)
      .map((service) => `${service.title} — ${formatPrice(service.basePriceKzt, locale)}`)
      .join("\n");

    appendMessages(
      [
        ...(userLabel ? [{ role: "user" as const, text: userLabel }] : []),
        {
          role: "assistant",
          text: `${copy.pricesIntro}\n\n${preview}`,
          actions: [
            { id: "prices-choose", label: copy.chooseService, kind: "intent", value: "services", primary: true },
            { id: "prices-menu", label: copy.mainMenu, kind: "intent", value: "menu" },
          ],
        },
      ],
      { mode: "menu", selectedServiceSlug: null }
    );
  }

  function showHelp(userLabel?: string) {
    appendMessages(
      [
        ...(userLabel ? [{ role: "user" as const, text: userLabel }] : []),
        {
          role: "assistant",
          text: copy.helpIntro,
          actions: [
            ...createServiceActions(services.slice(0, 4)),
            { id: "help-all", label: copy.allServices, kind: "intent", value: "services" },
          ],
        },
      ],
      { mode: "menu", selectedServiceSlug: null }
    );
  }

  function showServiceDetails(service: CatalogService, userLabel?: string) {
    appendMessages(
      [
        ...(userLabel ? [{ role: "user" as const, text: userLabel }] : []),
        {
          role: "assistant",
          text: getServicePreview(service, locale),
          actions: createServiceDetailActions(copy),
        },
      ],
      { mode: "service_selected", selectedServiceSlug: service.slug }
    );
  }

  function askForConfirmation(userLabel?: string) {
    if (!selectedService) {
      appendMessages(
        [
          ...(userLabel ? [{ role: "user" as const, text: userLabel }] : []),
          {
            role: "assistant",
            text: copy.noServiceSelected,
            actions: createServiceActions(services),
          },
        ],
        { mode: "menu", selectedServiceSlug: null }
      );
      return;
    }

    appendMessages(
      [
        ...(userLabel ? [{ role: "user" as const, text: userLabel }] : []),
        {
          role: "assistant",
          text: `${selectedService.title}\n\n${copy.confirmQuestion}`,
          actions: createConfirmationActions(copy),
        },
      ],
      { mode: "confirming", selectedServiceSlug: selectedService.slug }
    );
  }

  function goToNextStep(userLabel?: string) {
    if (!selectedService) {
      showServices(userLabel);
      return;
    }

    const nextBookingTarget = buildBookingTarget(bookingUrl, selectedService.slug);
    const target = isAuthenticated ? nextBookingTarget : buildSignUpTarget(signUpUrl, nextBookingTarget);
    const assistantText = isAuthenticated ? copy.goToBooking : copy.goToSignup;

    appendMessages(
      [
        ...(userLabel ? [{ role: "user" as const, text: userLabel }] : []),
        {
          role: "assistant",
          text: assistantText,
        },
      ],
      { mode: "service_selected", selectedServiceSlug: selectedService.slug }
    );

    window.setTimeout(() => {
      router.push(target);
    }, 150);
  }

  function handleAction(action: QuickAction) {
    if (action.kind === "navigate" && action.href) {
      appendMessages(
        [
          { role: "user", text: action.label },
          { role: "assistant", text: copy.goToSignin },
        ],
        flow
      );
      window.setTimeout(() => {
        router.push(action.href!);
      }, 150);
      return;
    }

    if (action.kind === "service" && action.value) {
      const service = services.find((item) => item.slug === action.value);
      if (service) {
        showServiceDetails(service, action.label);
      }
      return;
    }

    if (action.kind === "confirm") {
      if (action.value === "yes") {
        goToNextStep(action.label);
        return;
      }

      showServices(action.label);
      return;
    }

    switch (action.value) {
      case "services":
        showServices(action.label);
        break;
      case "prices":
        showPrices(action.label);
        break;
      case "help":
        showHelp(action.label);
        break;
      case "order":
      case "order_selected":
        askForConfirmation(action.label);
        break;
      case "menu":
      default:
        showMainMenu(action.label);
        break;
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const rawValue = input.trim();
    if (!rawValue) return;

    const normalized = normalizeText(rawValue);
    setInput("");

    if (flow.mode === "confirming") {
      if (isPositiveAnswer(normalized, locale)) {
        goToNextStep(rawValue);
        return;
      }

      if (isNegativeAnswer(normalized, locale)) {
        showServices(rawValue);
        return;
      }
    }

    const matchedService = findServiceMatch(normalized, services);
    if (matchedService) {
      showServiceDetails(matchedService, rawValue);
      return;
    }

    const intent = getIntent(normalized, locale);

    if (intent === "prices") {
      showPrices(rawValue);
      return;
    }

    if (intent === "services") {
      showServices(rawValue);
      return;
    }

    if (intent === "help") {
      showHelp(rawValue);
      return;
    }

    if (intent === "order") {
      askForConfirmation(rawValue);
      return;
    }

    if (intent === "signin" && signInTarget) {
      appendMessages(
        [
          { role: "user", text: rawValue },
          {
            role: "assistant",
            text: `${copy.loginPrompt}\n\n${copy.goToSignin}`,
            actions: [
              {
                id: "text-signin",
                label: copy.signInCta,
                kind: "navigate",
                href: signInTarget,
                primary: true,
              },
              { id: "text-menu", label: copy.mainMenu, kind: "intent", value: "menu" },
            ],
          },
        ],
        flow
      );
      return;
    }

    appendMessages(
      [
        { role: "user", text: rawValue },
        {
          role: "assistant",
          text: copy.fallback,
          actions: createFallbackActions(copy, signInTarget),
        },
      ],
      { mode: "menu", selectedServiceSlug: null }
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 md:bottom-8 md:right-8">
      {open ? (
        <div className="w-[min(25rem,calc(100vw-2rem))] overflow-hidden rounded-[1.75rem] border border-white/60 bg-white shadow-[0_28px_80px_rgba(47,51,52,0.18)] backdrop-blur-xl">
          <div className="flex items-center justify-between bg-[var(--color-primary)] px-4 py-3 text-white">
            <div>
              <div className="font-[family-name:var(--font-manrope)] text-lg font-extrabold">{copy.title}</div>
              <div className="text-xs text-white/80">{copy.subtitle}</div>
            </div>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[26rem] space-y-3 overflow-y-auto bg-[var(--color-surface-container-low)] p-4">
            {messages.map((message) => (
              <div key={message.id} className={message.role === "assistant" ? "space-y-3" : "space-y-0"}>
                <div
                  className={
                    message.role === "assistant"
                      ? "max-w-[88%] whitespace-pre-line rounded-[1.25rem] rounded-bl-md bg-white px-4 py-3 text-sm leading-6 text-[var(--color-on-surface)] shadow-[var(--shadow-cloud)]"
                      : "ml-auto max-w-[88%] whitespace-pre-line rounded-[1.25rem] rounded-br-md bg-[var(--color-primary)] px-4 py-3 text-sm leading-6 text-white"
                  }
                >
                  {message.text}
                </div>

                {message.role === "assistant" && message.actions?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {message.actions.map((action) => (
                      <button
                        key={action.id}
                        type="button"
                        onClick={() => handleAction(action)}
                        className={[
                          "rounded-full px-3 py-2 text-left text-xs font-semibold transition",
                          action.primary
                            ? "bg-[var(--color-primary)] text-white shadow-[0_14px_30px_rgba(0,96,176,0.2)]"
                            : "border border-[var(--color-outline-variant)]/50 bg-white text-[var(--color-on-surface)]",
                        ].join(" ")}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <form className="flex items-center gap-2 border-t border-black/5 p-3" onSubmit={handleSubmit}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="min-w-0 flex-1 rounded-[1rem] border border-[var(--color-outline-variant)]/50 bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
              placeholder={copy.placeholder}
            />
            <button
              type="submit"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-[0_14px_30px_rgba(0,96,176,0.22)]"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        aria-label={copy.ariaLabel}
        className="mt-3 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-[0_20px_50px_rgba(0,96,176,0.28)] transition hover:-translate-y-0.5"
        onClick={() => setOpen((current) => !current)}
      >
        <MessageCircle className="h-7 w-7" />
      </button>
    </div>
  );
}
