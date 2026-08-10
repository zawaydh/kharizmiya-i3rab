import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const failures = [];
const notes = [];
const SOURCE_DIRS = ["app", "lib", "content", "data"];
const CODE_EXTENSIONS = [".ts", ".tsx", ".json", ".css", ".sql"];

function fail(message) { failures.push(message); }
function note(message) { notes.push(message); }
function read(relative) { return fs.readFileSync(path.join(root, relative), "utf8"); }
function walk(relative) {
  const absolute = path.join(root, relative);
  if (!fs.existsSync(absolute)) return [];
  return fs.readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const child = path.join(relative, entry.name);
    return entry.isDirectory() ? walk(child) : [child];
  });
}

const sourceFiles = SOURCE_DIRS.flatMap(walk);
const legacy = sourceFiles.filter((file) => /\.(?:js|jsx)$/.test(file));
if (legacy.length) fail(`ملفات JavaScript قديمة: ${legacy.join(", ")}`);
else note("لا توجد ملفات JavaScript أو JSX قديمة.");

const duplicateLike = sourceFiles.filter((file) => /(?:\bcopy\b|backup|\.bak$|[_-]old\.|\(\d+\))/i.test(path.basename(file)));
if (duplicateLike.length) fail(`ملفات مصدر تبدو نسخًا مكررة: ${duplicateLike.join(", ")}`);
else note("لا توجد نسخ احتياطية أو ملفات مصدر مكررة.");

const tsconfig = JSON.parse(read("tsconfig.json"));
if (tsconfig?.compilerOptions?.allowJs !== false) fail("tsconfig.json يجب أن يضبط allowJs على false.");
const strictConfig = JSON.parse(read("tsconfig.strict.json"));
for (const pattern of ["app/**/*.ts", "app/**/*.tsx", "lib/**/*.ts", "content/**/*.ts", "data/**/*.ts"]) {
  if (!strictConfig.include?.includes(pattern)) fail(`الفحص الصارم لا يشمل ${pattern}`);
}

