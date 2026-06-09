import { spawn } from "node:child_process";

const children = [
  ["api", "node", ["server/src/index.js"]],
  ["web", "vite", []],
];

let shuttingDown = false;
const processes = children.map(([name, command, args]) => {
  const child = spawn(command, args, {
    stdio: ["ignore", "pipe", "pipe"],
    shell: process.platform === "win32",
  });

  const prefix = (chunk) => {
    for (const line of chunk.toString().split(/\r?\n/).filter(Boolean)) {
      console.log(`[${name}] ${line}`);
    }
  };

  child.stdout.on("data", prefix);
  child.stderr.on("data", prefix);
  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.error(`[${name}] exited (${signal || code})`);
    for (const proc of processes) proc.kill();
    process.exit(code ?? 1);
  });

  return child;
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    shuttingDown = true;
    for (const child of processes) child.kill(signal);
    process.exit(0);
  });
}
