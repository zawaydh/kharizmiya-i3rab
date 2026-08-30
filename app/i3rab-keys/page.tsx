import type { Metadata } from "next";
import KeyChoiceGate from "./KeyChoiceGate";

export const metadata: Metadata = {
  title: "مفاتيح الإعراب",
  description: "مساحة تفاعلية مبسطة تساعد الطالب على معرفة نقطة البداية في الجملة ثم توجهه إلى الباب المناسب.",
};

export default function I3rabKeysPage() {
  return (
    <div className="algorithm-guide-page i3rab-keys-page">
      <section className="algorithm-guide-hero keys-compact-hero">
        <span className="algorithm-guide-eyebrow">إذا عرفت البداية، عرفت أين تذهب</span>
        <h1>مفاتيح الإعراب</h1>
        <p>لا تقرأ قاعدة طويلة. اختر ما بدأت به الجملة، ثم أجب عن سؤال واحد ليظهر لك السبب والمسار المناسب.</p>
      </section>

      <KeyChoiceGate />
    </div>
  );
}