import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: { type: String, default: "" },
    type: {
      type: String,
      enum: ["Internal platform", "Client work"],
      default: "Client work",
    },
    description: { type: String, default: "" },
    fullDescription: { type: String, default: "" },
    image: { type: String, default: "" },
    gallery: { type: [String], default: [] },
    technologies: { type: [String], default: [] },
    features: { type: [String], default: [] },
    timeline: { type: String, default: "" },
    teamSize: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Completed", "In development", "Beta testing"],
      default: "In development",
    },
    challenge: { type: String, default: "" },
    solution: { type: String, default: "" },
    result: { type: String, default: "" },
    order: { type: Number, default: 0 }, // lower = shown first
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Project = mongoose.model("Project", projectSchema);

const PUBLIC_FIELDS = [
  "slug", "name", "category", "type", "description", "fullDescription",
  "image", "gallery", "technologies", "features", "timeline", "teamSize",
  "status", "challenge", "solution", "result",
];

/** Shape returned to the public site — matches the client's Project interface. */
export function serializeProject(doc) {
  const out = {};
  for (const key of PUBLIC_FIELDS) out[key] = doc[key];
  return out;
}
