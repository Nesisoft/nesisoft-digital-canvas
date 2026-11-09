import { useEffect, useRef, useState } from "react";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getEstimator, updateEstimator } from "@/lib/adminApi";
import {
  DEFAULT_ESTIMATOR,
  formatRange,
  formatWeeks,
  startingEstimate,
  typicalEstimate,
  type EstimatorConfig,
  type EstimatorFeature,
  type EstimatorMultiplier,
  type EstimatorType,
  type MultiplierList,
} from "@shared/estimator.js";

const numberClass = "h-9 w-full";
const cell = "text-xs font-medium text-slate-500";

/** Number inputs hold NaN while empty; the API rejects it on save with a clear message. */
const toNumber = (value: string) => (value.trim() === "" ? NaN : Number(value));
const shown = (n: number) => (Number.isNaN(n) ? "" : String(n));

/** An id for a new item, from its name ("Loyalty points" → "loyalty-points"), unique in its list. */
function slugFor(label: string, taken: Set<string>, fallback: string) {
  const base =
    label
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 34) || fallback;
  let id = base;
  for (let n = 2; taken.has(id); n++) id = `${base}-${n}`;
  taken.add(id);
  return id;
}

function SectionTitle({ title, hint }: { title: string; hint: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-violet-300">{title}</h3>
      <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">{hint}</p>
    </div>
  );
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      aria-label={label}
      onClick={onClick}
      className="h-9 w-9 flex-shrink-0 p-0 text-slate-400 hover:bg-red-500/10 hover:text-red-300"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}

/**
 * /admin → Pricing: the cost calculator's price list (/app-cost-calculator).
 * Saved whole; the API checks every field (server/src/models/estimator.js).
 * Sizes, designs and paces are a fixed set whose names, wording and
 * multipliers can change; project types and features can be added and removed.
 */
