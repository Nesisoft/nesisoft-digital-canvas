import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Download, ExternalLink, Mail, Paperclip, Phone, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  APPLICATION_STATUS_LABELS,
  applicationCvUrl,
  deleteApplication,
  getApplication,
  getTrainingshipsPage,
  listApplications,
  updateApplication,
  updateTrainingshipsPage,
  type AdminApplication,
  type ApplicationStatus,
  type TrainingshipsConfig,
} from "@/lib/adminApi";
import { DEFAULT_TRAININGSHIPS } from "@shared/trainingships.js";

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  new: "bg-violet-500/20 text-violet-200",
  reviewing: "bg-slate-500/20 text-slate-300",
  shortlisted: "bg-amber-500/15 text-amber-200",
  accepted: "bg-emerald-500/15 text-emerald-200",
  declined: "bg-white/[0.06] text-slate-400",
};

function ApplicationBadge({ status }: { status: ApplicationStatus }) {
  return <span className={cn("px-2 py-0.5 text-[10px] font-medium", STATUS_STYLES[status])}>{APPLICATION_STATUS_LABELS[status]}</span>;
}

const formatDateTime = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
const shortDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
/** The reference the applicant was given (server/src/visitorEmail.js). */
const refFor = (id: string) => id.replace(/-/g, "").slice(0, 8).toUpperCase();

const box = "rounded-xl border border-white/10 bg-white/[0.02]";
const fieldClass = "border-white/10 bg-black/20 text-white";

type Filter = "all" | ApplicationStatus;

