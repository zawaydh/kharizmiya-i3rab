import type { Metadata } from "next";
import InteractiveLearning, { type StartLearningExample } from "../../components/InteractiveLearning";
import examplesData from "../../../data/interactive_examples.json";
import { PLATFORM_TAGLINE } from "../../../lib/brand";
import "../../styles/30-start-learning-core.css";
import "../../styles/31-start-page-flow.css";
import "../../styles/83-home-glossary.css";

export const metadata: Metadata = {
  title: "ابدأ التعلّم الموجّه",
  description: `${PLATFORM_TAGLINE}؛ الإعراب خطوات، وكل خطوة تفتح مسارًا وتغلق آخر.`,
};

const examples = examplesData as StartLearningExample[];

export default function StartLearningPage() {
  return <InteractiveLearning examples={examples} />;
}
