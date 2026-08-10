import type { Metadata } from "next";
import MarkatiGame from "../../components/MarkatiGame";
import "../../styles/74-speech-game.css";

export const metadata: Metadata = {
  title: "علامتي",
  description: "لعبة تربط الحالة الإعرابية بصورة الاسم لاختيار العلامة الأصلية أو الفرعية أو المقدرة.",
};

export default function MarkatiPage() {
  return <MarkatiGame />;
}
