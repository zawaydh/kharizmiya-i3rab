export type CoveredExample = { id?: unknown; covers: string[] };

export function requirePrimaryCoverage(example: CoveredExample): string {
  const key = example.covers[0];
  if (key) return key;

  const exampleId = example.id === undefined ? "مثال بلا معرّف" : String(example.id);
  throw new Error(`${exampleId}: يجب أن يحتوي المثال على مفتاح تغطية واحد على الأقل.`);
}

export function requireCoverageResult(
  results: Record<string, string>,
  example: CoveredExample,
): string {
  const key = requirePrimaryCoverage(example);
  const result = results[key];
  if (result) return result;

  const exampleId = example.id === undefined ? "مثال بلا معرّف" : String(example.id);
  throw new Error(`${exampleId}: لا توجد نتيجة اختبار لمفتاح التغطية ${key}.`);
}
