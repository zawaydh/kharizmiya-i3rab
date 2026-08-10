import { spawn } from "node:child_process";
import process from "node:process";

const rawConnection = process.env.SUPABASE_DB_URL?.trim();
if (!rawConnection) {
  console.error("LIVE_SCHEMA_ENV_MISSING:SUPABASE_DB_URL");
  process.exit(1);
}

let connection;
try {
  connection = new URL(rawConnection);
} catch {
  console.error("LIVE_SCHEMA_DATABASE_URL_INVALID");
  process.exit(1);
}

if (!/^postgres(?:ql)?:$/u.test(connection.protocol)) {
  console.error("LIVE_SCHEMA_DATABASE_URL_INVALID_PROTOCOL");
  process.exit(1);
}

const database = decodeURIComponent(connection.pathname.replace(/^\//u, ""));
if (!connection.hostname || !connection.username || !database) {
  console.error("LIVE_SCHEMA_DATABASE_URL_INCOMPLETE");
  process.exit(1);
}

const childEnvironment = { ...process.env };
delete childEnvironment.SUPABASE_DB_URL;
Object.assign(childEnvironment, {
  PGHOST: connection.hostname,
  PGPORT: connection.port || "5432",
  PGDATABASE: database,
  PGUSER: decodeURIComponent(connection.username),
  PGPASSWORD: decodeURIComponent(connection.password),
  PGSSLMODE: connection.searchParams.get("sslmode") || "require",
  PGCONNECT_TIMEOUT: connection.searchParams.get("connect_timeout") || "15",
});

const child = spawn(
  "psql",
  [
    "--no-psqlrc",
    "--set=ON_ERROR_STOP=1",
    "--file=supabase/verify_current_schema.sql",
  ],
  {
    cwd: process.cwd(),
    env: childEnvironment,
    stdio: "inherit",
  },
);

child.once("error", (error) => {
  console.error(error.code === "ENOENT" ? "LIVE_SCHEMA_PSQL_MISSING" : "LIVE_SCHEMA_PSQL_FAILED");
  process.exitCode = 1;
});
child.once("exit", (code, signal) => {
  if (signal) {
    console.error(`LIVE_SCHEMA_PSQL_SIGNAL:${signal}`);
    process.exitCode = 1;
    return;
  }
  process.exitCode = code ?? 1;
});
