import InteractiveLearning from "../../components/InteractiveLearning";
import examples from "../../../data/interactive_examples.json";

export const metadata = {
  title: "ابدأ مع مدرّب التفكير النحوي | خوارزمية الإعراب",
  description: "تجربة تفاعلية مع مدرّب تفكير نحوي موجّه؛ الإعراب خطوات، وكل خطوة تفتح مسارًا وتغلق آخر.",
};

export default function StartLearningPage() {
  return <InteractiveLearning examples={examples} />;
}
