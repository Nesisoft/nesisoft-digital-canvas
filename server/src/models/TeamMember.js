import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, default: "" },
    bio: { type: String, default: "" },
    image: { type: String, default: "" }, // URL — may be /api/images/:id or external
    order: { type: Number, default: 0 }, // lower = shown first
    socials: {
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      github: { type: String, default: "" },
    },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const TeamMember = mongoose.model("TeamMember", teamMemberSchema);
