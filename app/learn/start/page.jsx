import InteractiveLearning from "../../components/InteractiveLearning";
import examples from "../../../data/interactive_examples.json";

export const metadata = {
  title: "ابدأ بالتعلم | خوارزمية الإعراب",
  description: "تعلّم الإعراب خطوة بخطوة من خلال أمثلة تفاعلية متنوعة.",
};

export default function StartLearningPage() {
  return <InteractiveLearning examples={examples} />;
}
