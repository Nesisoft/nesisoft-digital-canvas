import { useId, useState, type BaseSyntheticEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useForm, type RegisterOptions, type UseFormRegisterReturn } from "react-hook-form";
import { toast } from "sonner";
import { ChevronDown, FileText, Loader2, Paperclip, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig } from "@/config/site";
import { services } from "@/data/services";
import { trackEvent } from "@/lib/analytics";
import { API_BASE } from "@/lib/api";

const NOT_SURE = "Not sure yet";

const SERVICE_OPTIONS = [...services.map((service) => service.shortTitle), NOT_SURE];

// Visitors pick the currency they think in, and the ranges follow it.
const CURRENCIES = {
  GHS: {
    symbol: "GH₵",
    name: "Ghana cedis",
    ranges: ["Under GH₵20k", "GH₵20k–50k", "GH₵50k–150k", "GH₵150k+", NOT_SURE],
  },
  USD: {
    symbol: "US$",
    name: "US dollars",
    ranges: ["Under $2k", "$2k–5k", "$5k–15k", "$15k+", NOT_SURE],
  },
} as const;

type Currency = keyof typeof CURRENCIES;

const TIMELINES = ["ASAP", "Within a month", "1–3 months", "3+ months", "Just exploring"];

const SOURCES = ["Google search", "Social media", "Referral", "Event", "Other"];

interface ContactValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  budgetCurrency: Currency;
  budget: string;
  timeline: string;
  message: string;
  source: string;
}

// The same address pattern zod's .email() uses, so validation didn't change
// when the form moved to react-hook-form's built-in rules (zod alone was
// ~12 KB gzipped of the site's JavaScript, for this one form).
const EMAIL = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/;

/** Fails when the value is blank once surrounding spaces are ignored. */
const filled = (message: string) => (value: string) => value.trim() !== "" || message;

// Validation per field; anything not listed is optional and free-form.
const RULES: Partial<Record<keyof ContactValues, RegisterOptions<ContactValues>>> = {
  firstName: { validate: filled("First name is required") },
  lastName: { validate: filled("Last name is required") },
  email: {
    validate: (value: string) =>
      value.trim() === "" ? "Email is required" : EMAIL.test(value.trim()) || "Enter a valid email",
  },
  phone: {
    pattern: { value: /^[\d\s()+-]*$/, message: "Use digits, spaces, +, - and brackets only" },
  },
  service: { required: "Choose what you need" },
  message: {
    validate: (value: string) =>
      value.trim().length >= 10 || "Please tell us a bit more (min 10 characters)",
  },
};

const TRIMMED: (keyof ContactValues)[] = ["firstName", "lastName", "email", "phone", "company", "message"];

/** What gets sent: the text fields without stray surrounding spaces. */
function tidy(values: ContactValues): ContactValues {
  const out = { ...values };
  for (const key of TRIMMED) (out[key] as string) = values[key].trim();
  return out;
}

const defaultValues: ContactValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  company: "",
  service: "",
  budgetCurrency: "GHS",
  budget: "",
  timeline: "",
  message: "",
  source: "",
};

const SENT_MESSAGE = "Message sent! We'll reply within one business day.";

// An optional brief: PDF or Word (.docx), up to 4 MB (the server checks the
// bytes too; see server/src/documentTypes.js).
const MAX_FILE_BYTES = 4 * 1024 * 1024;
const FILE_ACCEPT =
  ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function fileProblem(file: File): string | null {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension !== "pdf" && extension !== "docx") return "Attach a PDF or Word (.docx) document";
  if (file.size === 0) return "That file is empty";
  if (file.size > MAX_FILE_BYTES) return "That file is too large: attach one up to 4 MB";
  return null;
}

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/** A failed submission, with whether it's worth offering email instead. */
class SubmitError extends Error {
  constructor(
    message: string,
    readonly offerEmail: boolean
  ) {
    super(message);
  }
}

/**
 * The optional answers as readable [label, value] pairs, in form order,
 * leaving out anything skipped. Feeds the submission and the mailto: fallback.
 */
function describeDetails(values: ContactValues): [string, string][] {
  // "Not sure yet" exists in both currencies, so keep the one they picked.
  const budget =
    values.budget === NOT_SURE
      ? `${NOT_SURE} (${CURRENCIES[values.budgetCurrency].symbol})`
      : values.budget;
  const details: [string, string][] = [
    ["Phone / WhatsApp", values.phone],
    ["Company / organisation", values.company],
    ["Service", values.service],
    ["Budget", budget],
    ["Timeline", values.timeline],
    ["Heard about us via", values.source],
  ];
  return details.filter(([, value]) => value);
}

