import { useEffect, useState } from "react";
import { Copy, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Field, FormRow } from "./formBits";
import { MIN_PASSWORD_LENGTH } from "./PasswordForm";
import {
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  type AdminRole,
  type AdminUser,
} from "@/lib/adminApi";

const selectClass =
  "w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white disabled:opacity-60";

// No look-alikes (0/O, 1/l/I), so it can be read out or typed from a message.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

/** A random temporary password like "aB3k-Xy7m-Pq2r" (about 70 bits). */
function generateTemporaryPassword() {
  const values = crypto.getRandomValues(new Uint32Array(12));
  const chars = Array.from(values, (n) => ALPHABET[n % ALPHABET.length]);
  return [0, 4, 8].map((i) => chars.slice(i, i + 4).join("")).join("-");
}

function copyText(value: string) {
  navigator.clipboard
    .writeText(value)
    .then(() => toast.success("Temporary password copied"))
    .catch(() => toast.error("Couldn't copy: select it and copy by hand"));
}

function TemporaryPasswordField({
  value,
  onChange,
  hint,
}: {
  value: string;
  onChange: (value: string) => void;
  hint: string;
}) {
  return (
    <Field label="Temporary password" hint={hint}>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          className="font-mono"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => onChange(generateTemporaryPassword())}
          title="Generate a new one"
          aria-label="Generate a new temporary password"
          className="shrink-0 border-white/15 bg-transparent text-slate-300 hover:bg-white/[0.06] hover:text-white"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => copyText(value)}
          title="Copy"
          aria-label="Copy the temporary password"
          className="shrink-0 border-white/15 bg-transparent text-slate-300 hover:bg-white/[0.06] hover:text-white"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </Field>
  );
}

function RoleSelect({
  value,
  onChange,
  disabled,
}: {
  value: AdminRole;
  onChange: (role: AdminRole) => void;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as AdminRole)}
      className={selectClass}
    >
      {(Object.keys(ROLE_LABELS) as AdminRole[]).map((role) => (
        <option key={role} value={role}>
          {ROLE_LABELS[role]}: {ROLE_DESCRIPTIONS[role]}
        </option>
      ))}
    </select>
  );
}

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "never";

interface UserFormProps {
  /** null to create a new account. */
  user: AdminUser | null;
  isSelf: boolean;
  busy: boolean;
  /** The temporary password just given to this account, shown until you move on. */
  issuedPassword?: string;
  onCreate: (payload: { email: string; name: string; role: AdminRole; password: string }) => void;
  onSave: (changes: { name: string; role: AdminRole; active: boolean }) => void;
  onResetPassword: (password: string) => void;
  onDelete: () => void;
}

