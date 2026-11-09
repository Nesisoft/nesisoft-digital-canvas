/**
 * The app cost calculator's price list and arithmetic, in one place for
 * everything that uses it: the calculator page (src/pages/CostCalculator.tsx),
 * the API that stores a quote request with the estimate the visitor saw
 * (server/src/routes/inquiries.js) and the admin's Pricing tab (saved by
 * server/src/models/estimator.js). Types: shared/estimator.d.ts.
 *
 * Prices are in Ghana cedis. An estimate is
 *
 *   (the project type's base price + each chosen feature's price)
 *     × size × design × pace          (their `factor`s)
 *
 * shown as a range (× spread.low to × spread.high) and rounded. The weeks
 * work the same way with each option's `weeksFactor`.
 *
 * DEFAULT_ESTIMATOR is the starting price list. Once an admin saves prices,
 * the saved list is used instead (GET /api/estimator).
 */

export const DEFAULT_ESTIMATOR = {
  // Cedis per US dollar, for visitors who'd rather see dollars.
  usdRate: 11.6,
  spread: { low: 0.85, high: 1.3 },
  types: [
    {
      id: "website",
      label: "Business website",
      description: "A professional site that presents your business and brings in enquiries, about 5–10 pages.",
      price: 8000,
      weeks: 3,
    },
    {
      id: "ecommerce",
      label: "Online store",
      description: "Product catalogue, cart, checkout with mobile money and cards, and order management.",
      price: 20000,
      weeks: 6,
    },
    {
      id: "webapp",
      label: "Web app or portal",
      description: "A system people sign in to: customer portals, dashboards, school or clinic management.",
      price: 30000,
      weeks: 8,
    },
    {
      id: "mobile",
      label: "Mobile app",
      description: "One app for Android and iOS, built cross-platform and published to both stores.",
      price: 40000,
      weeks: 10,
    },
    {
      id: "mobile-web",
      label: "Mobile app and web platform",
      description: "Android and iOS apps plus a web app or management portal, sharing one backend.",
      price: 60000,
      weeks: 14,
    },
  ],
  sizes: [
    {
      id: "small",
      label: "Small",
      description: "Up to about 10 screens and one kind of user.",
      factor: 0.75,
      weeksFactor: 0.8,
    },
    {
      id: "medium",
      label: "Medium",
      description: "About 10–25 screens and a couple of user types, such as customers and staff.",
      factor: 1,
      weeksFactor: 1,
    },
    {
      id: "large",
      label: "Large",
      description: "25+ screens, several user types and detailed workflows.",
      factor: 1.6,
      weeksFactor: 1.5,
    },
  ],
  // `types` lists the project types a feature is offered for; empty means all.
  features: [
    {
      id: "accounts",
      label: "User accounts and sign-in",
      description: "Sign-up, login and password reset, by email or phone number.",
      price: 4000,
      weeks: 1,
      types: [],
    },
    {
      id: "payments",
      label: "Mobile money and card payments",
      description: "Mobile money on every network, plus Visa and Mastercard.",
      price: 6000,
      weeks: 1,
      types: ["website", "webapp", "mobile", "mobile-web"],
    },
    {
      id: "admin",
      label: "Admin dashboard",
      description: "Manage users, content, orders and settings in one place.",
      price: 8000,
      weeks: 2,
      types: ["webapp", "mobile", "mobile-web"],
    },
    {
      id: "cms",
      label: "Editable pages and blog",
      description: "Update text, photos and news yourself, without a developer.",
      price: 3000,
      weeks: 1,
      types: ["website", "ecommerce"],
    },
    {
      id: "roles",
      label: "User roles and permissions",
      description: "Different access for owners, managers, staff and customers.",
      price: 3000,
      weeks: 0.5,
      types: ["ecommerce", "webapp", "mobile", "mobile-web"],
    },
    {
      id: "notifications",
      label: "SMS, email and push notifications",
      description: "Confirmations, reminders and alerts that reach people on time.",
      price: 3000,
      weeks: 0.5,
      types: [],
    },
    {
      id: "bookings",
      label: "Bookings and scheduling",
      description: "Appointments, reservations or classes, with a calendar.",
      price: 6000,
      weeks: 1.5,
      types: [],
    },
    {
      id: "chat",
      label: "In-app chat",
      description: "Messages between users, or between customers and your team.",
      price: 9000,
      weeks: 2,
      types: ["webapp", "mobile", "mobile-web"],
    },
    {
      id: "maps",
      label: "Maps and live location",
      description: "Show places on a map, track deliveries or find what's nearby.",
      price: 7000,
      weeks: 1.5,
      types: ["webapp", "mobile", "mobile-web"],
    },
    {
      id: "reports",
      label: "Reports and analytics",
      description: "Charts, exports and the numbers you run the business on.",
      price: 6000,
      weeks: 1.5,
      types: ["ecommerce", "webapp", "mobile", "mobile-web"],
    },
    {
      id: "offline",
      label: "Works offline",
      description: "Keeps working on a weak connection and syncs when back online.",
      price: 8000,
      weeks: 2,
      types: ["mobile", "mobile-web"],
    },
    {
      id: "languages",
      label: "More than one language",
      description: "English plus Twi, French or any other language your users need.",
      price: 3000,
      weeks: 1,
      types: [],
    },
    {
      id: "integrations",
      label: "Connections to other systems",
      description: "Accounting, ERP, government or partner APIs you already use.",
      price: 7000,
      weeks: 1.5,
      types: [],
    },
  ],
  designs: [
    {
      id: "template",
      label: "Adapted template",
      description: "Proven layouts styled with your logo and colours.",
      factor: 0.85,
      weeksFactor: 0.85,
    },
    {
      id: "custom",
      label: "Custom design",
      description: "Screens designed for your users and brand, prototyped before we build.",
      factor: 1,
      weeksFactor: 1,
    },
    {
      id: "premium",
      label: "Premium design",
      description: "Brand-led design with illustrations, motion and extra polish.",
      factor: 1.25,
      weeksFactor: 1.15,
    },
  ],
  paces: [
    {
      id: "flexible",
      label: "Flexible",
      description: "No fixed deadline: we fit the work around a steady schedule.",
      factor: 0.95,
      weeksFactor: 1.2,
    },
    {
      id: "standard",
      label: "Standard",
      description: "A steady pace with regular demos along the way.",
      factor: 1,
      weeksFactor: 1,
    },
    {
      id: "fast",
      label: "Fast-tracked",
      description: "A bigger team to meet a firm launch date.",
      factor: 1.25,
      weeksFactor: 0.75,
    },
  ],
};

