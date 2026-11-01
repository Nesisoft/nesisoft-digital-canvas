import { deleteRow, insertRow, query, rethrowAsClientError, updateRow } from "../db.js";

/** Portfolio projects (table projects), edited in /admin. */

const ERRORS = {
  23505: "A project with that slug already exists",
  23514: "Type must be \"Internal platform\" or \"Client work\"; status must be \"Completed\", \"In development\" or \"Beta testing\"",
};

/** API field → column, for every field /admin can write besides slug. */
export const PROJECT_COLUMNS = {
  name: "name",
  category: "category",
  type: "type",
  description: "description",
  fullDescription: "full_description",
  image: "image",
  gallery: "gallery",
  technologies: "technologies",
  features: "features",
  timeline: "timeline",
  teamSize: "team_size",
  status: "status",
  challenge: "challenge",
  solution: "solution",
  result: "result",
  order: "sort_order",
  published: "published",
};

/** Shape the public site reads (Project in src/data/projects.ts). */
export function toPublicProject(row) {
  return {
    slug: row.slug,
    name: row.name,
    category: row.category,
    type: row.type,
    description: row.description,
    fullDescription: row.full_description,
    image: row.image,
    gallery: row.gallery,
    technologies: row.technologies,
    features: row.features,
    timeline: row.timeline,
    teamSize: row.team_size,
    status: row.status,
    challenge: row.challenge,
    solution: row.solution,
    result: row.result,
  };
}

/** Shape /admin reads (AdminProject in src/lib/adminApi.ts). */
export function toAdminProject(row) {
  return {
    _id: row.id,
    ...toPublicProject(row),
    order: row.sort_order,
    published: row.published,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function listPublishedProjects() {
  const { rows } = await query(
    "select * from projects where published order by sort_order, created_at"
  );
  return rows;
}

export async function findPublishedProject(slug) {
  const { rows } = await query(
    "select * from projects where slug = $1 and published",
    [slug]
  );
  return rows[0] ?? null;
}

export async function listProjects() {
  const { rows } = await query("select * from projects order by sort_order, created_at");
  return rows;
}

export async function findProject(id) {
  const { rows } = await query("select * from projects where id = $1", [id]);
  return rows[0] ?? null;
}

export function createProject(values) {
  return insertRow("projects", values).catch((err) => rethrowAsClientError(err, ERRORS));
}

export function updateProject(id, values) {
  return updateRow("projects", id, values).catch((err) => rethrowAsClientError(err, ERRORS));
}

export const deleteProject = (id) => deleteRow("projects", id);
