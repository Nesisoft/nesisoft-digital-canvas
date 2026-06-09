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
  {
    slug: "retail-ecommerce",
    name: "Retail E-Commerce Platform",
    category: "E-commerce",
    type: "Client work",
    description:
      "A multi-store online shop with local payment options and reliable order fulfilment.",
    fullDescription:
      "A retail client needed to sell online without the checkout drop-off and delivery confusion that hurts conversion locally. We built a fast storefront, integrated local payment gateways, and gave the team clear tools to manage stock and orders.",
    image:
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=800&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=900&h=700&fit=crop",
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&h=700&fit=crop",
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=900&h=700&fit=crop",
    ],
    technologies: ["Next.js", "Node.js", "PostgreSQL", "Paystack"],
    features: [
      "Fast, mobile-first storefront",
      "Local payment gateways",
      "Inventory and stock control",
      "Order and fulfilment tracking",
      "Discounts and promotions",
      "Sales and product reporting",
    ],
    timeline: "9 months",
    teamSize: "7 specialists",
    status: "Completed",
    challenge:
      "Customers were abandoning checkout because payment and delivery felt uncertain, and the team had no single view of stock or orders.",
    solution:
      "We streamlined checkout around trusted local payment methods, made delivery status visible, and built an operations dashboard for inventory and orders.",
    result:
      "A launched storefront with fewer abandoned carts and a back office the team can run day to day.",
  },
  {
    slug: "hospital-management",
    name: "Hospital Management System",
    category: "Healthcare",
    type: "Client work",
    description:
      "A clinic and hospital system covering patient records, appointments, and billing.",
    fullDescription:
      "A healthcare provider was running on paper and disconnected spreadsheets. We delivered a secure system that ties patient records, scheduling, and billing together so staff spend less time on admin and more time with patients.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&h=700&fit=crop",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&h=700&fit=crop",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&h=700&fit=crop",
    ],
    technologies: ["React", "Django", "PostgreSQL", "Redis"],
    features: [
      "Electronic patient records",
      "Appointment scheduling",
      "Billing and invoicing",
      "Pharmacy and inventory",
      "Role-based staff access",
      "Reporting for management",
    ],
    timeline: "11 months",
    teamSize: "8 specialists",
    status: "Completed",
    challenge:
      "Records were scattered across paper and spreadsheets, making patient history slow to find and billing error-prone.",
    solution:
      "We centralised records with strict role-based access, connected scheduling to billing, and kept the interface simple enough for busy staff.",
    result:
      "A deployed system that cut administrative time and gave management a clear view of operations.",
  },
  {
    slug: "logistics-fleet",
    name: "Logistics & Fleet Dashboard",
    category: "Logistics",
    type: "Client work",
    description:
      "A delivery and fleet platform with live tracking, route assignment, and proof of delivery.",
    fullDescription:
      "A logistics client needed visibility over a growing fleet and a way to coordinate deliveries without endless phone calls. We built dispatch tools, live tracking, and driver and customer apps that keep everyone informed.",
    image:
      "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=1200&h=800&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=900&h=700&fit=crop",
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&h=700&fit=crop",
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=900&h=700&fit=crop",
    ],
    technologies: ["React", "React Native", "Node.js", "PostgreSQL", "Mapbox"],
    features: [
      "Live vehicle tracking",
      "Dispatch and route assignment",
      "Driver mobile app",
      "Proof of delivery capture",
      "Customer delivery updates",
      "Fleet performance reporting",
    ],
    timeline: "8 months",
    teamSize: "6 specialists",
    status: "Completed",
    challenge:
      "Dispatch ran on phone calls and guesswork, so the team could not see where vehicles were or confirm deliveries reliably.",
    solution:
      "We added live tracking and structured dispatch, plus a driver app for status and proof of delivery and automatic updates for customers.",
    result:
      "A platform that gave the operations team real-time visibility and reduced missed and disputed deliveries.",
  },
  {
    slug: "agritech-marketplace",
    name: "Agritech Marketplace",
    category: "Agriculture",
    type: "Client work",
    description:
      "A marketplace linking farmers directly to buyers, with pricing and logistics support.",
    fullDescription:
      "An agribusiness client wanted to shorten the chain between farmers and buyers. We built a marketplace that lists produce, supports negotiated and fixed pricing, and coordinates pickup and payment so smallholders get a fairer deal.",
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&h=800&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=900&h=700&fit=crop",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&h=700&fit=crop",
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=900&h=700&fit=crop",
    ],
    technologies: ["React", "Node.js", "MongoDB", "Mobile Money"],
    features: [
      "Produce listings and grading",
      "Buyer and farmer accounts",
      "Negotiated and fixed pricing",
      "Mobile money payments",
      "Pickup and logistics coordination",
      "Market price insights",
    ],
    timeline: "7 months",
    teamSize: "5 specialists",
    status: "Completed",
    challenge:
      "Farmers had little price transparency and depended on intermediaries, while buyers struggled to source consistent supply.",
    solution:
      "We built direct listings with clear pricing, mobile money payments, and logistics coordination that work for users with limited connectivity.",
    result:
      "A working marketplace that connects farmers and buyers directly and makes pricing more transparent.",
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

