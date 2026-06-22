import rss from "rss";
import { getAllPosts } from "@/lib/mdx";

export async function GET() {
  const posts = await getAllPosts();
  const siteUrl = "https://blog.lemur.dev";

  const feed = new rss({
    title: "Lemurの博客",
    description: "记录前端技术的学习、实践与思考",
    site_url: siteUrl,
    feed_url: `${siteUrl}/feed.xml`,
    language: "zh-CN",
  });

  posts.forEach((post) => {
    feed.item({
      title: post.title,
      url: `${siteUrl}/post/${post.slug}`,
      date: new Date(post.date),
      description: post.summary,
      author: post.author,
      categories: post.tags,
    });
  });

  return new Response(feed.xml(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
