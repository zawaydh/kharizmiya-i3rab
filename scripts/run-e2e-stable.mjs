import net from "node:net";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const HOST = "127.0.0.1";
const TEST_TIMEOUT_MS = "60000";

function findAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, HOST, () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close(() => reject(new Error("Could not determine an available local port.")));
        return;
      }
      const { port } = address;
      server.close((error) => {
        if (error) reject(error);
        else resolve(String(port));
      });
    });
  });
}

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), "..");
const playwrightCli = path.join(
  projectRoot,
  "node_modules",
  "@playwright",
  "test",
  "cli.js",
);

const localPort = await findAvailablePort();
console.log(`Running Playwright sequentially on a clean local port: ${localPort}`);

const child = spawn(
  process.execPath,
  [playwrightCli, "test", "--workers=1", `--timeout=${TEST_TIMEOUT_MS}`],
  {
    cwd: projectRoot,
    stdio: "inherit",
    env: {
      ...process.env,
      E2E_LOCAL_PORT: localPort,
    },
  },
);

child.on("error", (error) => {
  console.error("Failed to start Playwright:", error);
  process.exitCode = 1;
});

child.on("exit", (code, signal) => {
  if (signal) {
    console.error(`Playwright stopped by signal: ${signal}`);
    process.exitCode = 1;
    return;
  }
  process.exitCode = code ?? 1;
});
