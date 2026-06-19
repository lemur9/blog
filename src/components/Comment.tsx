"use client";

import { useEffect, useRef } from "react";

interface CommentProps {
  repo: string;
  repoId: string;
  categoryId: string;
  mapping: string;
  strict: string;
  reactionsEnabled: string;
  emitMetadata: string;
  inputPosition: string;
  lang: string;
  theme: string;
}

export default function Comment(props?: Partial<CommentProps>) {
  const {
    repo = process.env.NEXT_PUBLIC_GISCUS_REPO || "lemur9/blog",
    repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID || "R_kgDOS-LcrQ",
    categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || "DIC_kwDOS-Lcrc4C_aEM",
    mapping = process.env.NEXT_PUBLIC_GISCUS_MAPPING || "og:title",
    strict = process.env.NEXT_PUBLIC_GISCUS_STRICT || "0",
    reactionsEnabled = process.env.NEXT_PUBLIC_GISCUS_REACTIONS_ENABLED || "1",
    emitMetadata = process.env.NEXT_PUBLIC_GISCUS_EMIT_METADATA || "0",
    inputPosition = process.env.NEXT_PUBLIC_GISCUS_INPUT_POSITION || "bottom",
    lang = process.env.NEXT_PUBLIC_GISCUS_LANG || "zh-CN",
    theme = process.env.NEXT_PUBLIC_GISCUS_THEME || "preferred_color_scheme",
  } = props || {};

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!repoId || !categoryId) {
      console.warn("[giscus] repoId or categoryId not configured. Please set NEXT_PUBLIC_GISCUS_REPO_ID and NEXT_PUBLIC_GISCUS_CATEGORY_ID in .env.local");
      return;
    }

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", repo);
    script.setAttribute("data-repo-id", repoId);
    script.setAttribute("data-category-id", categoryId);
    script.setAttribute("data-mapping", mapping);
    script.setAttribute("data-strict", strict);
    script.setAttribute("data-reactions-enabled", reactionsEnabled);
    script.setAttribute("data-emit-metadata", emitMetadata);
    script.setAttribute("data-input-position", inputPosition);
    script.setAttribute("data-theme", theme);
    script.setAttribute("data-lang", lang);
    script.async = true;

    if (ref.current) {
      ref.current.appendChild(script);
    }

    return () => {
      if (ref.current && script.parentNode) {
        ref.current.removeChild(script);
      }
    };
  }, [repo, repoId, categoryId, mapping, strict, reactionsEnabled, emitMetadata, inputPosition, lang, theme]);

  return <div ref={ref} className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800" />;
}
