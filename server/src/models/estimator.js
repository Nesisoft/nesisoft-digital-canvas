import { query } from "../db.js";
import {
  DEFAULT_ESTIMATOR,
  FIXED_LISTS,
  computeEstimate,
  resolveSelection,
} from "../../../shared/estimator.js";

/**
 * The cost calculator's price list (table settings, key "estimator",
 * migration 006), edited in /admin → Pricing. Its shape and arithmetic live
 * in shared/estimator.js, which the calculator page uses too.
 */

const KEY = "estimator";

const MAX_TYPES = 12;
const MAX_FEATURES = 40;
const MAX_PRICE = 100_000_000;
const MAX_WEEKS = 520;
const ID = /^[a-z0-9][a-z0-9-]{0,39}$/;

/** The saved price list, with anything added since it was saved filled in from the defaults. */
export async function getEstimator() {
  const { rows } = await query("select value from settings where key = $1", [KEY]);
  return { ...DEFAULT_ESTIMATOR, ...(rows[0]?.value ?? {}) };
}

/** Validates and stores a whole price list; returns what was stored. */
export async function saveEstimator(input, userId) {
  const value = cleanEstimator(input);
  await query(
    `insert into settings (key, value, updated_by) values ($1, $2, $3)
     on conflict (key) do update
       set value = excluded.value, updated_by = excluded.updated_by, updated_at = now()`,
    [KEY, JSON.stringify(value), userId ?? null]
  );
  return value;
}

function invalid(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

function text(value, name, max, required) {
  if (typeof value !== "string") throw invalid(`${name} must be text`);
  const clean = value.trim();
  if (required && !clean) throw invalid(`${name} is required`);
  if (clean.length > max) throw invalid(`${name} must be at most ${max} characters`);
  return clean;
}

function number(value, name, min, max) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
    throw invalid(`${name} must be a number from ${min} to ${max.toLocaleString("en-US")}`);
  }
  return value;
}

function list(value, name, min, max) {
  if (!Array.isArray(value)) throw invalid(`${name} must be a list`);
  if (value.length < min) throw invalid(`Add at least ${min} ${name.toLowerCase()}`);
  if (value.length > max) throw invalid(`${name}: at most ${max}`);
  value.forEach((item, i) => {
    if (!isObject(item)) throw invalid(`${name} ${i + 1} must be an object`);
  });
  return value;
}

/** An id, unique within its list (ids end up in shared links and quote requests). */
function ids(items, name) {
  const seen = new Set();
  return items.map((item, i) => {
    if (typeof item.id !== "string" || !ID.test(item.id)) {
      throw invalid(`${name} ${i + 1}: id must be lowercase letters, digits and dashes`);
    }
    if (seen.has(item.id)) throw invalid(`${name}: "${item.id}" is used twice`);
    seen.add(item.id);
    return item.id;
  });
}

const LIST_NAMES = { sizes: "Sizes", designs: "Design options", paces: "Pace options" };

/**
 * A price list as submitted from /admin, checked field by field. Unknown
 * keys are dropped, sizes, designs and paces keep their fixed ids, and a
 * feature's project types are limited to types that exist.
 */
export function cleanEstimator(input) {
  if (!isObject(input)) throw invalid("Send the whole price list");

  const usdRate = number(input.usdRate, "Cedis per US dollar", 0.01, 100_000);
  if (!isObject(input.spread)) throw invalid("Range must be an object");
  const spread = {
    low: number(input.spread.low, "Range low end", 0.1, 1),
    high: number(input.spread.high, "Range high end", 1, 5),
  };

  const typeItems = list(input.types, "Project types", 1, MAX_TYPES);
  const typeIds = ids(typeItems, "Project types");
  const types = typeItems.map((t, i) => {
    const name = `Project type ${i + 1}`;
    return {
      id: typeIds[i],
      label: text(t.label, `${name}: name`, 60, true),
      description: text(t.description ?? "", `${name}: description`, 200, false),
      price: number(t.price, `${name}: base price`, 0, MAX_PRICE),
      weeks: number(t.weeks, `${name}: weeks`, 0, MAX_WEEKS),
    };
  });

  const featureItems = list(input.features, "Features", 0, MAX_FEATURES);
  const featureIds = ids(featureItems, "Features");
  const features = featureItems.map((f, i) => {
    const name = `Feature ${i + 1}`;
    if (f.types !== undefined && (!Array.isArray(f.types) || !f.types.every((t) => typeof t === "string"))) {
      throw invalid(`${name}: project types must be a list of ids`);
    }
    return {
      id: featureIds[i],
      label: text(f.label, `${name}: name`, 60, true),
      description: text(f.description ?? "", `${name}: description`, 200, false),
      price: number(f.price, `${name}: price`, 0, MAX_PRICE),
      weeks: number(f.weeks, `${name}: weeks`, 0, MAX_WEEKS),
      // In the types' own order, without repeats or types that don't exist.
      types: typeIds.filter((id) => (f.types ?? []).includes(id)),
    };
  });

  const fixed = {};
  for (const key of FIXED_LISTS) {
    const name = LIST_NAMES[key];
    const items = list(input[key], name, 1, 10);
    fixed[key] = DEFAULT_ESTIMATOR[key].map((option) => {
      const item = items.find((candidate) => candidate.id === option.id);
      if (!item) throw invalid(`${name}: "${option.label}" is missing`);
      const label = `${name}: ${option.id}`;
      return {
        id: option.id,
        label: text(item.label, `${label} name`, 40, true),
        description: text(item.description ?? "", `${label} description`, 200, false),
        factor: number(item.factor, `${label} price multiplier`, 0.1, 10),
        weeksFactor: number(item.weeksFactor, `${label} weeks multiplier`, 0.1, 10),
      };
    });
  }

  return { usdRate, spread, types, sizes: fixed.sizes, features, designs: fixed.designs, paces: fixed.paces };
}

const label = ({ id, label: text }) => ({ id, label: text });

/**
 * What's kept with a quote request from the calculator: the visitor's
 * answers by name, and the estimate worked out here from the current price
 * list (never the browser's own figures). Null when no project type is
 * chosen (or it no longer exists).
 */
export function estimateRecord(config, input) {
  const answers = {
    type: typeof input.type === "string" ? input.type : undefined,
    size: typeof input.size === "string" ? input.size : undefined,
    design: typeof input.design === "string" ? input.design : undefined,
    pace: typeof input.pace === "string" ? input.pace : undefined,
    features: Array.isArray(input.features) ? input.features.filter((f) => typeof f === "string") : [],
  };
  const selection = resolveSelection(config, answers);
  const estimate = computeEstimate(config, selection);
  if (!estimate) return null;
  return {
    type: label(selection.type),
    size: label(selection.size),
    design: label(selection.design),
    pace: label(selection.pace),
    features: selection.features.map(label),
    // The currency they were looking at.
    currency: input.currency === "USD" ? "USD" : "GHS",
    usdRate: config.usdRate,
    ...estimate,
  };
}