/** The option lists whose ids are fixed (an admin edits them but can't add or remove any). */
export const FIXED_LISTS = ["sizes", "designs", "paces"];

const byId = (list, id) => list.find((option) => option.id === id);

/** The neutral option (factor 1), or the middle one: what a visitor starts on. */
export function defaultOption(list) {
  return list.find((option) => option.factor === 1) ?? list[Math.floor((list.length - 1) / 2)];
}

/** Whether a feature is offered for a project type. */
export function featureApplies(feature, type) {
  return !feature.types || feature.types.length === 0 || feature.types.includes(type.id);
}

/**
 * A visitor's answers (ids, as in a shared link or a quote request) as the
 * options they name. An unknown type gives `type: null` (nothing to
 * estimate); an unknown size, design or pace falls back to the default; and
 * features that don't exist, or aren't offered for the type, are dropped.
 */
export function resolveSelection(config, input = {}) {
  const type = byId(config.types, input.type) ?? null;
  const wanted = Array.isArray(input.features) ? input.features : [];
  return {
    type,
    size: byId(config.sizes, input.size) ?? defaultOption(config.sizes),
    design: byId(config.designs, input.design) ?? defaultOption(config.designs),
    pace: byId(config.paces, input.pace) ?? defaultOption(config.paces),
    features: type
      ? config.features.filter((f) => wanted.includes(f.id) && featureApplies(f, type))
      : [],
  };
}

/**
 * A price rounded to two significant figures (4,335 → 4,300; 79,300 →
 * 79,000; 213,000 → 210,000), so a range doesn't look more exact than it is.
 */
export function roundPrice(amount) {
  if (!(amount > 0)) return 0;
  const step = 10 ** Math.max(0, Math.floor(Math.log10(amount)) - 1);
  return Math.round(amount / step) * step;
}

const sum = (items, key) => items.reduce((total, item) => total + item[key], 0);

/**
 * The estimate for a resolved selection, or null until a project type is
 * chosen: the price range in cedis and dollars, the weeks, and the base the
 * multipliers were applied to.
 */
export function computeEstimate(config, selection) {
  const { type, size, design, pace, features } = selection;
  if (!type) return null;

  const base = type.price + sum(features, "price");
  const baseWeeks = type.weeks + sum(features, "weeks");
  const price = base * size.factor * design.factor * pace.factor;
  const weeks = baseWeeks * size.weeksFactor * design.weeksFactor * pace.weeksFactor;

  const low = roundPrice(price * config.spread.low);
  const high = roundPrice(price * config.spread.high);
  const weeksLow = Math.max(1, Math.floor(weeks * config.spread.low));
  const weeksHigh = Math.max(weeksLow + 1, Math.ceil(weeks * config.spread.high));
  const rate = config.usdRate > 0 ? config.usdRate : DEFAULT_ESTIMATOR.usdRate;

  return {
    low,
    high,
    usdLow: roundPrice(low / rate),
    usdHigh: roundPrice(high / rate),
    weeksLow,
    weeksHigh,
    base,
  };
}

export const CURRENCY_SYMBOLS = { GHS: "GH₵", USD: "US$" };

/** 52000 → "52,000": the same on the server, in the prerender and in every browser. */
export function formatNumber(amount) {
  return String(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** "GH₵52,000–79,000" or "US$4,500–6,800". */
export function formatRange(estimate, currency = "GHS") {
  const [low, high] = currency === "USD" ? [estimate.usdLow, estimate.usdHigh] : [estimate.low, estimate.high];
  return `${CURRENCY_SYMBOLS[currency] ?? CURRENCY_SYMBOLS.GHS}${formatNumber(low)}–${formatNumber(high)}`;
}

/** "13–21 weeks". */
export function formatWeeks(estimate) {
  return `${estimate.weeksLow}–${estimate.weeksHigh} weeks`;
}

/**
 * The lowest estimate for a project type (its smallest size, simplest
 * design, no added features, at the standard pace): the "from" price.
 */
export function startingEstimate(config, type) {
  const cheapest = (list) => list.reduce((min, option) => (option.factor < min.factor ? option : min));
  return computeEstimate(config, {
    type,
    size: cheapest(config.sizes),
    design: cheapest(config.designs),
    pace: defaultOption(config.paces),
    features: [],
  });
}

/** A project type at the default size, design and pace, with no added features. */
export function typicalEstimate(config, type) {
  return computeEstimate(config, {
    type,
    size: defaultOption(config.sizes),
    design: defaultOption(config.designs),
    pace: defaultOption(config.paces),
    features: [],
  });
}