/* ---------------- One application ---------------- */
function ApplicationDetail({ id, onDeleted }: { id: string; onDeleted: () => void }) {
  const qc = useQueryClient();
  const { data: app, isLoading, isError } = useQuery({ queryKey: ["admin", "application", id], queryFn: () => getApplication(id) });
  const [notes, setNotes] = useState("");
  const loaded = app?._id;
  useEffect(() => {
    if (app) setNotes(app.notes);
    // Only when a different application loads, not after each save.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);
  // Opening it may have moved it to "reviewing": refresh the list.
  useEffect(() => {
    if (loaded) qc.invalidateQueries({ queryKey: ["admin", "applications"] });
  }, [loaded, qc]);

  const save = useMutation({
    mutationFn: (body: { status?: ApplicationStatus; notes?: string }) => updateApplication(id, body),
    onSuccess: (updated, body) => {
      qc.setQueryData(["admin", "application", id], updated);
      qc.invalidateQueries({ queryKey: ["admin", "applications"] });
      toast.success(body.status ? `Marked ${APPLICATION_STATUS_LABELS[body.status].toLowerCase()}` : "Notes saved");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Save failed"),
  });
  const remove = useMutation({
    mutationFn: () => deleteApplication(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "applications"] });
      toast.success("Application deleted");
      onDeleted();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Delete failed"),
  });

  if (isLoading) return <p className="text-sm text-slate-400">Loading…</p>;
  if (isError || !app) return <p className="text-sm text-rose-300">Couldn't load this application.</p>;

  const name = `${app.firstName} ${app.lastName}`;
  const whatsapp = app.phone.replace(/[^\d]/g, "");
  const details = (
    [
      ["Track", app.track],
      ["Currently", app.currentStatus],
      ["School or organisation", app.school],
      ["Availability", app.availability],
      ["Intake", app.intake],
      ["Found the site via", app.foundVia?.label ?? ""],
      ["First page they saw", app.foundVia?.landingPage ?? ""],
      ["Campaign", app.foundVia?.campaign ?? ""],
    ] as [string, string][]
  ).filter(([, value]) => value);
  const replySubject = `Your Trainingship application to Nesisoft (ref. ${refFor(app._id)})`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-white">{name}</h3>
          <p className="mt-1 text-sm text-slate-400">
            Applied {formatDateTime(app.createdAt)} · Ref. {refFor(app._id)}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <a href={`mailto:${app.email}?subject=${encodeURIComponent(`Re: ${replySubject}`)}`} className="inline-flex items-center gap-1.5 text-violet-300 hover:text-violet-200">
              <Mail className="h-4 w-4" /> {app.email}
            </a>
            {app.phone && (
              <a href={`tel:${app.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 text-violet-300 hover:text-violet-200">
                <Phone className="h-4 w-4" /> {app.phone}
              </a>
            )}
            {whatsapp.length >= 8 && (
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="text-violet-300 hover:text-violet-200">
                WhatsApp
              </a>
            )}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-400">
          Status
          <select
            aria-label="Status"
            value={app.status}
            disabled={save.isPending}
            onChange={(e) => save.mutate({ status: e.target.value as ApplicationStatus })}
            className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white [&>option]:bg-slate-900"
          >
            {(Object.keys(APPLICATION_STATUS_LABELS) as ApplicationStatus[]).map((s) => (
              <option key={s} value={s}>
                {APPLICATION_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {app.notifyError && (
        <div className="flex gap-3 border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>
            The company inbox wasn't emailed about this one, so it's only here.
            <span className="mt-1 block text-xs text-amber-200/80">{app.notifyError}</span>
          </div>
        </div>
      )}

      <dl className="grid gap-x-6 gap-y-3 border border-white/10 p-4 text-sm sm:grid-cols-2">
        {details.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd className="mt-0.5 text-slate-200">{value}</dd>
          </div>
        ))}
        {app.links.length > 0 && (
          <div className="sm:col-span-2">
            <dt className="text-xs text-slate-500">Links</dt>
            <dd className="mt-1 flex flex-col gap-1">
              {app.links.map((link) => (
                <a key={link} href={link} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1.5 break-all text-violet-300 hover:text-violet-200">
                  {link} <ExternalLink aria-hidden className="h-3.5 w-3.5 flex-shrink-0" />
                </a>
              ))}
            </dd>
          </div>
        )}
      </dl>

      <div>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Why they want to join</h4>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{app.motivation}</p>
      </div>

      {app.cv && (
        <div className="flex items-center gap-3 border border-white/10 bg-white/[0.02] p-3">
          <Paperclip className="h-5 w-5 flex-shrink-0 text-violet-300" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-white">{app.cv.name}</p>
            <p className="text-xs text-slate-400">
              {formatSize(app.cv.size)}
              {!app.cv.stored && (app.notifyError ? " · couldn't be stored or emailed: ask them to send it again" : " · not stored here: it's attached to the email sent to the inbox")}
            </p>
          </div>
          {app.cv.stored && (
            <Button asChild variant="outline" className="h-9 border-white/15 bg-transparent text-slate-200 hover:bg-white/[0.06] hover:text-white">
              <a href={applicationCvUrl(app._id)} download>
                <Download className="mr-2 h-4 w-4" /> Download CV
              </a>
            </Button>
          )}
        </div>
      )}

      {app.copy?.sentAt && (
        <p className="flex items-start gap-2 text-sm text-slate-400">
          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-300" />
          A confirmation was emailed to {app.email} on {formatDateTime(app.copy.sentAt)}.
        </p>
      )}
      {app.copy?.error && (
        <p className="flex items-start gap-2 text-sm text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          Their confirmation email couldn't be sent: {app.copy.error}
        </p>
      )}

      <div>
        <label htmlFor={`notes-${app._id}`} className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
          Team notes (private)
        </label>
        <Textarea
          id={`notes-${app._id}`}
          value={notes}
          maxLength={5000}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Interview notes, next steps…"
          className={cn(fieldClass, "min-h-[100px]")}
        />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <Button
            type="button"
            disabled={save.isPending || notes === app.notes}
            onClick={() => save.mutate({ notes })}
            className="h-9 bg-violet-600 px-4 text-white hover:bg-violet-500"
          >
            Save notes
          </Button>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="h-9 border-white/15 bg-transparent text-slate-200 hover:bg-white/[0.06] hover:text-white">
              <a href={`mailto:${app.email}?subject=${encodeURIComponent(`Re: ${replySubject}`)}`}>
                <Mail className="mr-2 h-4 w-4" /> Email {app.firstName}
              </a>
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={remove.isPending}
              onClick={() => {
                if (window.confirm(`Delete ${name}'s application${app.cv ? " and CV" : ""}? This can't be undone.`)) remove.mutate();
              }}
              className="h-9 border-red-500/30 bg-transparent text-red-300 hover:bg-red-500/10 hover:text-red-200"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- The list ---------------- */
function Applications({ linkedId }: { linkedId: string | null }) {
  const { data } = useQuery({ queryKey: ["admin", "applications"], queryFn: listApplications });
  const items = data?.items ?? [];
  const [selected, setSelected] = useState<string | null>(linkedId);
  const [filter, setFilter] = useState<Filter>("all");
  const [track, setTrack] = useState("all");
  const tracks = Array.from(new Set(items.map((i) => i.track)));
  const shown = items.filter((i) => (filter === "all" || i.status === filter) && (track === "all" || i.track === track));
  const count = (f: Filter) => (f === "all" ? items.length : items.filter((i) => i.status === f).length);

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-[320px_1fr]">
      <section className={cn(box, "flex min-h-0 flex-col overflow-hidden")}>
        <div className="space-y-2 border-b border-white/10 px-3 py-3">
          <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by status">
            {(["all", ...Object.keys(APPLICATION_STATUS_LABELS)] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={cn("px-2 py-1 text-xs transition-colors", filter === f ? "bg-white/[0.08] text-white" : "text-slate-400 hover:text-white")}
              >
                {f === "all" ? "All" : APPLICATION_STATUS_LABELS[f]} {count(f)}
              </button>
            ))}
          </div>
          {tracks.length > 1 && (
            <select
              aria-label="Track"
              value={track}
              onChange={(e) => setTrack(e.target.value)}
              className="w-full rounded-md border border-white/10 bg-black/20 px-2 py-1.5 text-xs text-white [&>option]:bg-slate-900"
            >
              <option value="all">All tracks</option>
              {tracks.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {shown.length === 0 ? (
            <p className="px-3 py-4 text-sm text-slate-500">
              {items.length === 0 ? "No applications yet. They appear here when people apply on the Trainingships page." : "None match these filters."}
            </p>
          ) : (
            shown.map((a: AdminApplication) => (
              <button
                key={a._id}
                onClick={() => setSelected(a._id)}
                className={cn("block w-full px-3 py-2.5 text-left transition-colors", a._id === selected ? "bg-white/[0.06]" : "hover:bg-white/[0.04]")}
              >
                <span className="flex items-center gap-2">
                  {a.status === "new" && <span aria-hidden className="h-2 w-2 flex-shrink-0 bg-violet-400" />}
                  <span className={cn("truncate text-sm text-white", a.status === "new" ? "font-semibold" : "font-medium")}>
                    {a.firstName} {a.lastName}
                  </span>
                  {a.cv && <Paperclip aria-label="Has a CV" className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />}
                  <span className="ml-auto flex-shrink-0 text-xs text-slate-500">{shortDate(a.createdAt)}</span>
                </span>
                <span className="mt-1 flex items-center gap-2">
                  <ApplicationBadge status={a.status} />
                  <span className="truncate text-xs text-slate-500">
                    {a.track} · {a.currentStatus}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      </section>
      <section className={cn(box, "min-h-0 overflow-y-auto p-6")}>
        {selected ? (
          <ApplicationDetail key={selected} id={selected} onDeleted={() => setSelected(null)} />
        ) : (
          <div className="grid h-full place-items-center text-sm text-slate-500">Select an application to review it.</div>
        )}
      </section>
    </div>
  );
}

/* ---------------- The page's content ---------------- */
const slugFor = (text: string, taken: Set<string>) => {
  const base = text.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 34) || "track";
  let id = base;
  for (let n = 2; taken.has(id); n++) id = `${base}-${n}`;
  return id;
};

function SectionTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-violet-300">{title}</h3>
      {hint && <p className="mt-1 text-xs leading-5 text-slate-500">{hint}</p>}
    </div>
  );
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button type="button" variant="ghost" aria-label={label} onClick={onClick} className="h-9 w-9 flex-shrink-0 p-0 text-slate-400 hover:bg-red-500/10 hover:text-red-300">
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button type="button" variant="outline" onClick={onClick} className="h-9 border-white/15 bg-transparent text-slate-300 hover:bg-white/[0.06] hover:text-white">
      <Plus className="mr-1.5 h-4 w-4" /> {label}
    </Button>
  );
}

function PageForm() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin", "trainingships"], queryFn: getTrainingshipsPage });
  const [form, setForm] = useState<TrainingshipsConfig>(DEFAULT_TRAININGSHIPS);
  // Tracks added since loading get an id from their name when saved.
  const fresh = useRef(new Set<string>());
  const counter = useRef(0);
  useEffect(() => {
    if (data) {
      setForm(data);
      fresh.current.clear();
    }
  }, [data]);

  const save = useMutation({
    mutationFn: () => {
      const taken = new Set(form.tracks.filter((t) => !fresh.current.has(t.id)).map((t) => t.id));
      const tracks = form.tracks.map((t) => {
        if (!fresh.current.has(t.id)) return t;
        const id = slugFor(t.name, taken);
        taken.add(id);
        return { ...t, id };
      });
      return updateTrainingshipsPage({ ...form, tracks });
    },
    onSuccess: (saved) => {
      qc.setQueryData(["admin", "trainingships"], saved);
      qc.invalidateQueries({ queryKey: ["trainingships"] }); // the public page
      toast.success("Trainingships page saved");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Save failed"),
  });

  if (isLoading) return <p className="text-sm text-slate-400">Loading…</p>;

  const set = <K extends keyof TrainingshipsConfig>(key: K, value: TrainingshipsConfig[K]) => setForm((f) => ({ ...f, [key]: value }));
  const update = <K extends "tracks" | "highlights" | "faqs">(key: K, i: number, patch: Partial<TrainingshipsConfig[K][number]>) =>
    setForm((f) => ({ ...f, [key]: (f[key] as object[]).map((item, j) => (j === i ? { ...item, ...patch } : item)) }));
  const removeAt = <K extends "tracks" | "highlights" | "faqs" | "requirements">(key: K, i: number) =>
    setForm((f) => ({ ...f, [key]: (f[key] as unknown[]).filter((_, j) => j !== i) }));

  const details: [keyof TrainingshipsConfig, string, string][] = [
    ["intake", "Intake", "e.g. January 2027 intake"],
    ["deadline", "Apply by", "e.g. 15 December 2026"],
    ["duration", "Duration", "e.g. 3 months"],
    ["format", "Where", "e.g. At our Accra studio, some remote days"],
    ["commitment", "Time", "e.g. Full time, Monday to Friday"],
  ];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
      className="mx-auto max-w-4xl space-y-8 [&_input]:border-white/10 [&_input]:bg-black/20 [&_input]:text-white [&_textarea]:border-white/10 [&_textarea]:bg-black/20 [&_textarea]:text-white"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Trainingships page</h2>
          <p className="mt-1 text-sm text-slate-400">
            What{" "}
            <a href="/trainingships" target="_blank" rel="noreferrer" className="text-violet-300 hover:text-violet-200">
              /trainingships
            </a>{" "}
            shows. Details left empty are hidden.
          </p>
        </div>
        <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
          <input type="checkbox" checked={form.open} onChange={(e) => set("open", e.target.checked)} className="h-4 w-4 accent-violet-500" />
          <span className="text-sm">
            <span className="block font-medium text-white">Applications open</span>
            <span className="block text-xs text-slate-400">Untick to hide the form and show the closed message</span>
          </span>
        </label>
      </div>

      <section className="space-y-4">
        <SectionTitle title="Details" hint="Shown under the introduction. Leave any empty to hide it." />
        <div className="grid gap-4 sm:grid-cols-2">
          {details.map(([key, label, placeholder]) => (
            <label key={key} className="block">
              <span className="text-xs font-medium text-slate-500">{label}</span>
              <Input value={form[key] as string} placeholder={placeholder} onChange={(e) => set(key, e.target.value as never)} className="mt-1.5 h-9" />
            </label>
          ))}
        </div>
        <label className="block">
          <span className="text-xs font-medium text-slate-500">Introduction</span>
          <Textarea value={form.intro} onChange={(e) => set("intro", e.target.value)} className="mt-1.5 min-h-[90px]" />
        </label>
      </section>

      <section className="space-y-3 border-t border-white/10 pt-8">
        <SectionTitle title="Tracks" hint="What applicants choose from. Applications keep the track's name, so renaming one doesn't change past applications." />
        {form.tracks.map((t, i) => (
          <div key={t.id} className="grid gap-3 md:grid-cols-[14rem_1fr_2.25rem]">
            <Input aria-label={`Track ${i + 1} name`} placeholder="e.g. Data analysis" value={t.name} onChange={(e) => update("tracks", i, { name: e.target.value })} className="h-9" />
            <Input aria-label={`Track ${i + 1} description`} value={t.description} onChange={(e) => update("tracks", i, { description: e.target.value })} className="h-9" />
            <RemoveButton label={`Remove ${t.name || `track ${i + 1}`}`} onClick={() => removeAt("tracks", i)} />
          </div>
        ))}
        <AddButton
          label="Add track"
          onClick={() => {
            const id = `new-${++counter.current}`;
            fresh.current.add(id);
            set("tracks", [...form.tracks, { id, name: "", description: "" }]);
          }}
        />
      </section>

      <section className="space-y-3 border-t border-white/10 pt-8">
        <SectionTitle title="What you'll do" hint="The four cards near the top." />
        {form.highlights.map((h, i) => (
          <div key={i} className="grid gap-3 md:grid-cols-[14rem_1fr_2.25rem]">
            <Input aria-label={`Highlight ${i + 1} title`} value={h.title} onChange={(e) => update("highlights", i, { title: e.target.value })} className="h-9" />
            <Input aria-label={`Highlight ${i + 1} description`} value={h.description} onChange={(e) => update("highlights", i, { description: e.target.value })} className="h-9" />
            <RemoveButton label={`Remove highlight ${i + 1}`} onClick={() => removeAt("highlights", i)} />
          </div>
        ))}
        <AddButton label="Add highlight" onClick={() => set("highlights", [...form.highlights, { title: "", description: "" }])} />
      </section>

      <section className="space-y-3 border-t border-white/10 pt-8">
        <SectionTitle title="Who can apply" />
        {form.requirements.map((r, i) => (
          <div key={i} className="flex gap-3">
            <Input aria-label={`Requirement ${i + 1}`} value={r} onChange={(e) => set("requirements", form.requirements.map((x, j) => (j === i ? e.target.value : x)))} className="h-9" />
            <RemoveButton label={`Remove requirement ${i + 1}`} onClick={() => removeAt("requirements", i)} />
          </div>
        ))}
        <AddButton label="Add requirement" onClick={() => set("requirements", [...form.requirements, ""])} />
      </section>

      <section className="space-y-3 border-t border-white/10 pt-8">
        <SectionTitle title="Questions" hint="Also given to search engines as FAQ data." />
        {form.faqs.map((f, i) => (
          <div key={i} className="space-y-2 border border-white/10 p-3">
            <div className="flex gap-3">
              <Input aria-label={`Question ${i + 1}`} placeholder="Question" value={f.question} onChange={(e) => update("faqs", i, { question: e.target.value })} className="h-9" />
              <RemoveButton label={`Remove question ${i + 1}`} onClick={() => removeAt("faqs", i)} />
            </div>
            <Textarea aria-label={`Answer ${i + 1}`} placeholder="Answer" value={f.answer} onChange={(e) => update("faqs", i, { answer: e.target.value })} className="min-h-[70px]" />
          </div>
        ))}
        <AddButton label="Add question" onClick={() => set("faqs", [...form.faqs, { question: "", answer: "" }])} />
      </section>

      <section className="space-y-3 border-t border-white/10 pt-8">
        <SectionTitle title="When applications are closed" hint="Shown in place of the form." />
        <Textarea aria-label="Closed message" value={form.closedMessage} onChange={(e) => set("closedMessage", e.target.value)} className="min-h-[70px]" />
      </section>

      <div className="sticky bottom-0 -mx-6 flex items-center justify-end gap-3 border-t border-white/10 bg-[#0f0f12]/95 px-6 py-4 backdrop-blur">
        <Button type="submit" disabled={save.isPending} className="h-10 bg-violet-600 px-6 text-white hover:bg-violet-500">
          {save.isPending ? "Saving…" : "Save page"}
        </Button>
      </div>
    </form>
  );
}

/**
 * /admin → Trainingships: the applications (review, status, notes, CV,
 * delete) and the public page's content.
 */
export function TrainingshipsPanel({ linkedId }: { linkedId: string | null }) {
  const [tab, setTab] = useState<"applications" | "page">("applications");
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div role="tablist" aria-label="Trainingships" className="flex gap-1">
        {(
          [
            ["applications", "Applications"],
            ["page", "Page"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn("rounded-lg px-3 py-1.5 text-sm transition-colors", tab === key ? "bg-white/[0.06] text-white" : "text-slate-400 hover:text-white")}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "applications" ? (
        <Applications linkedId={linkedId} />
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto px-1">
          <PageForm />
        </div>
      )}
    </div>
  );
}
