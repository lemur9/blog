export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server";
import { publishBlog, getBlogBySlug } from "@/lib/mdx";

/**
 * PUT /api/blogs/[slug]/publish
 * 发布博客，将 status 改为 published
 */
export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const published = await publishBlog(slug);

    if (!published) {
      return NextResponse.json(
        { success: false, error: "博客不存在或发布失败" },
        { status: 404 }
      );
    }

    const blog = await getBlogBySlug(slug);
    return NextResponse.json({ success: true, data: blog });
  } catch (error) {
    console.error("PUT /api/blogs/[slug]/publish error:", error);
    return NextResponse.json(
      { success: false, error: "发布博客失败" },
      { status: 500 }
    );
  }
}
