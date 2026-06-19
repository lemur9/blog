import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, Tag, ArrowRight } from "lucide-react";

interface ArticleCardProps {
  title: string;
  summary: string;
  tags: string[];
  date: string;
  readingTime: number;
  slug: string;
}

export default function ArticleCard({ title, summary, tags, date, readingTime, slug }: ArticleCardProps) {
  const formattedDate = new Date(date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200">
      {/* Click overlay — covers the whole card, does not interfere with inner links */}
      <Link href={`/post/${slug}`} className="absolute inset-0 rounded-xl" aria-label={`阅读 ${title}`} />

      {/* Title */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2 relative z-10">
        {title}
      </h2>

      {/* Meta */}
      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3 relative z-10">
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {formattedDate}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {readingTime} 分钟
        </span>
      </div>

      {/* Summary */}
      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-2 relative z-10">
        {summary}
      </p>

      {/* Tags */}
      <div className="flex items-center gap-2 flex-wrap mb-4 relative z-10">
        {tags.map((tag) => (
          <Link
            key={tag}
            href={`/tags`}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            <Tag className="w-3 h-3" />
            {tag}
          </Link>
        ))}
      </div>

      {/* Read more */}
      <div className="mt-4 flex items-center text-sm text-blue-600 dark:text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
        阅读全文
        <ArrowRight className="w-4 h-4 ml-1" />
      </div>
    </article>
  );
}