const labelClass = "mb-2 block text-sm font-medium text-slate-300";

// Two short fields side by side from md up. No row gap there: each field's
// label, control and error share the row's tracks (see Field) and keep their
// own margins, so a gap would only pad the empty error row.
const pairClass = "grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-y-0";

const inputClass =
  "h-11 rounded-lg border-white/10 bg-black/20 text-white placeholder:text-slate-500 focus-visible:border-violet-400/60 focus-visible:ring-violet-400";

// Native <select>s dressed like the inputs: they work with register as-is,
// and phones get their own pickers. Shows placeholder grey until a choice.
const selectClass =
  "flex h-11 w-full appearance-none rounded-lg border border-white/10 bg-black/20 pl-3 pr-10 text-base text-white ring-offset-background focus-visible:border-violet-400/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 has-[option[value='']:checked]:text-slate-500 md:text-sm [&>option]:bg-slate-900 [&>option]:text-white";

interface FieldIds {
  id: string;
  describedBy?: string;
  invalid: boolean;
  required: boolean;
}

interface FieldProps {
  label: string;
  name: keyof ContactValues;
  error?: string;
  /** Labels the field "(optional)"; every other field is marked required. */
  optional?: boolean;
  /** Shared id prefix so this form's fields stay unique on the page. */
  formId: string;
  children: (ids: FieldIds) => ReactNode;
}

function OptionalTag() {
  return <span className="font-normal text-slate-500"> (optional)</span>;
}

