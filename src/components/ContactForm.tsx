import { useId, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig } from "@/config/site";
import { trackEvent } from "@/lib/analytics";
import { WEB3FORMS_KEY, submitToWeb3Forms } from "@/lib/web3forms";

const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Please tell us a bit more (min 10 characters)"),
});

type ContactValues = z.infer<typeof contactSchema>;

const inputClass =
  "h-11 rounded-lg border-white/10 bg-black/20 text-white placeholder:text-slate-500 focus-visible:border-violet-400/60 focus-visible:ring-violet-400";

interface FieldProps {
  label: string;
  name: keyof ContactValues;
  error?: string;
  /** Shared id prefix so this form's fields stay unique on the page. */
  formId: string;
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
}

/** Associates a label + error message with its control for screen readers. */
function Field({ label, name, error, formId, children }: FieldProps) {
  const id = `${formId}-${name}`;
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>
      {children({ id, describedBy: error ? errorId : undefined, invalid: !!error })}
      {error && (
        <p id={errorId} className="mt-1 text-xs text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Functional, validated, accessible contact form shared by the homepage
 * section and the dedicated /contact page. Replaces the old version that only
 * did `console.log` + `alert("Message sent")` and dropped every real lead.
 *
 * Submission strategy:
 *   1. If VITE_WEB3FORMS_ACCESS_KEY is set → POST to Web3Forms (no backend
 *      needed; get a free key at https://web3forms.com tied to your inbox).
 *   2. Otherwise → fall back to a prefilled mailto: so the form is never a
 *      dead end, even before the key is configured.
 */
export function ContactForm() {
  const formId = useId();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (values: ContactValues) => {
    trackEvent("Contact Form Submit");

    if (!WEB3FORMS_KEY) {
      // Graceful fallback: open the user's mail client with everything filled.
      const body = encodeURIComponent(
        `Name: ${values.firstName} ${values.lastName}\nEmail: ${values.email}\n\n${values.message}`
      );
      const subject = encodeURIComponent(values.subject);
      window.location.href = `mailto:${siteConfig.contact.emailGeneral}?subject=${subject}&body=${body}`;
      toast.info("Opening your email app to send the message…");
      return;
    }

    try {
      await submitToWeb3Forms({
        from_name: `${values.firstName} ${values.lastName}`,
        subject: `[Website] ${values.subject}`,
        email: values.email,
        message: values.message,
      });
      toast.success("Message sent! We'll get back to you shortly.");
      reset();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please email us directly.");
    }
  };

  // Wires react-hook-form registration together with the a11y ids/state.
  const field = (
    name: keyof ContactValues,
    ids: { id: string; describedBy?: string; invalid: boolean }
  ): UseFormRegisterReturn & {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby"?: string;
  } => ({
    ...register(name),
    id: ids.id,
    "aria-invalid": ids.invalid,
    "aria-describedby": ids.describedBy,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="First Name" name="firstName" error={errors.firstName?.message} formId={formId}>
          {(ids) => <Input className={inputClass} placeholder="John" {...field("firstName", ids)} />}
        </Field>
        <Field label="Last Name" name="lastName" error={errors.lastName?.message} formId={formId}>
          {(ids) => <Input className={inputClass} placeholder="Doe" {...field("lastName", ids)} />}
        </Field>
      </div>
      <Field label="Email" name="email" error={errors.email?.message} formId={formId}>
        {(ids) => (
          <Input type="email" className={inputClass} placeholder="john@example.com" {...field("email", ids)} />
        )}
      </Field>
      <Field label="Subject" name="subject" error={errors.subject?.message} formId={formId}>
        {(ids) => <Input className={inputClass} placeholder="Project Discussion" {...field("subject", ids)} />}
      </Field>
      <Field label="Message" name="message" error={errors.message?.message} formId={formId}>
        {(ids) => (
          <Textarea
            className={`${inputClass} min-h-[120px] py-3`}
            placeholder="Tell us about your project..."
            {...field("message", ids)}
          />
        )}
      </Field>
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
        <p className="mt-3 text-center text-xs text-slate-400">
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
