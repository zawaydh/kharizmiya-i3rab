
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getTopicByCode, getTopicRoutes } from "../../lib/topics";

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
    return [{ label: "المسار البصري", href: routes.paths }];
  }
  // لا نضيف زر "ابدأ" داخل القائمة؛ اسم الموضوع نفسه ينقل للصفحة حتى تقل الزحمة.
  return [{ label: topicLabel, href: routes.learn }];
}

function TreeItem({ item, level = 0, go, mode = "learning" }) {
  const [open, setOpen] = useState(false);
  const actions = actionItemsForTopic(item.topicCode, mode, item.label);
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;
  const hasActions = actions.length > 0;
  const disabled = item.disabled || (!hasActions && !hasChildren);

  return (
    <li className={`tree-menu-item level-${level} ${open ? "is-open" : ""} ${disabled ? "is-disabled" : ""}`}>
      <button
        type="button"
        className="tree-menu-label"
        disabled={disabled}
        onClick={() => {
          if (!hasChildren && hasActions && actions[0]?.href) {
            go(actions[0].href);
            return;
          }
          if (hasChildren || hasActions) setOpen((v) => !v);
        }}
        title={item.note || undefined}
      >
        <span>{item.label}</span>
        {(hasChildren || hasActions) ? <span className="tree-menu-arrow">▾</span> : <span className="tree-menu-soon">قريبًا</span>}
      </button>

      {open && item.note ? <div className="tree-menu-note">{item.note}</div> : null}

      {open && hasActions && mode === "paths" ? (
        <ul className="tree-menu-actions">
          {actions.map((a) => (
            <li key={a.href}>
              <button type="button" className="tree-menu-action" onClick={() => go(a.href)}>
                {a.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {open && hasChildren ? (
        <ul className="tree-menu-children">
          {item.children.map((child) => (
            <TreeItem key={child.id} item={child} level={level + 1} go={go} mode={mode} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export default function TopicDropdown({
  currentCode,
  compact = false,
  buttonLabel = "الموضوعات",
  className = "",
  locked = false,
  onNavigate,
  mode = "learning",
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const router = useRouter();
  const current = currentCode ? getTopicByCode(currentCode) : null;

  useEffect(() => {
    function closeOutside(e) {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    }
    function closeEscape(e) {
      if (e.key === "Escape") setOpen(false);
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
    setOpen((v) => !v);
  }

  return (
    <div ref={rootRef} className={`topic-dropdown topic-tree-dropdown ${compact ? "compact" : ""} ${className}`}>
      <button type="button" className="topic-picker-btn cascade-trigger" onClick={toggle} aria-expanded={open}>
        <span>{buttonLabel}</span>
        <span className="topic-picker-arrow">▾</span>
      </button>

      {open ? (
        <div className="tree-dropdown-panel" dir="rtl">
          <div className="tree-dropdown-title">{mode === "paths" ? "المسارات البصرية" : "الموضوعات"}</div>
          <ul className="tree-menu-root">
            {TOPIC_TREE.map((item) => (
              <TreeItem key={item.id} item={item} go={go} mode={mode} />
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
