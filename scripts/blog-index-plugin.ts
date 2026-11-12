import path from "node:path";
import type { Plugin } from "vite";
import { readBlogPosts } from "./site-routes";

const ID = "virtual:blog-index";
const RESOLVED_ID = `\0${ID}`;

/**
 * `import posts from "virtual:blog-index"`: the bundled Markdown posts'
 * frontmatter (slug, title, excerpt, image, category, author, date), newest
 * first, without their bodies. For lists outside the blog, such as the
 * homepage's latest articles, which shouldn't pull every article's full text
 * into their bundle the way src/lib/blog.ts does. Rebuilt when a post changes
 * in dev.
 */
export function blogIndexPlugin(): Plugin {
  let dir = "";
  return {
    name: "nesisoft-blog-index",
    configResolved(config) {
      dir = path.join(config.root, "src", "content", "blog");
    },
    resolveId(id) {
      return id === ID ? RESOLVED_ID : undefined;
    },
    load(id) {
      if (id !== RESOLVED_ID) return undefined;
      this.addWatchFile(dir);
      const posts = readBlogPosts(dir).map(({ slug, title, excerpt, image, category, author, date }) => ({
        slug,
        title,
        excerpt,
        image,
        category,
        author,
        date,
      }));
      return `export default ${JSON.stringify(posts)};`;
    },
    handleHotUpdate({ file, server, modules }) {
      if (!file.startsWith(dir + path.sep)) return undefined;
      const index = server.moduleGraph.getModuleById(RESOLVED_ID);
      if (!index) return undefined;
      server.moduleGraph.invalidateModule(index);
      return [...modules, index];
    },
  };
}
