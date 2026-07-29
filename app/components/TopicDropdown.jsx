"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getTopicByCode, getTopicRoutes, hasVisualPath } from "../../lib/topics";

const TOPIC_TREE = [
  {
    id: "nominal-sentence",
    label: "الجملة الاسمية",
    children: [
      { id: "mubtada", label: "المبتدأ", topicCode: "nominal-advanced" },
      { id: "khabar", label: "الخبر", topicCode: "khabar" },
      { id: "kana", label: "كان وأخواتها", topicCode: "kana-wa-akhawatuha" },
      { id: "inna", label: "إن وأخواتها", topicCode: "inna-wa-akhawatuha" },
    ],
  },
  {
    id: "verbal-sentence",
    label: "الجملة الفعلية",
    children: [
      {
        id: "verb",
        label: "الفعل",
        children: [
          { id: "past", label: "الفعل الماضي", topicCode: "past-verb" },
          { id: "present", label: "الفعل المضارع", topicCode: "present-verb" },
          { id: "imperative", label: "فعل الأمر", topicCode: "imperative-verb" },
        ],
      },
      { id: "fael", label: "الفاعل", topicCode: "fael" },
      { id: "mafool", label: "المفعول به", topicCode: "mafool-bih" },
    ],
  },
  {
    id: "tawabi",
    label: "التوابع",
    children: [
      { id: "naat", label: "النعت", topicCode: "tawabi-naat" },
      { id: "atf", label: "العطف", topicCode: "tawabi-atf" },
      { id: "tawkid", label: "التوكيد", topicCode: "tawabi-tawkid" },
      { id: "badal", label: "البدل", topicCode: "tawabi-badal" },
      { id: "mixed-tawabi", label: "تدريب مختلط على التوابع", topicCode: "tawabi" },
    ],
  },
  {
    id: "nouns",
    label: "الأسماء",
    children: [
      {
        id: "built-nouns",
        label: "الأسماء المبنية",
        children: [
          { id: "pronouns", label: "الضمائر", topicCode: "attached-pronouns" },
          { id: "demonstratives", label: "أسماء الإشارة", disabled: true },
          { id: "relatives", label: "الأسماء الموصولة", disabled: true },
          { id: "interrogatives", label: "أسماء الاستفهام", disabled: true },
          { id: "conditionals", label: "أسماء الشرط", disabled: true },
          { id: "adverbs", label: "بعض الظروف", disabled: true },
          { id: "compound-numbers", label: "الأعداد المركبة", disabled: true },
        ],
      },
      { id: "manqous", label: "الاسم المنقوص", topicCode: "ism-manqous" },
      { id: "maqsour", label: "الاسم المقصور", disabled: true },
    ],
  },
  { id: "first", label: "مفتاح الكلمة الأولى", topicCode: "first-word-key" },
];

function actionItemsForTopic(topicCode, mode = "learning", topicLabel = "الموضوع") {
  const topic = topicCode ? getTopicByCode(topicCode) : null;
  if (!topic || !topic.isReady) return [];
  const routes = getTopicRoutes(topic.code);
  if (mode === "paths") {
    return hasVisualPath(topic.code) ? [{ label: "المسار البصري", href: routes.paths }] : [];
  }
  return [{ label: topicLabel, href: routes.learn }];
}

function availableChildren(item, mode) {
  return (item.children || []).filter((child) => {
    if (child.disabled) return false;
    if (child.children?.length) return availableChildren(child, mode).length > 0;
    return actionItemsForTopic(child.topicCode, mode, child.label).length > 0;
  });
}

function MobilePanel({ roots, go, mode, onClose }) {
  const [stack, setStack] = useState([]);
  const parent = stack.length ? stack[stack.length - 1] : null;
  const items = parent ? availableChildren(parent, mode) : roots;
  const title = parent?.label || (mode === "paths" ? "المسارات البصرية" : "الموضوعات");

  function openItem(item) {
    const children = availableChildren(item, mode);
    const actions = actionItemsForTopic(item.topicCode, mode, item.label);
    if (children.length) {
      setStack((current) => [...current, item]);
      return;
    }
    if (actions[0]?.href) go(actions[0].href);
  }

  return (
    <div className="tree-dropdown-panel mobile-tree-panel mobile-topic-screen" dir="rtl">
      <div className="tree-dropdown-title mobile-tree-title">
        <button
          type="button"
          className="mobile-tree-back"
          onClick={() => {
            if (stack.length) setStack((current) => current.slice(0, -1));
            else onClose();
          }}
        >
          {stack.length ? "رجوع" : "إغلاق"}
        </button>
        <strong>{title}</strong>
      </div>
      <div className="mobile-topic-list" role="menu">
        {items.map((item) => {
          const children = availableChildren(item, mode);
          const actions = actionItemsForTopic(item.topicCode, mode, item.label);
          if (!children.length && !actions.length) return null;
          return (
            <button key={item.id} type="button" className="mobile-topic-item" onClick={() => openItem(item)}>
              <span>{item.label}</span>
              <span aria-hidden="true">{children.length ? "‹" : ""}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function TopicDropdown({
  currentCode,
  buttonLabel = "الموضوعات",
  className = "",
  locked = false,
  onNavigate,
  mode = "learning",
  icon,
}) {
  const roots = useMemo(() => (
    mode === "paths"
      ? TOPIC_TREE.filter((item) => ["nominal-sentence", "verbal-sentence"].includes(item.id))
      : TOPIC_TREE
  ), [mode]);
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const router = useRouter();


  useEffect(() => {
    function closeOutside(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    function closeEscape(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, []);

  function go(href) {
    setOpen(false);
    router.push(locked ? "/auth" : href);
    onNavigate?.();
  }

  function toggle() {
    if (locked) {
      router.push("/auth");
      onNavigate?.();
      return;
    }
    setOpen((value) => !value);
  }

  return (
    <div ref={rootRef} data-current-topic={currentCode || undefined} className={`topic-dropdown topic-tree-dropdown ${className}`}>
      <button type="button" className="topic-picker-btn cascade-trigger" onClick={toggle} aria-expanded={open} title={buttonLabel}>
        {icon ? <span className={`app-nav-icon app-nav-icon-${icon}`} aria-hidden="true" /> : null}
        <span className="app-nav-label">{buttonLabel}</span>
        <span className="topic-picker-arrow">▾</span>
      </button>

      {open ? (
        <MobilePanel roots={roots} go={go} mode={mode} onClose={() => setOpen(false)} />
      ) : null}
    </div>
  );
}
