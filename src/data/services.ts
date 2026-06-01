import {
  Code2,
  MonitorSmartphone,
  Palette,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface Service {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  fullDescription: string;
  outcome: string;
  image: string;
  icon: LucideIcon;
  features: string[];
  technologies: string[];
  process: string[];
  deliverables: string[];
}

export const services: Service[] = [
  {
    slug: "web-development",
    title: "Web Platform Development",
    shortTitle: "Web platforms",
    description:
      "Fast, secure web applications for customer portals, marketplaces, dashboards, and operational systems.",
    fullDescription:
      "We design and build production-ready web platforms with clear architecture, accessible interfaces, secure APIs, and maintainable frontends. The goal is software your team can confidently use, extend, and operate.",
    outcome: "Launch a reliable product your users can trust.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop",
    icon: MonitorSmartphone,
    features: [
      "Responsive product interfaces",
      "Dashboards and internal tools",
      "Marketplace and portal workflows",
      "API integration and authentication",
      "Performance and accessibility hardening",
      "Deployment and monitoring support",
    ],
    technologies: ["React", "TypeScript", "Node.js", "PostgreSQL", "Tailwind"],
    process: [
      "Scope the product and success metrics",
      "Design the core user journeys",
      "Build in focused delivery cycles",
      "Test performance, accessibility, and edge cases",
      "Launch with monitoring and support",
    ],
    deliverables: [
      "Production frontend",
      "Reusable component system",
      "Admin or dashboard flows",
      "Deployment handoff",
    ],
  },
  {
    slug: "mobile-development",
    title: "Mobile App Development",
    shortTitle: "Mobile apps",
    description:
      "Native and cross-platform mobile apps that work cleanly across devices and real network conditions.",
    fullDescription:
      "We build mobile applications with careful attention to onboarding, speed, offline tolerance, payments, notifications, and the details that make an app feel dependable in everyday use.",
    outcome: "Put a polished product in your customers' hands.",
    image:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=800&fit=crop",
    icon: Code2,
    features: [
      "iOS and Android app development",
      "Cross-platform React Native delivery",
      "Authentication and account flows",
      "Mobile money and payment integrations",
      "Push notifications and analytics",
      "Store-readiness and release support",
    ],
    technologies: ["React Native", "Expo", "Swift", "Kotlin", "Firebase"],
    process: [
      "Define the mobile user journey",
      "Prototype critical screens",
      "Build app modules and integrations",
      "Test across devices and network profiles",
      "Prepare release and post-launch support",
    ],
    deliverables: [
      "Mobile app build",
      "Design system screens",
      "Release checklist",
      "Support plan",
    ],
  },
  {
    slug: "custom-software",
    title: "Custom Software Development",
    shortTitle: "Custom systems",
    description:
      "Purpose-built systems that automate workflows, connect teams, and replace fragile manual processes.",
    fullDescription:
      "We translate business operations into usable software: from workflow mapping and data models to polished interfaces and reliable deployment. The result is a custom system aligned with how your organization actually works.",
    outcome: "Replace manual bottlenecks with software that scales.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop",
    icon: ShieldCheck,
    features: [
      "Business process automation",
      "Role-based access control",
      "Reporting and audit trails",
      "Legacy system modernization",
      "Third-party integrations",
      "Quality assurance and training",
    ],
    technologies: ["Python", "Django", "Node.js", "PostgreSQL", "AWS"],
    process: [
      "Map operational workflows",
      "Prioritize the highest-value automations",
      "Design the information architecture",
      "Build, test, and migrate data carefully",
      "Train users and support adoption",
    ],
    deliverables: [
      "Workflow system",
      "Database and access model",
      "Reporting views",
      "User training materials",
    ],
  },
  {
    slug: "product-design",
    title: "Product Design & Consulting",
    shortTitle: "Product design",
    description:
      "UX strategy, interface design, and technical guidance for teams that need sharper product decisions.",
    fullDescription:
      "We help teams clarify what to build, why it matters, and how it should work before engineering effort is wasted. This includes discovery, UX flows, interface systems, technical planning, and staff enablement.",
    outcome: "Reduce ambiguity before you invest in the build.",
    image:
      "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1200&h=800&fit=crop",
    icon: Palette,
    features: [
      "Product discovery and UX audits",
      "Wireframes and interface systems",
      "Clickable prototypes",
      "Technical architecture guidance",
      "Delivery planning and estimation",
      "Team training and workshops",
    ],
    technologies: ["Figma", "React", "Design Systems", "Analytics", "QA"],
    process: [
      "Audit goals, constraints, and users",
      "Map product flows and information hierarchy",
      "Prototype and validate the core experience",
      "Document the system for build",
      "Support engineering implementation",
    ],
    deliverables: [
      "UX audit",
      "Clickable prototype",
      "Component guidelines",
      "Delivery roadmap",
    ],
  },
];

export function getService(slug: string | undefined) {
  return services.find((service) => service.slug === slug);
}

export const serviceGroups = [
  { icon: MonitorSmartphone, label: "Web & mobile" },
  { icon: ShieldCheck, label: "Custom systems" },
  { icon: Palette, label: "UX design" },
  { icon: Users, label: "Consulting" },
];

