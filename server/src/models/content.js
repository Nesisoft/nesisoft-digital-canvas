import { query } from "../db.js";

/**
 * Editable marketing copy for the public site (table site_content). A single
 * row (key "main") holds what the admin can change without a code deploy.
 * DEFAULT_CONTENT mirrors the original hardcoded copy, so the site looks the
 * same until it's edited (and src/lib/api.ts keeps the same defaults).
 */

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
    // The Company page (/company); the homepage shows a short teaser.
    visionTitle: "Our vision",
    visionBody:
      "To be the software partner African businesses trust to turn ideas into products that work for the people who use them, every day.",
    csrTitle: "Corporate social responsibility",
    csrBody:
      "We grow the next generation of African software talent by opening our studio to people who want to learn the craft.",
    csrPrograms: [
      {
        title: "Trainingships",
        description:
          "Students and early-career developers and designers train with our team on real projects, learning how software is planned, built and shipped.",
      },
    ],
    // Up to three photos for the homepage teaser and the Company page.
    photos: [],
  },
};

export const MAX_ABOUT_PHOTOS = 3;
const MAX_CSR_PROGRAMS = 6;

const KEY = "main";

/**
 * The saved copy over the defaults, so fields added since it was saved (and
 * anything never saved) still have a value.
 */
export async function getContent() {
  const { rows } = await query("select hero, about from site_content where key = $1", [KEY]);
  const saved = rows[0] ?? {};
  return {
    hero: { ...DEFAULT_CONTENT.hero, ...saved.hero },
    about: { ...DEFAULT_CONTENT.about, ...saved.about },
  };
}

const HERO_TEXT = ["titleLead", "subtitle"];
const ABOUT_TEXT = [
  "eyebrow",
  "title",
  "description",
  "missionTitle",
  "missionBody",
  "whyTitle",
  "visionTitle",
  "visionBody",
  "csrTitle",
  "csrBody",
];

// An uploaded (Supabase) or external image, or a file under public/.
const isImageUrl = (value) => value === "" || /^https?:\/\/\S+$/i.test(value) || /^\/[^/]/.test(value);

function invalid(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

const isText = (value) => typeof value === "string";

/**
 * One section (hero or about) as the homepage renders it: each known field
 * from the submission when sent (type-checked), otherwise its current value.
 * Unknown keys are dropped, so a typo can't blank the homepage.
 */
function mergeSection(name, current, input, textFields) {
  const merged = {};
  for (const field of textFields) {
    if (input[field] === undefined) merged[field] = current[field];
    else if (isText(input[field])) merged[field] = input[field];
    else throw invalid(`${name}.${field} must be text`);
  }
  if (name !== "about") return merged;

  if (input.benefits === undefined) merged.benefits = current.benefits;
  else if (Array.isArray(input.benefits) && input.benefits.every(isText)) {
    merged.benefits = input.benefits;
  } else throw invalid("about.benefits must be a list of text");

  if (input.stats === undefined) merged.stats = current.stats;
  else if (
    Array.isArray(input.stats) &&
    input.stats.every((s) => s && isText(s.number) && isText(s.label))
  ) {
    merged.stats = input.stats.map(({ number, label }) => ({ number, label }));
  } else throw invalid("about.stats must be a list of { number, label } text pairs");

  if (input.csrPrograms === undefined) merged.csrPrograms = current.csrPrograms;
  else if (
    Array.isArray(input.csrPrograms) &&
    input.csrPrograms.length <= MAX_CSR_PROGRAMS &&
    input.csrPrograms.every((p) => p && isText(p.title) && isText(p.description))
  ) {
    merged.csrPrograms = input.csrPrograms.map(({ title, description }) => ({ title, description }));
  } else {
    throw invalid(
      `about.csrPrograms must be at most ${MAX_CSR_PROGRAMS} { title, description } text pairs`
    );
  }

  if (input.photos === undefined) merged.photos = current.photos;
  else if (
    Array.isArray(input.photos) &&
    input.photos.length <= MAX_ABOUT_PHOTOS &&
    input.photos.every((p) => p && isText(p.url) && isImageUrl(p.url) && isText(p.alt))
  ) {
    // Empty slots are dropped.
    merged.photos = input.photos.filter((p) => p.url).map(({ url, alt }) => ({ url, alt }));
  } else {
    throw invalid(
      `about.photos must be at most ${MAX_ABOUT_PHOTOS} { url, alt } pairs with image URLs`
    );
  }

  return merged;
}

/**
 * Saves hero and/or about over the current copy; anything not sent keeps its
 * value (falling back to the defaults). Returns the stored copy.
 */
export async function saveContent({ hero, about }) {
  const current = await getContent();
  const next = {
    hero: hero === undefined ? current.hero : mergeSection("hero", current.hero, hero, HERO_TEXT),
    about: about === undefined ? current.about : mergeSection("about", current.about, about, ABOUT_TEXT),
  };
  const { rows } = await query(
    `insert into site_content (key, hero, about) values ($1, $2, $3)
     on conflict (key) do update
       set hero = excluded.hero, about = excluded.about, updated_at = now()
     returning hero, about`,
    [KEY, JSON.stringify(next.hero), JSON.stringify(next.about)]
  );
  return rows[0];
}
