import { useId, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_BASE } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";

// The same check as the contact form and the server (server/src/emailAddress.js).
const EMAIL = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/;

const inputClass =
  "h-11 border-white/10 bg-black/20 text-white placeholder:text-slate-500 focus-visible:border-violet-400/60 focus-visible:ring-violet-400";

/** "Get early access" for one platform; signups land in /admin → Waitlists. */
export function WaitlistForm({
  platform,
  platformName,
  roles,
  submitLabel,
}: {
  platform: string;
  platformName: string;
  /** The platform's audiences ("Customer", "Runner"…), offered as choices. */
  roles: string[];
  submitLabel: string;
}) {
  const id = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [joined, setJoined] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Honeypot: hidden from people, so only bots tick it.
    if (new FormData(e.currentTarget).has("botcheck")) return setJoined(true);
    if (!name.trim()) return setError("Your name is required");
    if (!EMAIL.test(email.trim())) return setError("Enter a valid email");
    if (roles.length > 0 && !role) return setError("Tell us which describes you");
    setError(null);
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          name: name.trim(),
          email: email.trim(),
          role,
          page: window.location.pathname,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "We couldn't add you right now. Please try again.");
      }
      trackEvent("Waitlist Signup", { platform, role: role || "none" });
      setJoined(true);
    } catch (err) {
      setError(err instanceof Error && err.message !== "Failed to fetch" ? err.message : "We couldn't reach our server. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (joined) {
    return (
      <div role="status" className="flex items-start gap-3 border border-emerald-400/25 bg-emerald-400/10 p-5">
        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-300" />
        <div>
          <p className="font-medium text-white">You're on the list.</p>
          <p className="mt-1 text-sm text-slate-300">
            We'll let you know at {email.trim() || "your email"} when {platformName} opens up for you.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className="mb-2 block text-sm font-medium text-slate-300">
            Name
          </label>
          <Input
            id={`${id}-name`}
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor={`${id}-email`} className="mb-2 block text-sm font-medium text-slate-300">
            Email
          </label>
          <Input
            id={`${id}-email`}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>
      {roles.length > 0 && (
        <fieldset>
          <legend className="mb-2 block text-sm font-medium text-slate-300">Which describes you?</legend>
          <div className="flex flex-wrap gap-2">
            {roles.map((r) => (
              <label key={r} className="relative">
                <input
                  type="radio"
                  name={`${id}-role`}
                  value={r}
                  checked={role === r}
                  onChange={() => setRole(r)}
                  className="peer sr-only"
                />
                <span className="flex h-10 cursor-pointer items-center border border-white/10 bg-black/20 px-4 text-sm text-slate-300 transition-colors hover:text-white peer-checked:border-violet-400 peer-checked:bg-violet-600 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-violet-300">
                  {r}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} aria-hidden="true" />
      {error && (
        <p role="alert" className="text-sm text-rose-300">
          {error}
        </p>
      )}
      <Button
        type="submit"
        disabled={sending}
        className="h-11 w-full bg-violet-600 text-white hover:bg-violet-500 sm:w-auto sm:px-8"
      >
        {sending ? (
          <>
            Adding you… <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          </>
        ) : (
          submitLabel
        )}
      </Button>
      <p className="text-xs text-slate-400">
        We'll only use your details to tell you about {platformName}.
      </p>
    </form>
  );
}
