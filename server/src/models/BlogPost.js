import mongoose from "mongoose";

const blogPostSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" }, // GitHub-flavored Markdown
    image: { type: String, default: "" }, // URL — may be /api/images/:id or external
    category: { type: String, default: "Uncategorized" },
    author: { type: String, default: "Nesisoft Team" },
    date: { type: Date, default: Date.now },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const BlogPost = mongoose.model("BlogPost", blogPostSchema);
