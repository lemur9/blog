"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, X } from "lucide-react";
import { PostMeta } from "@/lib/mdx";
import ArticleCard from "./ArticleCard";

interface SearchBoxProps {
  posts: PostMeta[];
}

export default function SearchBox({ posts }: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PostMeta[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  // Full-text search (title + summary + tags)
  const doSearch = useCallback((q: string) => {
    if (!q.trim()) return [];
    const lower = q.toLowerCase();
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(lower) ||
        p.summary.toLowerCase().includes(lower) ||
        p.tags.some((t) => t.toLowerCase().includes(lower))
    );
  }, [posts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setResults(doSearch(query));
    }, 200);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  return (
    <>
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="搜索文章..."
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Search Results */}
      {isFocused && query && (
        <div className="mt-3 mx-auto max-w-md">
          {results.length > 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              搜索 "{query}"，找到 {results.length} 篇相关文章
            </p>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              搜索 "{query}"，暂无匹配结果
            </p>
          )}
        </div>
      )}
    </>
  );
}
