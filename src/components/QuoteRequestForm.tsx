import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { API_BASE } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import type { Currency, SelectionInput } from "@shared/estimator.js";

// The same check as the contact form and the server (server/src/emailAddress.js).
const EMAIL = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/;

const inputClass =
  "h-11 border-white/10 bg-black/20 text-white placeholder:text-slate-500 focus-visible:border-violet-400/60 focus-visible:ring-violet-400";
const labelClass = "mb-2 block text-sm font-medium text-slate-300";

interface Values {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  message: string;
}

type Errors = Partial<Record<keyof Values, string>>;

const EMPTY: Values = { firstName: "", lastName: "", email: "", phone: "", company: "", message: "" };

function check(values: Values): Errors {
  const errors: Errors = {};
  if (!values.firstName.trim()) errors.firstName = "First name is required";
  if (!values.lastName.trim()) errors.lastName = "Last name is required";
  if (!values.email.trim()) errors.email = "Email is required";
  else if (!EMAIL.test(values.email.trim())) errors.email = "Enter a valid email";
  if (!/^[\d\s()+-]*$/.test(values.phone)) errors.phone = "Use digits, spaces, +, - and brackets only";
  return errors;
}

/**
 * "Get a detailed quote" under the cost calculator. Sends the visitor's
 * details with their answers to POST /api/inquiries, which works the
 * estimate out again from the live price list and files it in /admin →
 * Inquiries (and emails the company inbox). `summary` is the estimate in
 * words, for the email fallback if the request can't get through.
 */
export function QuoteRequestForm({
  answers,
  currency,
  summary,
  range,
}: {
  answers: SelectionInput;
  currency: Currency;
  summary: string[];
  /** The range they're looking at, e.g. "GH₵52,000–79,000". */
  range: string;
}) {
  const id = useId();
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const set = (field: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((errs) => ({ ...errs, [field]: undefined }));
  };

  const emailFallback = (clean: Values) => {
    const body = [
      `Name: ${clean.firstName} ${clean.lastName}`,
      `Email: ${clean.email}`,
      ...(clean.phone ? [`Phone / WhatsApp: ${clean.phone}`] : []),
      ...(clean.company ? [`Company: ${clean.company}`] : []),
      "",
      ...summary,
      ...(clean.message ? ["", clean.message] : []),
    ].join("\n");
    return `mailto:${siteConfig.contact.emailGeneral}?subject=${encodeURIComponent(
      `[Website] Quote request from ${clean.firstName} ${clean.lastName}`
    )}&body=${encodeURIComponent(body)}`;
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const clean = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, value.trim()])
    ) as unknown as Values;
    // Honeypot: hidden from people, so only bots tick it.
    if (new FormData(e.currentTarget).has("botcheck")) return setSentTo(clean.email);
    const problems = check(values);
    setErrors(problems);
    if (Object.keys(problems).length > 0) {
      document.getElementById(`${id}-${Object.keys(problems)[0]}`)?.focus();
      return;
    }

    const body = new FormData();
    (Object.keys(clean) as (keyof Values)[]).forEach((key) => body.set(key, clean[key]));
    body.set("page", window.location.pathname);
    body.set("estimate", JSON.stringify({ ...answers, currency }));

    setSending(true);
    try {
      // null when the server couldn't be reached at all.
      const res = await fetch(`${API_BASE}/api/inquiries`, { method: "POST", body }).catch(() => null);
      if (res?.ok) {
        trackEvent("Quote Request", { type: answers.type ?? "", currency });
        setSentTo(clean.email);
        return;
      }
      const data = res ? ((await res.json().catch(() => ({}))) as { error?: string }) : {};
      const message = data.error || "We couldn't send your request right now.";
      // 4xx: something to fix (or wait out); 5xx or no answer: offer email.
      if (res && res.status < 500) {
        toast.error(message);
        return;
      }
      toast.error(message, {
        description: "Please try again, or send it by email instead.",
        action: { label: "Email us", onClick: () => (window.location.href = emailFallback(clean)) },
        duration: 15000,
      });
    } finally {
      setSending(false);
    }
  };

  if (sentTo !== null) {
    return (
      <div role="status" className="flex items-start gap-3 border border-emerald-400/25 bg-emerald-400/10 p-6">
        <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-emerald-300" />
        <div>
          <p className="text-lg font-semibold text-white">Thanks{values.firstName.trim() ? `, ${values.firstName.trim()}` : ""}. Your estimate is with us.</p>
          <p className="mt-2 text-slate-300">
            We'll look over your answers ({range}) and reply to {sentTo || "you"} within one business day with a
            detailed quote, or a few questions if we need more detail.
          </p>
          <button
            type="button"
            onClick={() => {
              setSentTo(null);
              setValues(EMPTY);
            }}
            className="mt-4 text-sm font-medium text-violet-300 underline underline-offset-4 hover:text-white"
          >
            Send another estimate
          </button>
        </div>
      </div>
    );
  }

  const field = (name: keyof Values, label: string, input: React.ReactNode, optional = false) => (
    <div>
      <label htmlFor={`${id}-${name}`} className={labelClass}>
        {label}
        {optional ? (
          <span className="font-normal text-slate-500"> (optional)</span>
        ) : (
          <span aria-hidden className="text-violet-300"> *</span>
        )}
      </label>
      {input}
      {errors[name] && (
        <p id={`${id}-${name}-error`} className="mt-1 text-xs text-rose-300">
          {errors[name]}
        </p>
      )}
    </div>
  );

  const props = (name: keyof Values, optional = false) => ({
    id: `${id}-${name}`,
    value: values[name],
    onChange: set(name),
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `${id}-${name}-error` : undefined,
    "aria-required": optional ? undefined : true,
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {field("firstName", "First name", <Input autoComplete="given-name" className={inputClass} {...props("firstName")} />)}
        {field("lastName", "Last name", <Input autoComplete="family-name" className={inputClass} {...props("lastName")} />)}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {field(
          "email",
          "Email",
          <Input type="email" autoComplete="email" className={inputClass} placeholder="you@company.com" {...props("email")} />
        )}
        {field(
          "phone",
          "Phone / WhatsApp",
          <Input type="tel" autoComplete="tel" className={inputClass} placeholder="+233 20 000 0000" {...props("phone", true)} />,
          true
        )}
      </div>
      {field(
        "company",
        "Company or organisation",
        <Input autoComplete="organization" className={inputClass} {...props("company", true)} />,
        true
      )}
      {field(
        "message",
        "Anything else we should know?",
        <Textarea
          className={cn(inputClass, "min-h-[100px] py-3")}
          placeholder="Who it's for, a deadline, an app you like the look of…"
          maxLength={5000}
          {...props("message", true)}
        />,
        true
      )}
      <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} aria-hidden="true" />
      <Button type="submit" disabled={sending} className="h-11 w-full bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-70">
        {sending ? (
          <>
            Sending… <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          </>
        ) : (
          <>
            Send me a detailed quote <Send className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
      <p className="text-center text-xs text-slate-400">
        We reply within one business day and only use your details to do so. See our{" "}
        <Link to="/privacy" className="text-violet-300 underline underline-offset-2 hover:text-violet-200">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}