export function UserForm({
  user,
  isSelf,
  busy,
  issuedPassword,
  onCreate,
  onSave,
  onResetPassword,
  onDelete,
}: UserFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<AdminRole>("editor");
  const [active, setActive] = useState(true);
  const [password, setPassword] = useState(generateTemporaryPassword);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEmail(user?.email ?? "");
    setName(user?.name ?? "");
    setRole(user?.role ?? "editor");
    setActive(user?.active ?? true);
  }, [user]);

  // A fresh temporary password per account, not after every save.
  const userId = user?._id;
  useEffect(() => {
    setPassword(generateTemporaryPassword());
    setError(null);
  }, [userId]);

  const passwordOk = () => {
    if (password.length >= MIN_PASSWORD_LENGTH) return true;
    setError(`The temporary password needs at least ${MIN_PASSWORD_LENGTH} characters`);
    return false;
  };

  if (!user) {
    return (
      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (passwordOk()) {
            setError(null);
            onCreate({ email: email.trim(), name: name.trim(), role, password });
          }
        }}
      >
        <div>
          <h3 className="text-lg font-semibold text-white">New account</h3>
          <p className="mt-1 text-sm text-slate-400">
            Copy the temporary password and share it with them privately. They'll choose their
            own the first time they sign in.
          </p>
        </div>
        <FormRow>
          <Field label="Email">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="off"
            />
          </Field>
          <Field label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
          </Field>
        </FormRow>
        <Field label="Role">
          <RoleSelect value={role} onChange={setRole} />
        </Field>
        <TemporaryPasswordField
          value={password}
          onChange={setPassword}
          hint={`At least ${MIN_PASSWORD_LENGTH} characters. It's shown again after you create the account.`}
        />
        {error && (
          <p role="alert" className="text-sm text-red-300">
            {error}
          </p>
        )}
        <div className="border-t border-white/10 pt-5">
          <Button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-violet-600 text-white hover:bg-violet-500"
          >
            {busy ? "Creating…" : "Create account"}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white">{user.name || user.email}</h3>
        <p className="mt-1 text-sm text-slate-400">
          Created {formatDate(user.createdAt)} · last signed in {formatDate(user.lastLoginAt)}
          {user.mustChangePassword && " · hasn't chosen their own password yet"}
        </p>
        {isSelf && (
          <p className="mt-2 text-sm text-violet-300">
            This is your account. Change your own password under Account.
          </p>
        )}
      </div>

      {issuedPassword && (
        <div className="rounded-lg border border-violet-500/40 bg-violet-500/10 p-4">
          <p className="text-sm text-violet-100">
            Temporary password for <strong>{user.email}</strong>. Share it with them privately:
            it won't be shown again once you leave this account.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <code className="rounded bg-black/30 px-3 py-1.5 font-mono text-sm text-white">
              {issuedPassword}
            </code>
            <Button
              type="button"
              variant="outline"
              onClick={() => copyText(issuedPassword)}
              className="h-8 border-white/15 bg-transparent px-3 text-xs text-slate-200 hover:bg-white/[0.06] hover:text-white"
            >
              <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
            </Button>
          </div>
        </div>
      )}

      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          onSave({ name: name.trim(), role, active });
        }}
      >
        <FormRow>
          <Field label="Email">
            <Input value={email} disabled />
          </Field>
          <Field label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
          </Field>
        </FormRow>
        <Field
          label="Role"
          hint={isSelf ? "Another super admin has to change your role." : undefined}
        >
          <RoleSelect value={role} onChange={setRole} disabled={isSelf} />
        </Field>
        <label className="flex items-center gap-3">
          <Switch checked={active} onCheckedChange={setActive} disabled={isSelf} />
          <span className="text-sm text-slate-300">
            {active ? "Active: can sign in" : "Disabled: can't sign in"}
          </span>
        </label>
        <Button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-violet-600 text-white hover:bg-violet-500"
        >
          {busy ? "Saving…" : "Save changes"}
        </Button>
      </form>

      {!isSelf && (
        <form
          className="space-y-4 border-t border-white/10 pt-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (passwordOk()) {
              setError(null);
              onResetPassword(password);
            }
          }}
        >
          <h4 className="text-sm font-semibold text-white">Reset password</h4>
          <TemporaryPasswordField
            value={password}
            onChange={setPassword}
            hint="Signs them out everywhere. They'll choose a new password at their next sign-in."
          />
          {error && (
            <p role="alert" className="text-sm text-red-300">
              {error}
            </p>
          )}
          <Button
            type="submit"
            variant="outline"
            disabled={busy}
            className="rounded-lg border-white/15 bg-transparent text-slate-200 hover:bg-white/[0.06] hover:text-white"
          >
            Set temporary password
          </Button>
        </form>
      )}

      {!isSelf && (
        <div className="border-t border-white/10 pt-5">
          <Button
            variant="outline"
            onClick={onDelete}
            disabled={busy}
            className="rounded-lg border-red-500/40 bg-transparent text-red-300 hover:bg-red-500/10 hover:text-red-200"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete account
          </Button>
        </div>
      )}
    </div>
  );
}
