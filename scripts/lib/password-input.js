import readline from "node:readline";
import { Writable } from "node:stream";

/**
 * Reads a password for the command-line scripts (hash-password, admin:password)
 * without echoing it: typed twice at a terminal, or piped on stdin. Never
 * taken as an argument, which would land in shell history.
 */

export function fail(message, code = 1) {
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

/**
 * A new password: prompted twice (no echo) at a terminal, else read from stdin.
 * Exits with `nothingDone` when the two don't match or it's empty.
 */
export async function readNewPassword(first, second, nothingDone) {
  let password;
  if (process.stdin.isTTY) {
    const [a, b] = await promptTwice(first, second);
    if (a !== b) fail(`The passwords didn't match. ${nothingDone}`);
    password = a;
  } else {
    password = await readStdin();
  }
  if (!password) fail(`The password is empty. ${nothingDone}`);
  return password;
}
