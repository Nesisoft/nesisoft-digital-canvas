import {
  GraduationCap,
  ShoppingBag,
  Sprout,
  Stethoscope,
  Truck,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { Faq } from "./projects";

/**
 * Industry landing pages (/industries/<slug>), written around what people in
 * each sector search for and need. They describe what we build; the proof
 * is the related work, pulled live from the projects (by slug), so keep the
 * `projects` lists pointing at real, published projects.
 */
export interface Industry {
  slug: string;
  /** Short name, e.g. "Healthcare". */
  name: string;
  /** The page's headline. */
  title: string;
  /** Search-facing <title> (before " | Nesisoft"). */
  seoTitle: string;
  /** Meta description, 120–160 characters. */
  seoDescription: string;
  /** One or two sentences for cards. */
  summary: string;
  /** Opening paragraphs, separated by a blank line. */
  intro: string;
  icon: LucideIcon;
  /** What gets in the way, in the sector's own terms. */
  challenges: string[];
  /** What we build for it. */
  solutions: { title: string; description: string }[];
  /** Typical features of what we build. */
  features: string[];
  /** Related services, by slug (src/data/services.ts). */
  services: string[];
  /** Related projects and platforms, by slug. */
  projects: string[];
  faqs: Faq[];
}

export const industries: Industry[] = [
  {
    slug: "education",
    name: "Education",
    title: "School management and e-learning software",
    seoTitle: "School Management & E-Learning Software in Ghana",
    seoDescription:
      "School management systems and e-learning platforms built in Ghana: admissions, mobile money fees, terminal reports, parent updates and online classes.",
    summary:
      "School management systems, e-learning platforms and tutoring apps, with mobile money fees and parent updates.",
    intro:
      "Schools run on records, fees and communication: admissions, class lists, assessments, terminal reports and keeping parents informed. When that lives in spreadsheets and notebooks, staff lose hours and parents lose track.\n\nWe build school management systems and e-learning platforms around how schools here actually work, and we run two education platforms of our own: Sua for tutoring and Adesuapa for online learning.",
    icon: GraduationCap,
    challenges: [
      "Fees tracked by hand, with arrears that are hard to follow up",
      "Terminal reports compiled late from scattered score sheets",
      "Parents who only hear about problems at the end of term",
      "Learning that stops when students can't be in class",
    ],
    solutions: [
      {
        title: "School management systems",
        description:
          "Admissions, classes, attendance, assessments and terminal reports in one place, with roles for heads, teachers and bursars.",
      },
      {
        title: "Fees and payments",
        description:
          "Fee schedules, invoices and receipts, with payments by mobile money and arrears tracking.",
      },
      {
        title: "Parent communication",
        description:
          "SMS and in-app updates on attendance, results and fees, so parents know what's happening.",
      },
      {
        title: "E-learning and tutoring",
        description: "Courses, lessons and progress tracking for online and blended learning.",
      },
    ],
    features: [
      "Student records and admissions",
      "Attendance and timetables",
      "Continuous assessment and exams",
      "Terminal report cards",
      "Fee billing and mobile money",
      "SMS alerts to parents",
      "Staff records",
      "Reports for school leadership",
    ],
    services: ["web-development", "mobile-development", "custom-software"],
    projects: ["sua", "adesuapa"],
    faqs: [
      {
        question: "Can parents pay school fees with mobile money?",
        answer:
          "Yes. Fees can be paid by mobile money or card through a payment provider, and each payment is matched to the student and receipted.",
      },
      {
        question: "Can it produce our terminal reports?",
        answer:
          "Yes. Scores entered by teachers roll up into terminal report cards in your school's format, ready to print or share with parents.",
      },
      {
        question: "Do you build for one school or a group of schools?",
        answer:
          "Both. A system can serve one school, or several campuses with shared reporting for the proprietor or board.",
      },
    ],
  },
  {
    slug: "healthcare",
    name: "Healthcare",
    title: "Hospital and clinic management software",
    seoTitle: "Hospital & Clinic Management Software in Ghana",
    seoDescription:
      "Hospital and clinic management systems built in Ghana: patient records, OPD and appointments, pharmacy, lab, billing and NHIS claims, with role-based access.",
    summary:
      "Hospital and clinic systems for patient records, appointments, pharmacy, lab and billing, including NHIS claims.",
    intro:
      "Clinics and hospitals juggle patient folders, queues, prescriptions, lab results and billing, often across paper and disconnected tools. Every handover is a chance for something to get lost.\n\nWe build hospital and clinic management systems that follow a patient from registration to discharge, keep their records together, and make billing, including insurance claims, easier to manage.",
    icon: Stethoscope,
    challenges: [
      "Paper folders that go missing or arrive late",
      "Long OPD queues and double-booked appointments",
      "Billing and insurance claims that leak revenue",
      "Patient data that has to stay confidential",
    ],
    solutions: [
      {
        title: "Electronic patient records",
        description:
          "One record per patient, from registration and vitals to diagnoses, prescriptions and results.",
      },
      {
        title: "OPD, appointments and queues",
        description: "Booking, triage and queue management, so patients are seen in order.",
      },
      {
        title: "Pharmacy, lab and billing",
        description:
          "Prescriptions, stock, lab requests and results, and itemised bills, with NHIS claims handled alongside cash and other payments.",
      },
      {
        title: "Reports for management",
        description: "Attendance, revenue, stock and disease reports for decisions and reporting.",
      },
    ],
    features: [
      "Patient registration and records",
      "Appointments and OPD queues",
      "Consultations and prescriptions",
      "Laboratory requests and results",
      "Pharmacy and stock",
      "Billing and NHIS claims",
      "Role-based access and audit trails",
      "Management reports",
    ],
    services: ["custom-software", "web-development", "mobile-development"],
    projects: ["hospital-management"],
    faqs: [
      {
        question: "Can it handle NHIS claims?",
        answer:
          "Yes. Services and medicines can be marked for NHIS, and claims are prepared from the records already in the system, alongside cash and other payments.",
      },
      {
        question: "How is patient data kept confidential?",
        answer:
          "Staff only see what their role needs, every change is logged, and data is encrypted in transit. We'll also work with you on the requirements of Ghana's Data Protection Act.",
      },
      {
        question: "Can we start with one department?",
        answer:
          "Yes. Many facilities start with records and OPD, then add pharmacy, lab and billing. The system is built to grow module by module.",
      },
    ],
  },
  {
    slug: "fintech",
    name: "Fintech",
    title: "Fintech and mobile money app development",
    seoTitle: "Fintech & Mobile Money App Development in Ghana",
    seoDescription:
      "Fintech apps built in Ghana: mobile banking, wallets, savings and susu, lending and payments, with mobile money, strong security and clear transaction records.",
    summary:
      "Mobile banking, wallets, savings and lending apps, built around mobile money and strong security.",
    intro:
      "Money here moves through mobile money as much as through banks, and customers expect to save, borrow and pay from their phones. They also expect it to be safe.\n\nWe build fintech products, from mobile banking and wallets to savings, susu and lending apps, with the security, audit trails and transaction clarity that financial products need.",
    icon: Wallet,
    challenges: [
      "Customers who need to trust an app with their money",
      "Payments spread across mobile money, cards and banks",
      "Reconciling transactions without errors",
      "Fraud and account security",
    ],
    solutions: [
      {
        title: "Mobile banking and wallets",
        description: "Account views, transfers, bill payments and statements, on Android and iOS.",
      },
      {
        title: "Savings, susu and lending",
        description: "Savings goals, group savings, loan applications and repayment schedules.",
      },
      {
        title: "Payments and collections",
        description: "Mobile money and card payments, payment links and collections for businesses.",
      },
      {
        title: "Back office",
        description: "Admin dashboards for customer support, reconciliation and reporting.",
      },
    ],
    features: [
      "Secure sign-in with biometrics",
      "Mobile money and card payments",
      "Transfers and bill payments",
      "Savings and loan products",
      "Transaction history and statements",
      "Know-your-customer (KYC) onboarding",
      "Limits and alerts on unusual activity",
      "Reconciliation and reporting",
    ],
    services: ["mobile-development", "web-development", "custom-software"],
    projects: ["fintech-app", "jua"],
    faqs: [
      {
        question: "Can our app accept mobile money?",
        answer:
          "Yes. Apps can take payments and make payouts by MTN MoMo and the other mobile money networks, as well as cards, through a licensed payment provider.",
      },
      {
        question: "How do you secure financial apps?",
        answer:
          "With biometric and two-step sign-in, encrypted connections, limits and alerts on unusual activity, and an audit trail of every transaction.",
      },
      {
        question: "Do you help with regulatory requirements?",
        answer:
          "We build to the requirements you share and work alongside your compliance team, including on the Bank of Ghana guidance that applies to your product.",
      },
    ],
  },
  {
    slug: "ecommerce",
    name: "E-commerce",
    title: "E-commerce website and app development",
    seoTitle: "E-Commerce Website & App Development in Ghana",
    seoDescription:
      "Online stores, marketplaces and shopping apps built in Ghana, with mobile money checkout, inventory, order management and delivery tracking.",
    summary:
      "Online stores, marketplaces and shopping apps with mobile money checkout, inventory and delivery.",
    intro:
      "Customers increasingly shop online, but a store only works if checkout is easy, stock is right and orders arrive. Orders taken over social media DMs and tracked in spreadsheets don't scale.\n\nWe build online stores, multi-vendor marketplaces and shopping apps that take payment the way customers prefer and keep orders, stock and deliveries in one place.",
    icon: ShoppingBag,
    challenges: [
      "Orders scattered across WhatsApp, Instagram and phone calls",
      "Checkout that loses customers who want to pay by mobile money",
      "Stock that doesn't match what's online",
      "Deliveries customers can't track",
    ],
    solutions: [
      {
        title: "Online stores",
        description: "A fast storefront with your catalogue, search, cart and checkout.",
      },
      {
        title: "Marketplaces",
        description: "Multi-vendor platforms with seller accounts, commissions and payouts.",
      },
      {
        title: "Shopping apps",
        description: "Android and iOS apps with saved carts, order history and notifications.",
      },
      {
        title: "Order and stock management",
        description: "Inventory, order processing, delivery assignment and customer updates.",
      },
    ],
    features: [
      "Product catalogue and search",
      "Mobile money and card checkout",
      "Inventory across shops",
      "Order management",
      "Delivery tracking",
      "Discounts and promotions",
      "Seller accounts and payouts",
      "Sales reports",
    ],
    services: ["web-development", "mobile-development", "product-design"],
    projects: ["retail-ecommerce", "jua"],
    faqs: [
      {
        question: "Can customers pay with mobile money?",
        answer:
          "Yes. Checkout can take mobile money and cards through a payment provider, with orders confirmed as soon as payment goes through.",
      },
      {
        question: "Can you build a marketplace for many sellers?",
        answer:
          "Yes. Sellers get their own accounts to manage products and orders, and the platform handles commissions and payouts.",
      },
      {
        question: "Can it work with our physical shops?",
        answer:
          "Yes. Stock and sales can be shared between your online store and your shops, so what's online matches what's on the shelf.",
      },
    ],
  },
  {
    slug: "logistics",
    name: "Logistics",
    title: "Logistics and fleet management software",
    seoTitle: "Logistics & Fleet Management Software in Ghana",
    seoDescription:
      "Logistics software built in Ghana: delivery and dispatch apps, live fleet tracking, route assignment, proof of delivery and dashboards for operations.",
    summary:
      "Delivery, dispatch and fleet systems with live tracking, route assignment and proof of delivery.",
    intro:
      "Deliveries depend on knowing where every vehicle and parcel is, and on drivers and customers having the same information. Phone calls and paper waybills can't keep up as volumes grow.\n\nWe build delivery and fleet platforms that assign jobs, track progress live and capture proof of delivery, with dashboards that show operations at a glance.",
    icon: Truck,
    challenges: [
      "Not knowing where vehicles or parcels are",
      "Dispatch done by phone",
      "Disputes over whether an item was delivered",
      "No clear view of costs and performance",
    ],
    solutions: [
      {
        title: "Dispatch and route assignment",
        description: "Assign jobs to drivers or riders, plan routes and rebalance as the day changes.",
      },
      {
        title: "Driver and rider apps",
        description: "Job lists, navigation, status updates and proof of delivery from the road.",
      },
      {
        title: "Live tracking",
        description: "Vehicle and delivery tracking for your team, and status updates for customers.",
      },
      {
        title: "Operations dashboards",
        description: "Deliveries, delays, costs and driver performance in one view.",
      },
    ],
    features: [
      "Job and order intake",
      "Route assignment",
      "Live GPS tracking",
      "Driver mobile app",
      "Proof of delivery (photo or signature)",
      "Customer notifications",
      "Fuel and maintenance records",
      "Performance reports",
    ],
    services: ["mobile-development", "web-development", "custom-software"],
    projects: ["logistics-fleet", "agoo"],
    faqs: [
      {
        question: "Can customers track their deliveries?",
        answer: "Yes. Customers can get status updates by SMS or a tracking link as their delivery moves.",
      },
      {
        question: "What counts as proof of delivery?",
        answer:
          "Drivers can capture a photo, a signature or a code from the recipient, saved with the time and location.",
      },
      {
        question: "Will it work on our drivers' phones?",
        answer: "Yes. The driver app runs on Android phones and is built to cope with patchy network coverage.",
      },
    ],
  },
  {
    slug: "agriculture",
    name: "Agriculture",
    title: "Agritech software development",
    seoTitle: "Agritech & Farm Marketplace Software in Ghana",
    seoDescription:
      "Agritech software built in Ghana: farmer-to-buyer marketplaces, farm records, pricing and logistics, with USSD and SMS for farmers without smartphones.",
    summary:
      "Marketplaces linking farmers to buyers, farm records and input supply, reachable by USSD and SMS too.",
    intro:
      "Farmers lose value between the farm and the market: middlemen, uncertain prices and produce that spoils waiting for transport. Many also don't have smartphones or steady data.\n\nWe build agritech platforms that connect farmers to buyers, share prices and organise logistics, reaching farmers by app, USSD or SMS.",
    icon: Sprout,
    challenges: [
      "Farmers who can't reach buyers directly",
      "Prices that change and aren't shared",
      "Produce lost waiting for transport",
      "Farmers without smartphones or reliable data",
    ],
    solutions: [
      {
        title: "Farmer-to-buyer marketplaces",
        description: "Listings, orders and payments that connect farmers, aggregators and buyers.",
      },
      {
        title: "Farm and input records",
        description: "Farmer profiles, farm sizes, inputs and harvests, for cooperatives and programmes.",
      },
      {
        title: "Prices and market information",
        description: "Prices and alerts shared with farmers by app or SMS.",
      },
      {
        title: "USSD and SMS access",
        description: "Key features available on basic phones, without data.",
      },
    ],
    features: [
      "Farmer and buyer accounts",
      "Produce listings and orders",
      "Mobile money payments",
      "Price information and alerts",
      "Logistics and pickup scheduling",
      "Cooperative and input records",
      "USSD and SMS access",
      "Reports for programmes and buyers",
    ],
    services: ["web-development", "mobile-development", "custom-software"],
    projects: ["agritech-marketplace"],
    faqs: [
      {
        question: "Can farmers without smartphones use it?",
        answer:
          "Yes. Key features can work over USSD and SMS on basic phones, alongside the app for those who have smartphones.",
      },
      {
        question: "How do farmers get paid?",
        answer:
          "By mobile money, with payments recorded against each order so farmers and buyers can see what was paid and when.",
      },
      {
        question: "Can it support a cooperative or a farmer programme?",
        answer:
          "Yes. Cooperatives and programmes can register farmers, track inputs and harvests, and report on their members.",
      },
    ],
  },
];

export function getIndustry(slug: string | undefined) {
  return industries.find((industry) => industry.slug === slug);
}
