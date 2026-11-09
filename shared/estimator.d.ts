/** Types for shared/estimator.js (the app cost calculator's prices and arithmetic). */

export interface EstimatorType {
  id: string;
  label: string;
  description: string;
  /** Base price in cedis. */
  price: number;
  weeks: number;
}

export interface EstimatorFeature {
  id: string;
  label: string;
  description: string;
  price: number;
  weeks: number;
  /** The project types it's offered for; empty means all. */
  types: string[];
}

/** A size, design or pace: multiplies the price and the weeks. */
export interface EstimatorMultiplier {
  id: string;
  label: string;
  description: string;
  factor: number;
  weeksFactor: number;
}

export interface EstimatorConfig {
  /** Cedis per US dollar. */
  usdRate: number;
  spread: { low: number; high: number };
  types: EstimatorType[];
  sizes: EstimatorMultiplier[];
  features: EstimatorFeature[];
  designs: EstimatorMultiplier[];
  paces: EstimatorMultiplier[];
}

export type MultiplierList = "sizes" | "designs" | "paces";

/** A visitor's answers, by id (a shared link, a quote request). */
export interface SelectionInput {
  type?: string;
  size?: string;
  design?: string;
  pace?: string;
  features?: string[];
}

export interface Selection {
  type: EstimatorType | null;
  size: EstimatorMultiplier;
  design: EstimatorMultiplier;
  pace: EstimatorMultiplier;
  features: EstimatorFeature[];
}

export interface Estimate {
  low: number;
  high: number;
  usdLow: number;
  usdHigh: number;
  weeksLow: number;
  weeksHigh: number;
  base: number;
}

export type Currency = "GHS" | "USD";

export const DEFAULT_ESTIMATOR: EstimatorConfig;
export const FIXED_LISTS: MultiplierList[];
export const CURRENCY_SYMBOLS: Record<Currency, string>;

export function defaultOption(list: EstimatorMultiplier[]): EstimatorMultiplier;
export function featureApplies(feature: EstimatorFeature, type: EstimatorType): boolean;
export function resolveSelection(config: EstimatorConfig, input?: SelectionInput): Selection;
export function roundPrice(amount: number): number;
export function computeEstimate(
  config: EstimatorConfig,
  selection: Omit<Selection, "type"> & { type: EstimatorType | null }
): Estimate | null;
export function formatNumber(amount: number): string;
export function formatRange(estimate: Estimate, currency?: Currency): string;
export function formatWeeks(estimate: Estimate): string;
export function startingEstimate(config: EstimatorConfig, type: EstimatorType): Estimate;
export function typicalEstimate(config: EstimatorConfig, type: EstimatorType): Estimate;