export function EstimatorForm() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin", "estimator"], queryFn: getEstimator });
  const [form, setForm] = useState<EstimatorConfig>(DEFAULT_ESTIMATOR);
  // Items added since loading: they get an id from their name when saved.
  const fresh = useRef(new Set<string>());
  const counter = useRef(0);

  useEffect(() => {
    if (data) {
      setForm(data);
      fresh.current.clear();
    }
  }, [data]);

  /** The form as the API expects it: new items named by id, features pointing at them. */
  const payload = (): EstimatorConfig => {
    const typeIds = new Set(form.types.filter((t) => !fresh.current.has(t.id)).map((t) => t.id));
    const renamed = new Map<string, string>();
    const types = form.types.map((t) => {
      if (!fresh.current.has(t.id)) return t;
      const id = slugFor(t.label, typeIds, "project");
      renamed.set(t.id, id);
      return { ...t, id };
    });
    const featureIds = new Set(form.features.filter((f) => !fresh.current.has(f.id)).map((f) => f.id));
    const features = form.features.map((f) => ({
      ...f,
      id: fresh.current.has(f.id) ? slugFor(f.label, featureIds, "feature") : f.id,
      types: f.types.map((id) => renamed.get(id) ?? id),
    }));
    return { ...form, types, features };
  };

  const save = useMutation({
    mutationFn: () => updateEstimator(payload()),
    onSuccess: (saved) => {
      qc.setQueryData(["admin", "estimator"], saved);
      qc.invalidateQueries({ queryKey: ["estimator"] }); // the public calculator
      toast.success("Prices saved", { description: "The calculator uses them from now on." });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Save failed"),
  });

  const newId = () => `new-${++counter.current}`;

  const setType = (i: number, patch: Partial<EstimatorType>) =>
    setForm((f) => ({ ...f, types: f.types.map((t, j) => (j === i ? { ...t, ...patch } : t)) }));
  const addType = () => {
    const id = newId();
    fresh.current.add(id);
    setForm((f) => ({ ...f, types: [...f.types, { id, label: "", description: "", price: 0, weeks: 1 }] }));
  };
  const removeType = (i: number) =>
    setForm((f) => {
      const gone = f.types[i].id;
      return {
        ...f,
        types: f.types.filter((_, j) => j !== i),
        features: f.features.map((feature) => ({ ...feature, types: feature.types.filter((t) => t !== gone) })),
      };
    });

  const setFeature = (i: number, patch: Partial<EstimatorFeature>) =>
    setForm((f) => ({ ...f, features: f.features.map((x, j) => (j === i ? { ...x, ...patch } : x)) }));
  const addFeature = () => {
    const id = newId();
    fresh.current.add(id);
    setForm((f) => ({
      ...f,
      features: [...f.features, { id, label: "", description: "", price: 0, weeks: 1, types: [] }],
    }));
  };
  const removeFeature = (i: number) => setForm((f) => ({ ...f, features: f.features.filter((_, j) => j !== i) }));

  const setMultiplier = (list: MultiplierList, i: number, patch: Partial<EstimatorMultiplier>) =>
    setForm((f) => ({ ...f, [list]: f[list].map((x, j) => (j === i ? { ...x, ...patch } : x)) }));

  if (isLoading) return <p className="text-sm text-slate-400">Loading prices…</p>;

  // A preview with the prices as they stand in the form.
  const previewable =
    form.types.length > 0 &&
    [form.usdRate, form.spread.low, form.spread.high].every((n) => n > 0) &&
    form.types.every((t) => t.price >= 0 && t.weeks >= 0) &&
    [...form.sizes, ...form.designs, ...form.paces].every((o) => o.factor > 0 && o.weeksFactor > 0);

  const multiplierSection = (list: MultiplierList, title: string, hint: string) => (
    <section className="space-y-4 border-t border-white/10 pt-8">
      <SectionTitle title={title} hint={hint} />
      <div className="hidden grid-cols-[10rem_1fr_6rem_6rem] gap-3 md:grid">
        <span className={cell}>Name</span>
        <span className={cell}>Description</span>
        <span className={cell}>Price ×</span>
        <span className={cell}>Weeks ×</span>
      </div>
      {form[list].map((option, i) => (
        <div key={option.id} className="grid gap-3 md:grid-cols-[10rem_1fr_6rem_6rem]">
          <Input
            aria-label={`${title}: ${option.id} name`}
            value={option.label}
            onChange={(e) => setMultiplier(list, i, { label: e.target.value })}
            className={numberClass}
          />
          <Input
            aria-label={`${title}: ${option.id} description`}
            value={option.description}
            onChange={(e) => setMultiplier(list, i, { description: e.target.value })}
            className={numberClass}
          />
          <Input
            type="number"
            step="0.05"
            min="0.1"
            aria-label={`${title}: ${option.id} price multiplier`}
            value={shown(option.factor)}
            onChange={(e) => setMultiplier(list, i, { factor: toNumber(e.target.value) })}
            className={numberClass}
          />
          <Input
            type="number"
            step="0.05"
            min="0.1"
            aria-label={`${title}: ${option.id} weeks multiplier`}
            value={shown(option.weeksFactor)}
            onChange={(e) => setMultiplier(list, i, { weeksFactor: toNumber(e.target.value) })}
            className={numberClass}
          />
        </div>
      ))}
    </section>
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
      className="mx-auto max-w-5xl space-y-8 [&_input]:border-white/10 [&_input]:bg-black/20 [&_input]:text-white"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h2 className="text-lg font-semibold text-white">Cost calculator prices</h2>
          <p className="mt-1 text-sm leading-6 text-slate-400">
            What the{" "}
            <a href="/app-cost-calculator" target="_blank" rel="noreferrer" className="text-violet-300 hover:text-violet-200">
              cost calculator
            </a>{" "}
            charges, in Ghana cedis. An estimate is the project type's base price plus each chosen feature, multiplied
            by the size, design and pace, and shown as a range. Weeks work the same way.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (!window.confirm("Replace the form with the starting prices? Nothing changes until you save.")) return;
            fresh.current.clear();
            setForm(DEFAULT_ESTIMATOR);
          }}
          className="h-9 border-white/15 bg-transparent text-slate-300 hover:bg-white/[0.06] hover:text-white"
        >
          <RotateCcw className="mr-2 h-4 w-4" /> Starting prices
        </Button>
      </div>

      {previewable && (
        <section aria-label="Preview" className="border border-white/10 bg-white/[0.02] p-4">
          <h3 className={cell}>Preview: each project type, before features (smallest build, then medium)</h3>
          <ul className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            {form.types.map((type) => (
              <li key={type.id} className="flex flex-wrap justify-between gap-x-3">
                <span className="text-slate-300">{type.label || "Unnamed"}</span>
                <span className="text-slate-400">
                  from {formatRange(startingEstimate(form, type))} · typical {formatRange(typicalEstimate(form, type))},{" "}
                  {formatWeeks(typicalEstimate(form, type))}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-4">
        <SectionTitle
          title="Currency and range"
          hint="The exchange rate converts cedis for visitors who switch to US dollars. The range runs from a percentage below the estimate to one above it, so it doesn't look more exact than it is."
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className={cell}>Cedis per US dollar</span>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={shown(form.usdRate)}
              onChange={(e) => setForm((f) => ({ ...f, usdRate: toNumber(e.target.value) }))}
              className="mt-1.5 h-9"
            />
          </label>
          <label className="block">
            <span className={cell}>Range starts at (% of estimate)</span>
            <Input
              type="number"
              step="1"
              min="10"
              max="100"
              value={shown(Math.round(form.spread.low * 100))}
              onChange={(e) => setForm((f) => ({ ...f, spread: { ...f.spread, low: toNumber(e.target.value) / 100 } }))}
              className="mt-1.5 h-9"
            />
          </label>
          <label className="block">
            <span className={cell}>Range ends at (% of estimate)</span>
            <Input
              type="number"
              step="1"
              min="100"
              max="500"
              value={shown(Math.round(form.spread.high * 100))}
              onChange={(e) => setForm((f) => ({ ...f, spread: { ...f.spread, high: toNumber(e.target.value) / 100 } }))}
              className="mt-1.5 h-9"
            />
          </label>
        </div>
      </section>

      <section className="space-y-4 border-t border-white/10 pt-8">
        <SectionTitle
          title="Project types"
          hint="Question 1. The base price and weeks cover a medium-sized build with custom design and no added features."
        />
        <div className="hidden grid-cols-[12rem_1fr_7rem_5rem_2.25rem] gap-3 md:grid">
          <span className={cell}>Name</span>
          <span className={cell}>Description</span>
          <span className={cell}>Base price (GH₵)</span>
          <span className={cell}>Weeks</span>
        </div>
        {form.types.map((type, i) => (
          <div key={type.id} className="grid gap-3 md:grid-cols-[12rem_1fr_7rem_5rem_2.25rem]">
            <Input
              aria-label={`Project type ${i + 1} name`}
              placeholder="e.g. Mobile app"
              value={type.label}
              onChange={(e) => setType(i, { label: e.target.value })}
              className={numberClass}
            />
            <Input
              aria-label={`Project type ${i + 1} description`}
              value={type.description}
              onChange={(e) => setType(i, { description: e.target.value })}
              className={numberClass}
            />
            <Input
              type="number"
              min="0"
              step="500"
              aria-label={`Project type ${i + 1} base price`}
              value={shown(type.price)}
              onChange={(e) => setType(i, { price: toNumber(e.target.value) })}
              className={numberClass}
            />
            <Input
              type="number"
              min="0"
              step="0.5"
              aria-label={`Project type ${i + 1} weeks`}
              value={shown(type.weeks)}
              onChange={(e) => setType(i, { weeks: toNumber(e.target.value) })}
              className={numberClass}
            />
            <RemoveButton label={`Remove ${type.label || `project type ${i + 1}`}`} onClick={() => removeType(i)} />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={addType}
          className="h-9 border-white/15 bg-transparent text-slate-300 hover:bg-white/[0.06] hover:text-white"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Add project type
        </Button>
      </section>

      <section className="space-y-4 border-t border-white/10 pt-8">
        <SectionTitle
          title="Features"
          hint="Question 3. Each adds its price and weeks before the multipliers. Tick the project types it's offered for; leave them all unticked to offer it for every type."
        />
        {form.features.map((feature, i) => (
          <div key={feature.id} className="space-y-3 border border-white/10 p-3">
            <div className="grid gap-3 md:grid-cols-[12rem_1fr_7rem_5rem_2.25rem]">
              <Input
                aria-label={`Feature ${i + 1} name`}
                placeholder="e.g. Loyalty points"
                value={feature.label}
                onChange={(e) => setFeature(i, { label: e.target.value })}
                className={numberClass}
              />
              <Input
                aria-label={`Feature ${i + 1} description`}
                value={feature.description}
                onChange={(e) => setFeature(i, { description: e.target.value })}
                className={numberClass}
              />
              <Input
                type="number"
                min="0"
                step="500"
                aria-label={`Feature ${i + 1} price`}
                value={shown(feature.price)}
                onChange={(e) => setFeature(i, { price: toNumber(e.target.value) })}
                className={numberClass}
              />
              <Input
                type="number"
                min="0"
                step="0.5"
                aria-label={`Feature ${i + 1} weeks`}
                value={shown(feature.weeks)}
                onChange={(e) => setFeature(i, { weeks: toNumber(e.target.value) })}
                className={numberClass}
              />
              <RemoveButton label={`Remove ${feature.label || `feature ${i + 1}`}`} onClick={() => removeFeature(i)} />
            </div>
            <fieldset className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <legend className="sr-only">Offered for</legend>
              <span className="text-xs text-slate-500">
                Offered for{feature.types.length === 0 ? ": every type" : ""}
              </span>
              {form.types.map((type) => (
                <label key={type.id} className="flex items-center gap-1.5 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={feature.types.includes(type.id)}
                    onChange={(e) =>
                      setFeature(i, {
                        types: e.target.checked
                          ? [...feature.types, type.id]
                          : feature.types.filter((t) => t !== type.id),
                      })
                    }
                    className="h-3.5 w-3.5 accent-violet-500"
                  />
                  {type.label || "Unnamed"}
                </label>
              ))}
            </fieldset>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={addFeature}
          className="h-9 border-white/15 bg-transparent text-slate-300 hover:bg-white/[0.06] hover:text-white"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Add feature
        </Button>
      </section>

      {multiplierSection(
        "sizes",
        "Sizes",
        "Question 2. Multiplies the price and the weeks: 1 leaves them as they are, 0.75 takes a quarter off, 1.6 adds 60%."
      )}
      {multiplierSection("designs", "Design", "Question 4. Multiplies the price and the weeks.")}
      {multiplierSection(
        "paces",
        "Pace",
        "Question 5. A faster pace usually costs more (price above 1) and takes fewer weeks (weeks below 1)."
      )}

      <div className="sticky bottom-0 -mx-6 flex items-center justify-end gap-3 border-t border-white/10 bg-[#0f0f12]/95 px-6 py-4 backdrop-blur">
        <Button type="submit" disabled={save.isPending} className="h-10 bg-violet-600 px-6 text-white hover:bg-violet-500">
          {save.isPending ? "Saving…" : "Save prices"}
        </Button>
      </div>
    </form>
  );
}
