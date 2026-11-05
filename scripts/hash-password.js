import { hashPassword } from "../server/src/password.js";
import { fail, readNewPassword } from "./lib/password-input.js";

/**
 * Prints the ADMIN_PASSWORD_HASH line for an admin password:
 *
 *   npm run hash-password                     # prompts twice, no echo
 *   npm run -s hash-password < password.txt   # or pipe it on stdin
 *
 * The password is never taken as an argument (it would land in shell history)
 * and never printed. Prompts and notes go to stderr, so stdout carries only
 * the line to paste.
 */

if (process.argv.length > 2) {
  fail(
    "Usage: npm run hash-password\n" +
      "Type the password when prompted or pipe it on stdin. It is never taken " +
      "as an argument, which would land in your shell history.",
  );
}

const password = await readNewPassword(
  "Admin password: ",
  "Repeat it: ",
  "Nothing was generated.",
);
if (password.length < 12) {
  console.error("Warning: that password is short; 12+ characters is recommended.");
}

const hash = await hashPassword(password);
console.log(`ADMIN_PASSWORD_HASH=${hash}`);
console.error(
  "Set this in your host's environment variables (Render: Environment; Vercel: " +
    "Project Settings > Environment Variables) and remove ADMIN_PASSWORD. In a " +
    "shell, single-quote the value so $ isn't expanded.",
);
