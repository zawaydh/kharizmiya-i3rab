import type { Metadata } from "next";
import WhichMafoolGame from "../../components/WhichMafoolGame";
import "../../styles/74-speech-game.css";

export const metadata: Metadata = {
  title: "أيُّ مفعول؟",
  description: "لعبة تدريبية تطبق تسلسل المفاعيل الخمسة مع تفسير سبب الخطأ والإعراب الكامل.",
};

export default function WhichObjectPage() {
  return <WhichMafoolGame />;
}
