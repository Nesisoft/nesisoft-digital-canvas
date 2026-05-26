export interface Project {
  slug: string;
  name: string;
  category: string;
  type: "Internal platform" | "Client work";
  description: string;
  fullDescription: string;
  image: string;
  gallery: string[];
  technologies: string[];
  features: string[];
  timeline: string;
  teamSize: string;
  status: "Completed" | "In development" | "Beta testing";
  challenge: string;
  solution: string;
  result: string;
}

export const projects: Project[] = [
  {
    slug: "agoo",
    name: "Agoo",
    category: "On-demand platform",
    type: "Internal platform",
    description:
      "An errand-running marketplace connecting service seekers with reliable runners.",
    fullDescription:
      "Agoo helps busy customers delegate errands while giving runners a structured way to earn. The platform focuses on trust, matching, payment clarity, and operational visibility.",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=800&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&h=700&fit=crop",
      "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=900&h=700&fit=crop",
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=900&h=700&fit=crop",
    ],
    technologies: ["React Native", "Node.js", "MongoDB", "Firebase"],
    features: [
      "Runner and customer onboarding",
      "Real-time matching workflow",
      "Location-aware task updates",
      "Ratings and trust signals",
      "Commission-based pricing",
      "Operational dashboard",
    ],
    timeline: "6 months",
    teamSize: "5 specialists",
    status: "In development",
    challenge:
      "The core challenge was creating a trust-driven marketplace that can coordinate errands without overwhelming customers or runners.",
    solution:
      "We structured the experience around clear task states, simple pricing, visible runner accountability, and an operations view for quality control.",
    result:
      "A platform foundation ready for controlled launch, iteration, and location-by-location growth.",
  },
  {
    slug: "sua",
    name: "Sua",
    category: "Education",
    type: "Internal platform",
    description:
      "A tutoring platform that connects parents with trusted teachers for home and virtual learning.",
    fullDescription:
      "Sua makes it easier for parents to find qualified teachers while giving educators a professional channel to manage availability, communication, and student progress.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=800&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&h=700&fit=crop",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&h=700&fit=crop",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&h=700&fit=crop",
    ],
    technologies: ["React", "Django", "PostgreSQL", "WebRTC"],
    features: [
      "Teacher verification",
      "Tutor matching",
      "Virtual classroom support",
      "Flexible scheduling",
      "Parent-teacher messaging",
      "Progress tracking",
    ],
    timeline: "8 months",
    teamSize: "6 specialists",
    status: "Beta testing",
    challenge:
      "Parents need confidence before trusting a platform with education, while teachers need tools that do not add administrative friction.",
    solution:
      "We designed verified profiles, simple discovery, clear scheduling, and progress signals that make trust visible throughout the experience.",
    result:
      "A beta-ready education platform with the right primitives for trust, communication, and measurable learning support.",
  },
  {
    slug: "adesuapa",
    name: "Adesuapa",
    category: "E-learning",
    type: "Internal platform",
    description:
      "An African-centred learning platform with mobile money payments and institutional partnerships.",
    fullDescription:
      "Adesuapa is designed for accessible online learning across African markets, combining course delivery, payment flexibility, and institutional collaboration.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=800&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&h=700&fit=crop",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&h=700&fit=crop",
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=900&h=700&fit=crop",
    ],
    technologies: ["React", "Node.js", "PostgreSQL", "Mobile Money"],
    features: [
      "Course catalogue",
      "Student learning paths",
      "Mobile money checkout",
      "Institutional accounts",
      "Progress reporting",
      "Content administration",
    ],
    timeline: "7 months",
    teamSize: "5 specialists",
    status: "In development",
    challenge:
      "The product needed to support both individual learners and institutions without making the core learning flow feel complex.",
    solution:
      "We separated learner, instructor, and institution workflows while keeping enrolment and payment simple for the end user.",
    result:
      "A focused platform model for African-centred online learning and institutional deployment.",
  },
  {
    slug: "jua",
    name: "Jua",
    category: "E-commerce",
    type: "Internal platform",
    description:
      "A marketplace concept enabling installment payments and B2B trade across Africa.",
    fullDescription:
      "Jua is built around commerce flexibility: marketplace discovery, installment-friendly purchase flows, and operational support for suppliers and buyers.",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=800&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&h=700&fit=crop",
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=900&h=700&fit=crop",
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=900&h=700&fit=crop",
    ],
    technologies: ["React", "Node.js", "PostgreSQL", "Payments"],
    features: [
      "Product listings",
      "Installment purchase flow",
      "Supplier accounts",
      "B2B enquiry flows",
      "Order management",
      "Payment reconciliation",
    ],
    timeline: "6 months",
    teamSize: "5 specialists",
    status: "In development",
    challenge:
      "Commerce workflows needed to support consumer affordability and business procurement without becoming too heavy.",
    solution:
      "We designed clear buying modes, structured supplier data, and payment states that can scale with future financing partners.",
    result:
      "A commerce architecture ready for staged rollout and partner-led expansion.",
  },
  {
    slug: "fintech-app",
    name: "FinTech Mobile App",
    category: "Mobile banking",
    type: "Client work",
    description:
      "A mobile banking app with biometric authentication and AI-assisted financial insights.",
    fullDescription:
      "A full mobile banking experience focused on security, transaction clarity, and helpful customer insight. The build balanced strong controls with a clean, approachable user experience.",
    image:
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&h=800&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=900&h=700&fit=crop",
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&h=700&fit=crop",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&h=700&fit=crop",
    ],
    technologies: ["React Native", "Node.js", "MongoDB", "AI APIs"],
    features: [
      "Biometric authentication",
      "Real-time transaction views",
      "Expense categorization",
      "Financial insights",
      "Multi-currency support",
      "Fraud detection signals",
    ],
    timeline: "12 months",
    teamSize: "8 specialists",
    status: "Completed",
    challenge:
      "The client needed strong security and regulatory discipline without creating an intimidating banking experience.",
    solution:
      "We layered biometric authentication, transaction safeguards, and insight-driven dashboards into a clean mobile experience.",
    result:
      "A completed mobile product with a stronger security posture and a smoother customer experience.",
  },
];

export function getProject(slug: string | undefined) {
  return projects.find((project) => project.slug === slug);
}

export const internalProjects = projects.filter(
  (project) => project.type === "Internal platform"
);

export const clientProjects = projects.filter(
  (project) => project.type === "Client work"
);

