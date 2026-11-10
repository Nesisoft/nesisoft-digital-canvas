import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle2, ChevronDown, FileText, Loader2, Paperclip, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { API_BASE } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { attributionFields } from "@/lib/attribution";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { CURRENT_STATUSES, type TrainingshipTrack } from "@shared/trainingships.js";

// The same check as the other forms and the server (server/src/emailAddress.js).
const EMAIL = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/;
const URL_PATTERN = /^https?:\/\/[^\s<>"'`]{3,300}$/i;
const MIN_MOTIVATION = 50;

// A CV: PDF or Word (.docx), up to 4 MB (the server checks the bytes too).
const MAX_FILE_BYTES = 4 * 1024 * 1024;
const FILE_ACCEPT = ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const inputClass =
  "h-11 border-white/10 bg-black/20 text-white placeholder:text-slate-500 focus-visible:border-violet-400/60 focus-visible:ring-violet-400";
const selectClass =
  "flex h-11 w-full appearance-none border border-white/10 bg-black/20 pl-3 pr-10 text-base text-white focus-visible:border-violet-400/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 has-[option[value='']:checked]:text-slate-500 md:text-sm [&>option]:bg-slate-900 [&>option]:text-white";
const labelClass = "mb-2 block text-sm font-medium text-slate-300";

interface Values {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currentStatus: string;
  school: string;
  motivation: string;
  links: string;
  availability: string;
}
type Field = keyof Values | "track" | "cv";
type Errors = Partial<Record<Field, string>>;

const EMPTY: Values = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  currentStatus: "",
  school: "",
  motivation: "",
  links: "",
  availability: "",
};

function check(values: Values, track: string): Errors {
  const errors: Errors = {};
  if (!values.firstName.trim()) errors.firstName = "First name is required";
  if (!values.lastName.trim()) errors.lastName = "Last name is required";
  if (!values.email.trim()) errors.email = "Email is required";
  else if (!EMAIL.test(values.email.trim())) errors.email = "Enter a valid email";
  if (!/^[\d\s()+-]*$/.test(values.phone)) errors.phone = "Use digits, spaces, +, - and brackets only";
  if (!track) errors.track = "Choose a track";
  if (!values.currentStatus) errors.currentStatus = "Choose what you're doing now";
  if (values.motivation.trim().length < MIN_MOTIVATION) {
    errors.motivation = `Tell us a bit more (at least ${MIN_MOTIVATION} characters)`;
  }
  const links = values.links.split(/\s+/).filter(Boolean);
  if (links.length > 3) errors.links = "Add up to three links";
  else if (links.some((link) => !URL_PATTERN.test(link))) errors.links = "Links must start with https://";
  return errors;
}

function fileProblem(file: File): string | null {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension !== "pdf" && extension !== "docx") return "Attach a PDF or Word (.docx) document";
  if (file.size === 0) return "That file is empty";
  if (file.size > MAX_FILE_BYTES) return "That file is too large: attach one up to 4 MB";
  return null;
}

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/**
 * The Trainingship application form (/trainingships). Posts to
 * POST /api/trainingships/applications, which keeps it for /admin →
 * Trainingships, emails the company inbox (with the CV) and sends the
 * applicant a confirmation. `track` is chosen here or from a track card.
 */
