"use client";

import { useEffect, useState } from "react";
import { List } from "lucide-react";

export default function TableOfContents({ headings }: { headings: { id: string; text: string; level: number }[] }) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    const elements = headings.map((h) => document.getElementById(h.id));
    elements.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <aside className="sticky top-20 w-56 hidden xl:block">
      <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <List className="w-3.5 h-3.5" />
        目录
      </div>
      <nav className="space-y-1 border-l border-gray-200 dark:border-gray-700">
        {headings.map((h) => (
          <a
            key={h.id}
            href={`#${h.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" });
              window.history.pushState(null, "", `#${h.id}`);
              setActiveId(h.id);
            }}
            className={`block pl-3 py-1 text-sm border-l -ml-px transition-colors
              ${h.level === 2 ? "font-medium" : "pl-6 text-gray-500 dark:text-gray-400"}
              ${
                activeId === h.id
                  ? "border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
          >
            {h.text}
          </a>
        ))}
      </nav>
    </aside>
  );
}
