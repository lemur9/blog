import { getAllPosts } from "@/lib/mdx";
import ArticleList from "@/components/ArticleList";
import Link from "next/link";
import { BookOpen, Tag } from "lucide-react";

export default async function HomePage() {
  const posts = await getAllPosts();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
          <BookOpen className="w-4 h-4" />
          技术博客
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Lemurの博客
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          记录前端技术的学习、实践与思考。聚焦 Next.js、React、TypeScript、Tailwind CSS 等现代前端技术。
        </p>
      </div>

      {/* Article List with Search + Tag Filter */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          最新文章
        </h2>
        <Link href="/tags" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
          <Tag className="w-4 h-4" />
          查看全部标签
        </Link>
      </div>

      <ArticleList posts={posts} />

      {/* Stats */}
      <div className="mt-12 grid grid-cols-3 gap-4 text-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-2xl font-bold text-blue-600">{posts.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">篇文章</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-2xl font-bold text-green-600">
            {new Set(posts.flatMap((p) => p.tags)).size}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">个标签</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-2xl font-bold text-purple-600">
            {posts.reduce((sum, p) => sum + p.readingTime, 0)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">分钟阅读</p>
        </div>
      </div>
    </div>
  );
}
