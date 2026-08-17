import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(path, "utf8");

describe("هوية المنصة", () => {
  it("تعتمد الاسم الجديد في البيانات الوصفية والتنقل والشهادة", () => {
    const brand = read("lib/brand.ts");
    const navbar = read("app/components/Navbar.tsx");
    const certificate = read("app/certificate/CertificateClient.tsx");
    const manifest = read("public/site.webmanifest");

    expect(brand).toContain('PLATFORM_NAME = "إِعْرَابُكَ"');
    expect(navbar).toContain("PLATFORM_NAME");
    expect(certificate).toContain("PLATFORM_NAME");
    expect(manifest).toContain('"name": "إِعْرَابُكَ — تعلّم الإعراب عبر التفكير التفاعلي لا التلقين"');
  });

  it("يستخدم الشعار النصي الجديد ويحافظ على خوارزمية الإعراب بوصفها منهجًا", () => {
    const wordmark = read("public/brand-wordmark.svg");
    const layout = read("app/layout.tsx");

    expect(wordmark).toContain("إِعْرَابُكَ");
    expect(wordmark).toContain("تعلّم الإعراب عبر التفكير التفاعلي لا التلقين");
    expect(layout).toContain('"خوارزمية الإعراب"');
  });
});
