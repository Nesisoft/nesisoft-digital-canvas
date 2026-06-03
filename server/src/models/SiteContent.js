import mongoose from "mongoose";

/**
 * Editable marketing copy for the public site. A single document (key "main")
 * holds the fields the admin can change without a code deploy. DEFAULT_CONTENT
 * mirrors the original hardcoded copy so the site looks identical until edited.
 */

const statSchema = new mongoose.Schema(
  { number: { type: String, default: "" }, label: { type: String, default: "" } },
  { _id: false }
);

const siteContentSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: "main" },
    hero: {
      titleLead: String,
      subtitle: String,
    },
    about: {
      eyebrow: String,
      title: String,
      description: String,
      missionTitle: String,
      missionBody: String, // paragraphs separated by blank lines
      whyTitle: String,
      benefits: [String],
      stats: [statSchema],
    },
  },
  { timestamps: true, minimize: false }
);

export const SiteContent = mongoose.model("SiteContent", siteContentSchema);

export const DEFAULT_CONTENT = {
  hero: {
    titleLead: "We build software that moves",
    subtitle:
      "Nesisoft is a full-cycle development studio. We design and ship web, mobile and custom software — and build our own platforms like Agoo, Sua, Adesuapa and Jua.",
  },
  about: {
    eyebrow: "About",
    title: "A studio built for Africa's digital growth",
    description:
      "We turn ideas into practical software — tailored to how businesses across Africa actually operate, and built to last.",
    missionTitle: "Our mission",
    missionBody:
      "We help clients innovate, grow and thrive in the digital economy. Beyond delivering software, we create jobs, widen digital inclusion and build lasting economic value on the continent.\n\nThrough ventures like Agoo, Sua, Adesuapa and Jua, we build scalable platforms that solve regional problems — alongside our client work.",
    whyTitle: "Why work with us",
    benefits: [
      "Full-cycle development, from concept to deployment",
      "A senior team with a proven track record",
      "Deep understanding of African markets",
      "Practical solutions to real-world problems",
    ],
    stats: [
      { number: "10+", label: "Projects delivered" },
      { number: "5+", label: "Clients served" },
      { number: "5+", label: "Years building" },
      { number: "2+", label: "Countries served" },
    ],
  },
};
