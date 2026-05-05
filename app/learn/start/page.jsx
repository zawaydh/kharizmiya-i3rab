import InteractiveLearning from "../../components/InteractiveLearning";
import examples from "../../../data/interactive_examples.json";

export const metadata = {
  title: "ابدأ بالتعلم | خوارزمية الإعراب",
  description: "تجربة تفاعلية لتعلم الإعراب خطوة بخطوة بالسحب والإفلات.",
};

export default function StartLearningPage() {
  return <InteractiveLearning examples={examples} />;
}