export function ApplicationForm({
  tracks,
  track,
  onTrackChange,
}: {
  tracks: TrainingshipTrack[];
  track: string;
  onTrackChange: (id: string) => void;
}) {
  const id = useId();
  const [values, setValues] = useState<Values>(EMPTY);
  const [cv, setCv] = useState<File | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<{ email: string; copySent: boolean } | null>(null);

  const set = (name: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((errs) => ({ ...errs, [name]: undefined }));
  };

  const chooseCv = (file: File | null) => {
    const problem = file ? fileProblem(file) : null;
    setErrors((errs) => ({ ...errs, cv: problem ?? undefined }));
    setCv(problem ? null : file);
  };

  const trackName = tracks.find((t) => t.id === track)?.name ?? "";

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const clean = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim()])) as unknown as Values;
    if (new FormData(e.currentTarget).has("botcheck")) return setSent({ email: clean.email, copySent: false });
    const problems = { ...check(values, track), ...(errors.cv ? { cv: errors.cv } : {}) };
    setErrors(problems);
    const first = Object.keys(problems).find((key) => problems[key as Field]);
    if (first) {
      document.getElementById(`${id}-${first}`)?.focus();
      return;
    }

    const body = new FormData();
    (Object.keys(clean) as (keyof Values)[]).forEach((key) => body.set(key, clean[key]));
    body.set("track", track);
    body.set("page", window.location.pathname);
    for (const [key, value] of Object.entries(attributionFields())) body.set(key, value);
    if (cv) body.set("cv", cv);

    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/trainingships/applications`, { method: "POST", body }).catch(() => null);
      if (res?.ok) {
        const result = (await res.json().catch(() => ({}))) as { copySent?: boolean; fileReceived?: boolean };
        trackEvent("Trainingship Application", { track });
        if (cv && result.fileReceived === false) {
          toast.warning("Application sent, but your CV didn't come through.", {
            description: `Please email it to ${siteConfig.contact.emailGeneral}.`,
            duration: 15000,
          });
        }
        setSent({ email: clean.email, copySent: result.copySent === true });
        return;
      }
      const data = res ? ((await res.json().catch(() => ({}))) as { error?: string }) : {};
      const message = data.error || "We couldn't send your application right now.";
      if (res && res.status < 500) {
        toast.error(message);
        return;
      }
      const mailBody = [
        `Name: ${clean.firstName} ${clean.lastName}`,
        `Email: ${clean.email}`,
        ...(clean.phone ? [`Phone / WhatsApp: ${clean.phone}`] : []),
        `Track: ${trackName}`,
        `Currently: ${clean.currentStatus}`,
        ...(clean.school ? [`School or organisation: ${clean.school}`] : []),
        ...(clean.links ? [`Links: ${clean.links}`] : []),
        ...(clean.availability ? [`Availability: ${clean.availability}`] : []),
        "",
        clean.motivation,
        ...(cv ? ["", `(Please attach ${cv.name} to this email.)`] : []),
      ].join("\n");
      const mailto = `mailto:${siteConfig.contact.emailGeneral}?subject=${encodeURIComponent(
        `[Website] Trainingship application from ${clean.firstName} ${clean.lastName}`
      )}&body=${encodeURIComponent(mailBody)}`;
      toast.error(message, {
        description: "Please try again, or send it by email instead.",
        action: { label: "Email us", onClick: () => (window.location.href = mailto) },
        duration: 15000,
      });
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div role="status" className="flex items-start gap-3 border border-emerald-400/25 bg-emerald-400/10 p-6">
        <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-emerald-300" />
        <div>
          <p className="text-lg font-semibold text-white">
            Thanks{values.firstName.trim() ? `, ${values.firstName.trim()}` : ""}. Your application is in.
          </p>
          <p className="mt-2 text-slate-300">
            We read every application. If you're shortlisted, we'll be in touch at {sent.email || "your email"}.
          </p>
          {sent.copySent && (
            <p className="mt-2 text-slate-300">
              We've emailed you a confirmation. If it isn't in your inbox, check your spam or promotions folder.
            </p>
          )}
        </div>
      </div>
    );
  }

  const label = (name: Field, text: string, optional = false) => (
    <label htmlFor={`${id}-${name}`} className={labelClass}>
      {text}
      {optional ? (
        <span className="font-normal text-slate-500"> (optional)</span>
      ) : (
        <span aria-hidden className="text-violet-300"> *</span>
      )}
    </label>
  );
  const error = (name: Field) =>
    errors[name] ? (
      <p id={`${id}-${name}-error`} className="mt-1 text-xs text-rose-300">
        {errors[name]}
      </p>
    ) : null;
  const a11y = (name: Field, optional = false) => ({
    id: `${id}-${name}`,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `${id}-${name}-error` : undefined,
    "aria-required": optional ? undefined : true,
  });
  const select = (name: "track" | "currentStatus", value: string, onChange: (v: string) => void, placeholder: string, options: [string, string][]) => (
    <div className="relative">
      <select className={selectClass} value={value} onChange={(e) => onChange(e.target.value)} {...a11y(name)}>
        <option value="">{placeholder}</option>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <p className="text-xs text-slate-400">
        Fields marked <span className="text-violet-300">*</span> are required.
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          {label("firstName", "First name")}
          <Input autoComplete="given-name" className={inputClass} value={values.firstName} onChange={set("firstName")} {...a11y("firstName")} />
          {error("firstName")}
        </div>
        <div>
          {label("lastName", "Last name")}
          <Input autoComplete="family-name" className={inputClass} value={values.lastName} onChange={set("lastName")} {...a11y("lastName")} />
          {error("lastName")}
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          {label("email", "Email")}
          <Input type="email" autoComplete="email" className={inputClass} placeholder="you@example.com" value={values.email} onChange={set("email")} {...a11y("email")} />
          {error("email")}
        </div>
        <div>
          {label("phone", "Phone / WhatsApp", true)}
          <Input type="tel" autoComplete="tel" className={inputClass} placeholder="+233 20 000 0000" value={values.phone} onChange={set("phone")} {...a11y("phone", true)} />
          {error("phone")}
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          {label("track", "Track")}
          {select(
            "track",
            track,
            (v) => {
              onTrackChange(v);
              if (errors.track) setErrors((errs) => ({ ...errs, track: undefined }));
            },
            "Choose a track",
            tracks.map((t) => [t.id, t.name])
          )}
          {error("track")}
        </div>
        <div>
          {label("currentStatus", "What are you doing now?")}
          {select(
            "currentStatus",
            values.currentStatus,
            (v) => {
              setValues((vals) => ({ ...vals, currentStatus: v }));
              if (errors.currentStatus) setErrors((errs) => ({ ...errs, currentStatus: undefined }));
            },
            "Choose one",
            CURRENT_STATUSES.map((s) => [s, s])
          )}
          {error("currentStatus")}
        </div>
      </div>
      <div>
        {label("school", "School, university or organisation", true)}
        <Input autoComplete="organization" className={inputClass} value={values.school} onChange={set("school")} {...a11y("school", true)} />
      </div>
      <div>
        {label("motivation", "Why do you want to join, and what have you built or designed so far?")}
        <Textarea
          className={cn(inputClass, "min-h-[140px] py-3")}
          placeholder="What you'd like to learn, what you've made (school projects count), and what you hope to do next."
          maxLength={3000}
          value={values.motivation}
          onChange={set("motivation")}
          {...a11y("motivation")}
        />
        <p className="mt-1 text-xs text-slate-500">
          {values.motivation.trim().length < MIN_MOTIVATION
            ? `At least ${MIN_MOTIVATION} characters (${values.motivation.trim().length} so far).`
            : `${values.motivation.trim().length} characters.`}
        </p>
        {error("motivation")}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          {label("links", "Portfolio, GitHub or LinkedIn", true)}
          <Textarea
            className={cn(inputClass, "min-h-[76px] py-3")}
            placeholder={"https://github.com/you\nhttps://linkedin.com/in/you"}
            value={values.links}
            onChange={set("links")}
            {...a11y("links", true)}
          />
          <p className="mt-1 text-xs text-slate-500">Up to three links, one per line.</p>
          {error("links")}
        </div>
        <div>
          {label("availability", "Availability", true)}
          <Textarea
            className={cn(inputClass, "min-h-[76px] py-3")}
            placeholder="From January, about 20 hours a week"
            maxLength={300}
            value={values.availability}
            onChange={set("availability")}
            {...a11y("availability", true)}
          />
          <p className="mt-1 text-xs text-slate-500">When could you start, and how many hours a week?</p>
        </div>
      </div>
      <div>
        {label("cv", "CV", true)}
        {cv ? (
          <div className="flex items-center gap-3 border border-white/10 bg-black/20 px-3 py-2.5">
            <FileText aria-hidden className="h-5 w-5 flex-shrink-0 text-violet-300" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-white">{cv.name}</p>
              <p className="text-xs text-slate-400">{formatSize(cv.size)}</p>
            </div>
            <button
              type="button"
              onClick={() => chooseCv(null)}
              aria-label={`Remove ${cv.name}`}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center text-slate-400 hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label
            htmlFor={`${id}-cv`}
            className="flex cursor-pointer items-center gap-3 border border-dashed border-white/15 bg-black/20 px-3 py-3 text-sm text-slate-300 transition-colors hover:border-violet-400/50 hover:text-white has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-violet-400"
          >
            <Paperclip aria-hidden className="h-5 w-5 flex-shrink-0 text-violet-300" />
            <span>
              <span className="font-medium text-white">Attach your CV</span> (PDF or Word, up to 4 MB)
            </span>
            <input
              id={`${id}-cv`}
              type="file"
              accept={FILE_ACCEPT}
              className="sr-only"
              aria-invalid={Boolean(errors.cv)}
              aria-describedby={errors.cv ? `${id}-cv-error` : undefined}
              onChange={(e) => {
                chooseCv(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
          </label>
        )}
        {error("cv")}
      </div>
      <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} aria-hidden="true" />
      <Button type="submit" disabled={sending} className="h-11 w-full bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-70">
        {sending ? (
          <>
            Sending… <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          </>
        ) : (
          <>
            Send my application <Send className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
      <p className="text-center text-xs text-slate-400">
        We only use your details to consider your application. See our{" "}
        <Link to="/privacy" className="text-violet-300 underline underline-offset-2 hover:text-violet-200">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}
