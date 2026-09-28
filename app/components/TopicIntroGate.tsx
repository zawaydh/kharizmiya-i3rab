"use client";

import React from "react";
import styles from "./TopicIntroGate.module.css";

type Props = {
  children: React.ReactNode;
  topicName: string;
};

const GUIDED_LEARNING_STEPS = [
  "اقرأ الجملة وحدّد الكلمة أو التركيب المطلوب",
  "أجب عن المطلوب في الخطوة الحالية فقط",
  "استعن بالمثال والتلميح حتى تصل إلى الإعراب",
];

export default function TopicIntroGate({ children, topicName }: Props) {
  const [started, setStarted] = React.useState(false);

  if (started) return <>{children}</>;

  return (
    <main className={styles.shell} dir="rtl">
      <section className={`card ${styles.card}`} aria-labelledby="topic-intro-title">
        <p className={styles.kicker}>قبل أن تبدأ</p>
        <h1 id="topic-intro-title">مهمتك في {topicName}</h1>
        <p className={styles.lead}>
          ستكتشف الحكم خطوةً خطوة، وسيظهر لك سؤال واحد في كل خطوة.
        </p>

        <ol className={styles.steps} aria-label="خطوات التعلّم">
          {GUIDED_LEARNING_STEPS.map((step, index) => (
            <li key={step}>
              <span aria-hidden="true">{index + 1}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>

        <p className={styles.note}>
          لا تبحث عن الإعراب كاملًا من البداية؛ أجب عن المطلوب في الخطوة الحالية فقط.
        </p>

        <button
          type="button"
          className={`btn btn-primary ${styles.start}`}
          onClick={() => setStarted(true)}
        >
          ابدأ التعلّم
        </button>
      </section>
    </main>
  );
}
