import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field } from "./formBits";
import { changePassword } from "@/lib/adminApi";

/** Matches the server's MIN_PASSWORD_LENGTH (server/src/auth.js). */
export const MIN_PASSWORD_LENGTH = 10;

const inputClass = "border-white/10 bg-black/20 text-white";

/**
 * Change your own password. `temporary` labels the current one as the
 * temporary password a super admin gave you.
 */
export function PasswordForm({
  temporary = false,
  onChanged,
}: {
  temporary?: boolean;
  onChanged: () => void;
}) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => changePassword(current, next),
    onSuccess: () => {
      toast.success("Password changed");
      setCurrent("");
      setNext("");
      setConfirm("");
      onChanged();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Couldn't change the password"),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (next.length < MIN_PASSWORD_LENGTH) {
      setError(`Use at least ${MIN_PASSWORD_LENGTH} characters`);
    } else if (next !== confirm) {
      setError("The new passwords don't match");
    } else {
      setError(null);
      mutation.mutate();
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label={temporary ? "Temporary password" : "Current password"}>
        <Input
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
          className={inputClass}
        />
      </Field>
      <Field label="New password" hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}>
        <Input
          type="password"
          autoComplete="new-password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          required
          className={inputClass}
        />
      </Field>
      <Field label="Confirm new password">
        <Input
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          className={inputClass}
        />
      </Field>
      {error && (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      )}
      <Button
        type="submit"
        disabled={mutation.isPending}
        className="w-full rounded-lg bg-violet-600 text-white hover:bg-violet-500"
      >
        {mutation.isPending ? "Saving…" : "Change password"}
      </Button>
    </form>
  );
}
