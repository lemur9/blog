"use client";

import { useState, useMemo } from "react";
import { PostMeta } from "@/lib/mdx";
import ArticleCard from "./ArticleCard";
import { Search, X, Filter } from "lucide-react";

interface ArticleListProps {
  posts: PostMeta[];
}

export default function ArticleList({ posts }: ArticleListProps) {
  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("");

  // Get all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [posts]);

  // Filter posts by search query and selected tag
  const filteredPosts = useMemo(() => {
    let result = posts;

    // Tag filter
    if (selectedTag) {
      result = result.filter((p) => p.tags.includes(selectedTag));
    }

    // Search filter
    if (query.trim()) {
      const lower = query.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(lower) ||
          p.summary.toLowerCase().includes(lower) ||
          p.tags.some((t) => t.toLowerCase().includes(lower))
      );
    }

    return result;
  }, [posts, query, selectedTag]);

  const hasFilter = query.trim() || selectedTag;

  return (
    <div>
      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索文章..."
            className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Tag Filter */}
        <div className="flex items-center gap-2">
          {allTags.length > 0 && (
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
              style={{ backgroundImage: "none" }}
            >
              <option value="">全部标签</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          )}
          {hasFilter && (
            <button
              onClick={() => { setQuery(""); setSelectedTag(""); }}
              className="px-2.5 py-2 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
            >
              <Filter className="w-3.5 h-3.5" />
              清除
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {(query.trim() || selectedTag) && (
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
          {selectedTag && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs">
              标签: {selectedTag}
              <button onClick={() => setSelectedTag("")} className="ml-0.5 hover:text-blue-900 dark:hover:text-blue-100">×</button>
            </span>
          )}
          {query.trim() && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs">
              搜索: "{query}"
              <button onClick={() => setQuery("")} className="ml-0.5 hover:text-gray-900 dark:hover:text-gray-100">×</button>
            </span>
          )}
          <span className="text-xs text-gray-400">— 共 {filteredPosts.length} 篇</span>
        </div>
      )}

      {/* Results */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-2">
            {hasFilter ? "没有找到匹配的文章" : "暂无文章"}
          </p>
          <p className="text-sm">
            {hasFilter
              ? '试试其他关键词或清除筛选条件'
              : '在 <code className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-sm">src/content/</code> 目录下添加 .mdx 文件即可。'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredPosts.map((post) => (
            <ArticleCard
              key={post.slug}
              title={post.title}
              summary={post.summary}
              tags={post.tags}
              date={post.date}
              readingTime={post.readingTime}
              slug={post.slug}
            />
          ))}
        </div>
      )}
    </div>
  );
}
