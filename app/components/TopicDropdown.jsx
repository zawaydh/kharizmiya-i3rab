"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getReadyTopics, getTopicRoutes } from "../../lib/topics";

export default function TopicDropdown({
  currentCode,
  compact = false,
  buttonLabel = "الموضوعات",
  className = "",
  locked = false,
  onNavigate,
}) {
  const [open, setOpen] = useState(false);
  const [activeTopic, setActiveTopic] = useState(null);
  const rootRef = useRef(null);
  const router = useRouter();
  const topics = useMemo(() => getReadyTopics(), []);
  const current = topics.find((topic) => topic.code === currentCode) ?? null;

  useEffect(() => {
    function closeOutside(e) {
      if (!rootRef.current?.contains(e.target)) {
        setOpen(false);
        setActiveTopic(null);
      }
    }
    function closeEscape(e) {
      if (e.key === "Escape") {
        setOpen(false);
        setActiveTopic(null);
      }
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
    setActiveTopic(null);
    onNavigate?.();
    router.push(locked ? "/auth" : href);
  }

  function toggle() {
    if (locked) {
      router.push("/auth");
      return;
    }
    setOpen((v) => !v);
  }

  return (
    <div ref={rootRef} className={`topic-dropdown topic-cascade-dropdown ${compact ? "compact" : ""} ${className}`}>
      <button type="button" className="topic-picker-btn cascade-trigger" onClick={toggle} aria-expanded={open}>
        <span>{current?.name_ar || buttonLabel}</span>
        <span className="topic-picker-arrow">▾</span>
      </button>

      {open ? (
        <div className="cascade-menu" dir="rtl">
          <ul className="cascade-level cascade-root-list">
            {topics.map((topic) => {
              const routes = getTopicRoutes(topic.code);
              const active = activeTopic === topic.code;
              return (
                <li key={topic.code} className="cascade-item has-submenu" onMouseEnter={() => setActiveTopic(topic.code)}>
                  <button type="button" className="cascade-link" onClick={() => setActiveTopic(active ? null : topic.code)}>
                    <span>{topic.name_ar}</span>
                    <span className="cascade-arrow">‹</span>
                  </button>
                  {active ? (
                    <ul className="cascade-level cascade-submenu cascade-branch-menu">
                      <li className="cascade-item"><button type="button" className="cascade-link" onClick={() => go(routes.learn)}>تعلّم</button></li>
                      <li className="cascade-item"><button type="button" className="cascade-link" onClick={() => go(routes.paths)}>المسار البصري</button></li>
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