const importPattern = /(?:import|export)\s+(?:[^"']*?\s+from\s+)?["']([^"']+)["']/g;
const codeFiles = sourceFiles.filter((file) => /\.(?:ts|tsx)$/.test(file));
const explicitAnyFiles = codeFiles.filter((file) => /\bany\b/.test(read(file)));
if (explicitAnyFiles.length) fail(`ملفات تحتوي النوع العام any: ${explicitAnyFiles.join(", ")}`);
else note("لا توجد أنواع any صريحة في ملفات المصدر.");
function relativeImportExists(importer, specifier) {
  const base = path.resolve(root, path.dirname(importer), specifier);
  const candidates = [base, ...CODE_EXTENSIONS.map((ext) => `${base}${ext}`), ...CODE_EXTENSIONS.map((ext) => path.join(base, `index${ext}`))];
  return candidates.some((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
}
for (const file of codeFiles) {
  const source = read(file);
  for (const match of source.matchAll(importPattern)) {
    const specifier = match[1];
    if (specifier?.startsWith(".") && !relativeImportExists(file, specifier)) {
      fail(`استيراد نسبي مفقود في ${file}: ${specifier}`);
    }
  }
}
note(`فُحصت الاستيرادات النسبية في ${codeFiles.length} ملفًا.`);

const requiredSchemaTokens = [
  "topic_code text not null",
  "practice_percent integer not null",
  "learn_completed boolean not null",
  "practice_completed boolean not null",
  "quiz_passed boolean not null",
  "certificate_earned_at timestamptz",
  'create policy "Progress: read own"',
  "revoke insert, update, delete on public.progress from anon, authenticated",
  "create table if not exists public.app_error_events",
  "revoke all on table public.app_error_events from anon, authenticated",
];
const schema = read("supabase/schema.sql");
for (const token of requiredSchemaTokens) {
  if (!schema.includes(token)) fail(`المخطط المرجعي يفتقد: ${token}`);
}


const productionMigrationPath = "supabase/migrations/20260803_production_schema_hardening.sql";
if (!fs.existsSync(path.join(root, productionMigrationPath))) {
  fail(`ملف ترقية الإنتاج غير موجود: ${productionMigrationPath}`);
} else {
  const migration = read(productionMigrationPath);
  for (const token of [
    "progress_user_topic_level_unique",
    "students_email_unique_lower",
    "students_auth_user_id_unique",
    'create policy "Progress: update own"',
    'create policy "Students: update own or claim old row"',
  ]) {
    if (!migration.includes(token)) fail(`ترقية الإنتاج تفتقد: ${token}`);
  }
}

const authoritativeProgressMigrationPath = "supabase/migrations/20260805_server_authoritative_progress.sql";
if (!fs.existsSync(path.join(root, authoritativeProgressMigrationPath))) {
  fail(`ملف حماية التقدم غير موجود: ${authoritativeProgressMigrationPath}`);
} else {
  const migration = read(authoritativeProgressMigrationPath);
  for (const token of [
    'drop policy if exists "Progress: update own"',
    "revoke insert, update, delete on public.progress from anon, authenticated",
    'create policy "Progress: read own"',
  ]) {
    if (!migration.includes(token)) fail(`ترقية حماية التقدم تفتقد: ${token}`);
  }
}

const errorObservabilityMigrationPath = "supabase/migrations/20260806_error_observability.sql";
if (!fs.existsSync(path.join(root, errorObservabilityMigrationPath))) {
  fail(`ملف ترقية مراقبة الأخطاء غير موجود: ${errorObservabilityMigrationPath}`);
} else {
  const migration = read(errorObservabilityMigrationPath);
  for (const token of [
    "create table if not exists public.app_error_events",
    "app_error_events_created_at_idx",
    "revoke all on table public.app_error_events from anon, authenticated",
  ]) {
    if (!migration.includes(token)) fail(`ترقية مراقبة الأخطاء تفتقد: ${token}`);
  }
}

const verifier = read("supabase/verify_current_schema.sql");
for (const token of ["duplicate_progress_rows", "duplicate_student_emails", "eligible_without_certificate_date", "client_progress_write_policies", "client_progress_write_grants", "client_error_event_grants", "client_error_event_policies", "RLS_DISABLED", "SCHEMA_VERIFICATION_FAILED", "SCHEMA_VERIFICATION_OK", "begin transaction read only"]) {
  if (!verifier.includes(token)) fail(`فحص Supabase يفتقد: ${token}`);
}

const schemaVerifierRunner = read("scripts/verify-supabase-schema.mjs");
for (const token of ["SUPABASE_DB_URL", "PGPASSWORD", "--set=ON_ERROR_STOP=1", "verify_current_schema.sql"]) {
  if (!schemaVerifierRunner.includes(token)) fail(`مشغّل فحص Supabase يفتقد: ${token}`);
}

const envExamplePath = "./.env.example";
if (!fs.existsSync(path.join(root, envExamplePath))) {
  fail("ملف .env.example غير موجود.");
} else {
  const envExample = read(envExamplePath);
  for (const token of [
    "NEXT_PUBLIC_SUPABASE_URL=",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY=",
    "SUPABASE_SERVICE_ROLE_KEY=",
  ]) {
    if (!envExample.includes(token)) fail(`ملف .env.example يفتقد: ${token}`);
  }
}

const packageJson = JSON.parse(read("package.json"));
for (const script of ["clean:cache", "dev:fresh", "preflight", "test", "test:coverage", "test:e2e", "test:integration", "release:verify", "verify:supabase", "typecheck:strict", "build", "check", "audit"]) {
  if (!packageJson.scripts?.[script]) fail(`package.json يفتقد الأمر ${script}`);
}
if (!String(packageJson.scripts?.check || "").includes("npm run test:coverage")) {
  fail("أمر check يجب أن يفرض حدود تغطية الكود.");
}
if (packageJson.overrides) fail("package.json ما يزال يعتمد على overrides قسرية.");
for (const dependency of ["postcss", "typescript", "eslint"]) {
  if (!packageJson.devDependencies?.[dependency]) {
    fail(`اعتماد التطوير ${dependency} يجب أن يكون مباشرًا وصريحًا.`);
  }
}
const rangedDependencies = Object.entries({
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
}).filter(([, version]) => /^[~^*]|\bx\b/i.test(String(version)));
if (rangedDependencies.length) {
  fail(`اعتماديات مباشرة غير مثبتة بإصدار دقيق: ${rangedDependencies.map(([name, version]) => `${name}@${version}`).join(", ")}`);
} else {
  note("جميع الاعتماديات المباشرة مثبتة بإصدارات دقيقة.");
}

const cssFiles = walk("app").filter((file) => file.endsWith(".css"));
const importantCount = cssFiles.reduce((total, file) => total + (read(file).match(/!important/g)?.length ?? 0), 0);
if (importantCount >= 20) fail(`تجاوزت !important الميزانية: ${importantCount}/19`);
else note(`عدد !important محصور في قواعد الطباعة وتقليل الحركة: ${importantCount}/19.`);

if (failures.length) {
  console.error("\nفشل فحص ما قبل التشغيل:\n");
  for (const item of failures) console.error(`- ${item}`);
  process.exitCode = 1;
} else {
  console.log("\nنجح فحص ما قبل التشغيل:\n");
  for (const item of notes) console.log(`- ${item}`);
}
