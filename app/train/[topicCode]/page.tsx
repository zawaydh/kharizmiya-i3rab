import TopicExercisePage from "../../components/TopicExercisePage";
import "../../styles/30-start-learning-core.css";
import "../../styles/40-learning-flow.css";
import "../../styles/50-exercise-workspace.css";
import "../../styles/60-exercise-stability.css";
import "../../styles/61-exercise-feedback.css";
import "../../styles/70-exercise-flow.css";
import "../../styles/83-home-glossary.css";

export default async function TrainTopicPage({ params }: { params: Promise<{ topicCode: string }> }) {
  const { topicCode } = await params;
  return <TopicExercisePage topicCode={topicCode} mode="practice" />;
}
