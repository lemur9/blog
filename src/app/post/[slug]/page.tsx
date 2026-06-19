import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/mdx";
import Link from "next/link";
import { Calendar, Clock, Tag, ArrowLeft } from "lucide-react";
import TableOfContents from "@/components/TableOfContents";
import Comment from "@/components/Comment";
import "highlight.js/styles/github-dark.min.css";

// Unified pipeline: remark-parse → remark-gfm → remark-rehype → rehype plugins → rehype-stringify
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeStringify from "rehype-stringify";

interface PageProps {
  params: Promise<{ slug: string }>;
}

interface Heading {
  id: string;
  text: string;
  level: number;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "文章未找到" };
  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      publishedTime: new Date(post.date).toISOString(),
      authors: [post.author],
      tags: post.tags,
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const formattedDate = new Date(post.date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Fixed: use unified() with explicit remark-parse → remark-rehype bridge
  // remark() v15 is markdown→markdown only and lacks .rehype() bridge
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeHighlight, {
      detect: true,
      ignoreMissing: true,
    })
    .use(rehypeAutolinkHeadings, {
      behavior: "append",
      content: [
        {
          type: "text",
          value: " #",
        },
      ],
      properties: {
        className: ["heading-link"],
        ariaLabel: "锚定此标题",
      },
    })
    .use(rehypeStringify)
    .process(post.content);

  const htmlString = String(result.value);

  // Extract headings for table of contents (h2 and h3)
  const headingRegex = /<h([23])[^>]*id="([^"]+)"[^>]*>([^<]+)<\/h[23]>/g;
  const headings: Heading[] = [];
  let match;
  while ((match = headingRegex.exec(htmlString)) !== null) {
    headings.push({
      id: match[2],
      text: match[3],
      level: parseInt(match[1]),
    });
  }

  return (
    <article className="max-w-4xl xl:max-w-[calc(100%-16rem)] mx-auto px-4 sm:px-6 py-8">
      <div className="flex gap-10">
        <div className="flex-1 min-w-0">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              约 {post.readingTime} 分钟
            </span>
            <span>作者：{post.author}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap mb-8">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tags`}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                <Tag className="w-3.5 h-3.5" />
                {tag}
              </Link>
            ))}
          </div>

          {/* prose styles from @tailwindcss/typography */}
          <div
            className="prose prose-gray dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-img:rounded-lg prose-headings:scroll-mt-20 prose-pre:bg-gray-900 prose-pre:!rounded-xl prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm"
            dangerouslySetInnerHTML={{ __html: htmlString }}
          />

          {/* Comment Section */}
          <Comment />
        </div>

        <TableOfContents headings={headings} />
      </div>
    </article>
  );
}
