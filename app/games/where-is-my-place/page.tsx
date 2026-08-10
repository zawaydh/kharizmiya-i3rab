import type { Metadata } from "next";
import WhereIsMyPlaceGame from "../../components/WhereIsMyPlaceGame";
import "../../styles/74-speech-game.css";

export const metadata: Metadata = {
  title: "أين مكاني؟",
  description: "لعبة إعرابية تربط حركة الكلمة بموقعها الصحيح داخل الجملة مع تفسير سبب الخطأ.",
};

export default function WhereIsMyPlacePage() {
  return <WhereIsMyPlaceGame />;
}
