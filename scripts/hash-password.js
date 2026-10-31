import readline from "node:readline";
import { Writable } from "node:stream";
import { hashPassword } from "../server/src/password.js";

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

function fail(message, code = 1) {
  console.error(message);
  process.exit(code);
}

// Reads two answers from the terminal. readline handles editing keys; its
// output is muted while the user types so nothing is echoed.
async function promptTwice(first, second) {
  let muted = false;
  let pending = false;
  const output = new Writable({
    write(chunk, encoding, callback) {
      if (!muted) process.stderr.write(chunk, encoding);
      callback();
    },
  });
  const rl = readline.createInterface({
    input: process.stdin,
    output,
    terminal: true,
    historySize: 0,
  });
  const cancel = () => fail("\nCancelled.", 130);
  rl.on("SIGINT", cancel);
  rl.on("close", () => {
    if (pending) cancel(); // Ctrl-D
  });

  // Answers are queued from 'line' events rather than rl.question, so a paste
  // that delivers both lines in one chunk ("pw\npw\n") keeps the second one.
  const lines = [];
  let waiting = null;
  rl.on("line", (line) => {
    if (waiting) waiting(line);
    else lines.push(line);
  });

  const ask = (question) =>
    new Promise((resolve) => {
      process.stderr.write(question);
      muted = true;
      const done = (answer) => {
        waiting = null;
        pending = false;
        process.stderr.write("\n");
        resolve(answer);
      };
      if (lines.length) done(lines.shift());
      else {
        pending = true;
        waiting = done;
      }
    });

  try {
    return [await ask(first), await ask(second)];
  } finally {
    rl.close();
  }
}

async function readStdin() {
  process.stdin.setEncoding("utf8");
  let data = "";
  for await (const chunk of process.stdin) data += chunk;
  // Drop the newline `echo` or a text file adds; keep everything else.
  return data.replace(/\r?\n$/, "");
}

if (process.argv.length > 2) {
  fail(
    "Usage: npm run hash-password\n" +
      "Type the password when prompted or pipe it on stdin. It is never taken " +
      "as an argument, which would land in your shell history.",
  );
}

let password;
if (process.stdin.isTTY) {
  const [first, second] = await promptTwice("Admin password: ", "Repeat it: ");
  if (first !== second) fail("The passwords didn't match. Nothing was generated.");
  password = first;
} else {
  password = await readStdin();
}

if (!password) fail("The password is empty. Nothing was generated.");
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
