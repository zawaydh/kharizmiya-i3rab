"use client";

import { useState } from "react";

export default function ThinkingQA({ title = "كيف أفكر؟", items = [] }) {
  const [open, setOpen] = useState(null);

  if (!items || !items.length) return null;

  return (
    <section className="thinking-qa" dir="rtl" aria-label={title}>
      <div className="thinking-qa-head">
        <span className="thinking-qa-kicker">طريقة التفكير</span>
        <h2>{title}</h2>
        <p>شرح مختصر ومنظم بعيدًا عن مساحة الاختيار حتى يبقى تركيزك على السؤال.</p>
      </div>

      <div className="thinking-qa-list">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={`${item.q}-${i}`} className={`thinking-qa-item ${isOpen ? "is-open" : ""}`}>
              <button className="thinking-qa-question" type="button" onClick={() => setOpen(isOpen ? null : i)}>
                <span>{item.q}</span>
                <span className="thinking-qa-icon" aria-hidden="true">⌄</span>
              </button>
              {isOpen ? <div className="thinking-qa-answer">{item.a}</div> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