/** Associates a label + error message with its control for screen readers. */
function Field({ label, name, error, optional, formId, children }: FieldProps) {
  const id = `${formId}-${name}`;
  const errorId = `${id}-error`;
  // Side by side (md+), a field spans three rows of its pair's grid (label,
  // control, error) and shares them via subgrid, so the two controls stay
  // level when one label wraps in a narrower card.
  return (
    <div className="md:row-span-3 md:grid md:grid-rows-subgrid">
      <label htmlFor={id} className={labelClass}>
        {label}
        {optional ? (
          <OptionalTag />
        ) : (
          <span aria-hidden className="text-violet-300">
            {" "}
            *
          </span>
        )}
      </label>
      {children({
        id,
        describedBy: error ? errorId : undefined,
        invalid: !!error,
        required: !optional,
      })}
      {error && (
        <p id={errorId} className="mt-1 text-xs text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}

/** Optional brief upload: click to choose, or drop a file on it. */
function AttachmentField({
  formId,
  file,
  error,
  onChange,
}: {
  formId: string;
  file: File | null;
  error: string | null;
  onChange: (file: File | null) => void;
}) {
  const id = `${formId}-attachment`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const [dragging, setDragging] = useState(false);

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        Project brief
        <OptionalTag />
      </label>
      {file ? (
        <div className="flex items-center gap-3 border border-white/10 bg-black/20 px-3 py-2.5">
          <FileText aria-hidden className="h-5 w-5 flex-shrink-0 text-violet-300" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-white">{file.name}</p>
            <p className="text-xs text-slate-400">{formatSize(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label={`Remove ${file.name}`}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={id}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            onChange(e.dataTransfer.files?.[0] ?? null);
          }}
          className={`flex cursor-pointer items-center gap-3 border border-dashed px-3 py-3 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-violet-400 ${
            dragging
              ? "border-violet-400 bg-violet-500/10 text-white"
              : "border-white/15 bg-black/20 text-slate-300 hover:border-violet-400/50 hover:text-white"
          }`}
        >
          <Paperclip aria-hidden className="h-5 w-5 flex-shrink-0 text-violet-300" />
          <span>
            <span className="font-medium text-white">Attach a brief</span> or drop it here
          </span>
          <input
            id={id}
            type="file"
            accept={FILE_ACCEPT}
            className="sr-only"
            aria-describedby={error ? `${hintId} ${errorId}` : hintId}
            aria-invalid={!!error}
            onChange={(e) => {
              onChange(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />
        </label>
      )}
      <p id={hintId} className="mt-1 text-xs text-slate-400">
        PDF or Word (.docx), up to 4 MB.
      </p>
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Functional, validated, accessible contact form shared by the homepage
 * section and the dedicated /contact page. Besides name, email and message
 * it asks what the owner needs to qualify a lead (service, budget, timeline,
 * phone, company, referral source); only the service is required of those.
 * A brief (PDF or .docx) can be attached.
 *
 * It posts to the site's own API (POST /api/inquiries), which keeps the
 * inquiry for /admin and emails the company inbox. If that fails, the error
 * offers a prefilled email instead, so the form is never a dead end.
 */
export function ContactForm() {
  const formId = useId();
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);

  const chooseAttachment = (file: File | null) => {
    const problem = file ? fileProblem(file) : null;
    setAttachmentError(problem);
    setAttachment(problem ? null : file);
  };
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({ defaultValues });

  const currency = watch("budgetCurrency");
  // A cedi range means nothing in dollars, so switching starts the range over.
  const currencyField = register("budgetCurrency", {
    onChange: () => setValue("budget", ""),
  });

  const onSubmit = async (raw: ContactValues, event?: BaseSyntheticEvent) => {
    const values = tidy(raw);
    // Honeypot: hidden from people, so only bots ever tick it. They get the
    // usual success message, but nothing is sent.
    if (new FormData(event?.target).has("botcheck")) {
      toast.success(SENT_MESSAGE);
      reset();
      setAttachment(null);
      return;
    }
    if (attachmentError) return;

    // What was asked about, never who asked.
    trackEvent("Contact Form Submit", {
      service: values.service,
      budgetCurrency: values.budget ? values.budgetCurrency : "none",
      attachment: attachment ? "yes" : "no",
    });

    const details = describeDetails(values);
    const detail = (label: string) => details.find(([l]) => l === label)?.[1] ?? "";
    const body = new FormData();
    body.set("firstName", values.firstName);
    body.set("lastName", values.lastName);
    body.set("email", values.email);
    body.set("phone", values.phone);
    body.set("company", values.company);
    body.set("service", values.service);
    body.set("budget", detail("Budget"));
    body.set("timeline", values.timeline);
    body.set("source", values.source);
    body.set("message", values.message);
    body.set("page", window.location.pathname);
    if (attachment) body.set("attachment", attachment);

    try {
      let res: Response;
      try {
        res = await fetch(`${API_BASE}/api/inquiries`, { method: "POST", body });
      } catch {
        throw new SubmitError("We couldn't reach our server.", true);
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        // 4xx: something to fix (or wait out); 5xx: our side, so offer email.
        throw new SubmitError(
          data.error || "We couldn't send your message right now.",
          res.status >= 500
        );
      }
      const result = (await res.json().catch(() => ({}))) as { fileReceived?: boolean; copySent?: boolean };
      if (attachment && result.fileReceived === false) {
        toast.warning("Message sent, but your file didn't come through.", {
          description: `Please email it to ${siteConfig.contact.emailGeneral}.`,
          duration: 15000,
        });
      } else {
        toast.success(SENT_MESSAGE, {
          description: result.copySent ? `We've emailed a confirmation to ${values.email}.` : undefined,
        });
      }
      reset();
      setAttachment(null);
    } catch (err) {
      const offerEmail = !(err instanceof SubmitError) || err.offerEmail;
      const message = err instanceof Error ? err.message : "Something went wrong.";
      if (!offerEmail) {
        toast.error(message);
        return;
      }
      // Never a dead end: their email app, with everything filled in.
      const name = `${values.firstName} ${values.lastName}`;
      const topic = values.service === NOT_SURE ? "General" : values.service;
      const mailBody = [
        `Name: ${name}`,
        `Email: ${values.email}`,
        ...details.map(([label, value]) => `${label}: ${value}`),
        "",
        values.message,
        ...(attachment ? ["", `(Please attach ${attachment.name} to this email.)`] : []),
      ].join("\n");
      const mailto = `mailto:${siteConfig.contact.emailGeneral}?subject=${encodeURIComponent(
        `[Website] ${topic} enquiry from ${name}`
      )}&body=${encodeURIComponent(mailBody)}`;
      toast.error(message, {
        description: "Please try again, or send it by email instead.",
        action: { label: "Email us", onClick: () => (window.location.href = mailto) },
        duration: 15000,
      });
    }
  };

  // Wires react-hook-form registration together with the a11y ids/state.
  const field = (
    name: keyof ContactValues,
    ids: FieldIds
  ): UseFormRegisterReturn & {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby"?: string;
    "aria-required"?: boolean;
  } => ({
    ...register(name, RULES[name]),
    id: ids.id,
    "aria-invalid": ids.invalid,
    "aria-describedby": ids.describedBy,
    "aria-required": ids.required || undefined,
  });

  const select = (
    name: keyof ContactValues,
    ids: FieldIds,
    placeholder: string,
    options: readonly string[]
  ) => (
    <div className="relative">
      <select className={selectClass} {...field(name, ids)}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
      />
    </div>
  );

  const budgetId = `${formId}-budget`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <p className="text-xs text-slate-400">
        Fields marked <span className="text-violet-300">*</span> are required.
      </p>
      <div className={pairClass}>
        <Field label="First name" name="firstName" error={errors.firstName?.message} formId={formId}>
          {(ids) => (
            <Input autoComplete="given-name" className={inputClass} placeholder="John" {...field("firstName", ids)} />
          )}
        </Field>
        <Field label="Last name" name="lastName" error={errors.lastName?.message} formId={formId}>
          {(ids) => (
            <Input autoComplete="family-name" className={inputClass} placeholder="Doe" {...field("lastName", ids)} />
          )}
        </Field>
      </div>
      <div className={pairClass}>
        <Field label="Email" name="email" error={errors.email?.message} formId={formId}>
          {(ids) => (
            <Input
              type="email"
              autoComplete="email"
              className={inputClass}
              placeholder="john@example.com"
              {...field("email", ids)}
            />
          )}
        </Field>
        <Field label="Phone / WhatsApp" name="phone" optional error={errors.phone?.message} formId={formId}>
          {(ids) => (
            <Input
              type="tel"
              autoComplete="tel"
              className={inputClass}
              placeholder="+233 20 000 0000"
              {...field("phone", ids)}
            />
          )}
        </Field>
      </div>
      <div className={pairClass}>
        <Field label="Company or organisation" name="company" optional formId={formId}>
          {(ids) => (
            <Input autoComplete="organization" className={inputClass} placeholder="Acme Ltd" {...field("company", ids)} />
          )}
        </Field>
        <Field label="What do you need?" name="service" error={errors.service?.message} formId={formId}>
          {(ids) => select("service", ids, "Choose a service", SERVICE_OPTIONS)}
        </Field>
      </div>

      <fieldset>
        <legend className={labelClass}>
          Budget
          <OptionalTag />
        </legend>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div
            role="radiogroup"
            aria-label="Currency"
            className="flex h-11 flex-shrink-0 self-start border border-white/10 bg-black/20 p-1"
          >
            {(Object.keys(CURRENCIES) as Currency[]).map((code) => (
              <label key={code} htmlFor={`${formId}-currency-${code}`} className="relative">
                <input
                  type="radio"
                  id={`${formId}-currency-${code}`}
                  value={code}
                  className="peer sr-only"
                  {...currencyField}
                />
                <span className="flex h-full cursor-pointer items-center px-3 text-sm font-medium text-slate-400 transition-colors hover:text-white peer-checked:bg-violet-600 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-inset peer-focus-visible:ring-violet-300">
                  {CURRENCIES[code].symbol}
                  <span className="sr-only"> {CURRENCIES[code].name}</span>
                </span>
              </label>
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <label htmlFor={budgetId} className="sr-only">
              Budget range
            </label>
            {select(
              "budget",
              { id: budgetId, invalid: false, required: false },
              "Select a range",
              CURRENCIES[currency].ranges
            )}
          </div>
        </div>
      </fieldset>

      <div className={pairClass}>
        <Field label="Timeline" name="timeline" optional formId={formId}>
          {(ids) => select("timeline", ids, "Select a timeline", TIMELINES)}
        </Field>
        <Field label="How did you hear about us?" name="source" optional formId={formId}>
          {(ids) => select("source", ids, "Select one", SOURCES)}
        </Field>
      </div>
      <Field label="Message" name="message" error={errors.message?.message} formId={formId}>
        {(ids) => (
          <Textarea
            className={`${inputClass} min-h-[120px] py-3`}
            placeholder="What are you building, who is it for, and is there a deadline?"
            {...field("message", ids)}
          />
        )}
      </Field>
      <AttachmentField
        formId={formId}
        file={attachment}
        error={attachmentError}
        onChange={chooseAttachment}
      />
      <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} aria-hidden="true" />
      <div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 w-full rounded-lg bg-violet-600 font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              Sending…
              <Loader2 className="ml-2 animate-spin" size={20} />
            </>
          ) : (
            <>
              Send Message
              <Send className="ml-2" size={20} />
            </>
          )}
        </Button>
        <p className="mt-3 text-center text-xs text-slate-300">
          What happens next: we read every brief and reply within one business day.
        </p>
        <p className="mt-1 text-center text-xs text-slate-400">
          We only use your details to reply. See our{" "}
          <Link
            to="/privacy"
            className="text-violet-300 underline underline-offset-2 transition-colors hover:text-violet-200"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </form>
  );
}
