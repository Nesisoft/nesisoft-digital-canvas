/**
 * The Trainingships page's content (/trainingships), edited in /admin →
 * Trainingships → Page, and stored in the settings table (key
 * "trainingships"). DEFAULT_TRAININGSHIPS is what the page shows until it's
 * edited; the dates and practical details start empty and only appear once
 * filled in. Used by the page (src/pages/Trainingships.tsx) and the API
 * (server/src/models/trainingships.js). Types: shared/trainingships.d.ts.
 */

export const DEFAULT_TRAININGSHIPS = {
  // Whether the application form is shown.
  open: true,
  // Practical details, each shown only when filled in.
  intake: "",
  deadline: "",
  duration: "",
  format: "",
  commitment: "",
  intro:
    "Trainingships are how we grow the next generation of African software talent. You join our team on real projects and learn how software is planned, designed, built and shipped, with experienced engineers and designers beside you.",
  tracks: [
    {
      id: "frontend",
      name: "Frontend web development",
      description: "Build the screens people use: React, TypeScript and accessible, responsive interfaces.",
    },
    {
      id: "backend",
      name: "Backend development",
      description: "APIs, databases and the systems behind them, from Node.js and PostgreSQL to mobile money integrations.",
    },
    {
      id: "mobile",
      name: "Mobile app development",
      description: "Cross-platform apps for Android and iOS, from the first screen to the app stores.",
    },
    {
      id: "design",
      name: "UI/UX design",
      description: "User flows, wireframes and polished interfaces, designed with real users in mind.",
    },
  ],
  highlights: [
    {
      title: "Work on real projects",
      description: "Train with our team on the products we build, not exercises that end up in a drawer.",
    },
    {
      title: "Learn the whole process",
      description: "See how software is planned, designed, built, tested and shipped.",
    },
    {
      title: "Get feedback from our team",
      description: "Regular reviews of your code or designs from experienced engineers and designers.",
    },
    {
      title: "Leave more confident",
      description: "Finish with real experience and work you can talk about in interviews.",
    },
  ],
  requirements: [
    "You're a student, a recent graduate, or teaching yourself to build software or design products.",
    "You know the basics of your track: some programming for developers, a design tool such as Figma for designers.",
    "You can set aside regular time each week for the whole programme.",
    "You're curious, and happy to ask questions and take feedback.",
  ],
  faqs: [
    {
      question: "Who can apply?",
      answer:
        "Students, recent graduates and self-taught developers and designers who know the basics of their track and want real-world experience.",
    },
    {
      question: "Do I need work experience?",
      answer:
        "No. You need the basics, not a job history. Tell us what you've built or designed so far, even if it was a school project or something you made to learn.",
    },
    {
      question: "What happens after I apply?",
      answer:
        "We read every application. If you're shortlisted, we'll invite you to talk with our team about your goals and the track you chose.",
    },
  ],
  closedMessage:
    "Applications are closed for now. Check back for the next intake, or get in touch if you'd like us to let you know when they open.",
};

/** What applicants say they're doing now (the form's options; the API accepts only these). */
export const CURRENT_STATUSES = ["Student", "Recent graduate", "Self-taught", "Working, changing careers", "Other"];

/** Where an application stands in /admin. */
export const APPLICATION_STATUSES = ["new", "reviewing", "shortlisted", "accepted", "declined"];
