import { getAllPosts } from "@/lib/mdx";
import { getTagCounts, getAllTags } from "@/lib/tags";
import Link from "next/link";
import { Tag } from "lucide-react";

export default async function TagsPage() {
  const posts = await getAllPosts();
  const tagCounts = await getTagCounts();
  const allTags = await getAllTags();

  // Calculate size based on count
  const getSize = (tag: string) => {
    const count = tagCounts[tag] || 0;
    if (count >= 3) return "text-lg px-4 py-2";
    if (count >= 2) return "text-base px-3 py-1.5";
    return "text-sm px-2.5 py-1";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 flex items-center justify-center gap-2">
          <Tag className="w-8 h-8 text-blue-600" />
          标签云
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          共 {allTags.length} 个标签，{posts.length} 篇文章
        </p>
      </div>

      {/* Tag Cloud */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
        {allTags.map((tag) => (
          <Link
            key={tag}
            href={`/tags`}
            className={`inline-flex items-center gap-1.5 rounded-full font-medium transition-all hover:scale-105 cursor-pointer
              ${getSize(tag)}
              bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
              text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400
              shadow-sm hover:shadow-md`}
          >
            <Tag className="w-4 h-4" />
            {tag}
            <span className="text-xs opacity-60">×{tagCounts[tag]}</span>
          </Link>
        ))}
      </div>

      {/* Posts by tag */}
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">按标签分组</h2>
      <div className="space-y-8">
        {allTags.map((tag) => {
          const tagPosts = posts.filter((p) => p.tags.includes(tag));
          return (
            <div key={tag} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                {tag} ({tagPosts.length})
              </h3>
              <div className="space-y-2">
                {tagPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/post/${post.slug}`}
                    className="flex items-center justify-between group p-2 -mx-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </span>
                    <span className="text-sm text-gray-400">
                      {new Date(post.date).toLocaleDateString("zh-CN")}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
