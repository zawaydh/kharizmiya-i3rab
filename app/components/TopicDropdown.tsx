"use client";

import { useEffect, useMemo, useRef, useState, type SVGProps } from "react";
import { useRouter } from "next/navigation";
import { getTopicMeta, getTopicRoutes, hasVisualPath } from "../../lib/topicCatalog";

type TopicDropdownMode = "learning" | "guide" | "paths";
type DropdownIconName = "guide" | "paths" | "topics";
type TopicAction = { label: string; href: string };
type TopicTreeNode = {
  id: string;
  label: string;
  topicCode?: string;
  modes?: TopicDropdownMode[];
  children?: TopicTreeNode[];
};

type TopicDropdownProps = {
  currentCode?: string;
  buttonLabel?: string;
  className?: string;
  locked?: boolean;
  onNavigate?: () => void;
  mode?: TopicDropdownMode;
  icon?: DropdownIconName;
};

const TOPIC_TREE: TopicTreeNode[] = [
  {
    id: "nominal-sentence",
    label: "الجملة الاسمية",
    children: [
      { id: "mubtada", label: "المبتدأ", topicCode: "nominal-advanced" },
      { id: "khabar", label: "الخبر", topicCode: "khabar" },
      { id: "kana", label: "كان وأخواتها", topicCode: "kana-wa-akhawatuha" },
      { id: "inna", label: "إن وأخواتها", topicCode: "inna-wa-akhawatuha" },
      { id: "la-nafiya", label: "لا النافية للجنس", topicCode: "la-nafiya" },
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
      { id: "naib-fael", label: "نائب الفاعل", topicCode: "naib-fael" },
      { id: "mafoolat", label: "المفاعيل", topicCode: "mafoolat", modes: ["learning", "guide"] },
      { id: "mafool-bih-path", label: "المفعول به", topicCode: "mafool-bih", modes: ["paths"] },
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
    id: "mansubat",
    label: "منصوبات أساسية",
    children: [
      { id: "hal", label: "الحال", topicCode: "hal" },
      { id: "tamyiz", label: "التمييز", topicCode: "tamyiz" },
      { id: "istithna", label: "الاستثناء", topicCode: "istithna" },
      { id: "munada", label: "المنادى", topicCode: "munada" },
    ],
  },
  {
    id: "nouns",
    label: "الأسماء وعلاماتها",
    children: [
      { id: "manqous", label: "الاسم المنقوص", topicCode: "ism-manqous" },
    ],
  },
  { id: "first", label: "مفتاح الكلمة الأولى", topicCode: "first-word-key" },
];


function DropdownIcon({ name }: { name: DropdownIconName }) {
  const common: SVGProps<SVGSVGElement> = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (name === "guide") {
    return <svg {...common}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5Z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5Z"/><path d="M7 7h2M15 7h2M7 11h2M15 11h2"/></svg>;
  }
  if (name === "paths") {
    return (
      <svg {...common} viewBox="0 0 24 24" style={{ color: "#2db7e5" }}>
        <circle cx="7" cy="4" r="2" />
        <circle cx="17" cy="9" r="2" />
        <circle cx="7" cy="20" r="2" />
        <path d="M7 6v12M7 14h7.2a2.8 2.8 0 0 0 2.8-2.8V11" />
      </svg>
    );
  }
  return <svg {...common}><path d="M4 5h16v14H4z"/><path d="M8 9h8M8 13h5"/><path d="m16 16 2 2 3-4"/></svg>;
}

function actionItemsForTopic(topicCode?: string, mode: TopicDropdownMode = "learning", topicLabel = "الموضوع"): TopicAction[] {
  const topic = topicCode ? getTopicMeta(topicCode) : null;
  if (!topic || !topic.isReady) return [];
  const routes = getTopicRoutes(topic.code);
  if (mode === "paths") {
    return hasVisualPath(topic.code) ? [{ label: "المسار البصري", href: routes.paths }] : [];
  }
  if (mode === "guide") {
    return [{ label: topicLabel, href: routes.guide }];
  }
  return [{ label: topicLabel, href: routes.learn }];
}

function availableChildren(item: TopicTreeNode, mode: TopicDropdownMode): TopicTreeNode[] {
  return (item.children || []).filter((child) => {
    if (child.modes && !child.modes.includes(mode)) return false;
    if (child.children?.length) return availableChildren(child, mode).length > 0;
    return actionItemsForTopic(child.topicCode, mode, child.label).length > 0;
  });
}

type MobilePanelProps = { roots: TopicTreeNode[]; go: (href: string) => void; mode: TopicDropdownMode; onClose: () => void };

function MobilePanel({ roots, go, mode, onClose }: MobilePanelProps) {
  const [stack, setStack] = useState<TopicTreeNode[]>([]);
  const parent = stack.length ? stack[stack.length - 1] : null;
  const items = parent ? availableChildren(parent, mode) : roots;
  const title = parent?.label || (
    mode === "paths"
      ? "المسارات البصرية"
      : mode === "guide"
        ? "تعليمات قبل التدريب"
        : "مدرّب التفكير"
  );

  function openItem(item: TopicTreeNode) {
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
            <button
              key={item.id}
              type="button"
              className="mobile-topic-item"
              onClick={() => openItem(item)}
            >
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
  buttonLabel = "مدرّب التفكير",
  className = "",
  locked = false,
  onNavigate,
  mode = "learning",
  icon,
}: TopicDropdownProps) {
  const roots = useMemo(() => (
    mode === "paths"
      ? TOPIC_TREE.filter((item) => ["nominal-sentence", "verbal-sentence"].includes(item.id))
      : TOPIC_TREE
  ), [mode]);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();


  useEffect(() => {
    function closeOutside(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function closeEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      document.removeEventListener("keydown", closeEscape);
    };
  }, []);

  function go(href: string) {
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
        {icon ? <span className="app-nav-icon"><DropdownIcon name={icon} /></span> : null}
        <span className="app-nav-label">{buttonLabel}</span>
        <span className="topic-picker-arrow">▾</span>
      </button>

      {open ? (
        <MobilePanel roots={roots} go={go} mode={mode} onClose={() => setOpen(false)} />
      ) : null}
    </div>
  );
}
