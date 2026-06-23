export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server";
import { getBlogBySlug, updateBlog, deleteBlog, BlogUpdateInput } from "@/lib/mdx";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const blog = await getBlogBySlug(slug);
    if (!blog) {
      return NextResponse.json(
        { success: false, error: "博客不存在" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: blog });
  } catch (error) {
    console.error("GET /api/blogs/[slug] error:", error);
    return NextResponse.json(
      { success: false, error: "获取博客详情失败" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body: BlogUpdateInput = await request.json();

    // 先检查原始 slug 是否存在
    const existing = await getBlogBySlug(slug);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "博客不存在" },
        { status: 404 }
      );
    }

    // 如果更新了 title，需要检查新 slug 是否已存在
    if (body.title) {
      if (body.title.length > 100) {
        return NextResponse.json(
          { success: false, error: "标题长度不能超过 100 个字符" },
          { status: 400 }
        );
      }
      const newSlug = generateSlug(body.title);
      if (newSlug !== slug) {
        const existingWithNewSlug = await getBlogBySlug(newSlug);
        if (existingWithNewSlug && existingWithNewSlug.slug !== slug) {
          return NextResponse.json(
            { success: false, error: "新标题对应的 slug 已存在" },
            { status: 409 }
          );
        }
      }
    }

    const updated = await updateBlog(slug, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "更新失败" },
        { status: 404 }
      );
    }

    // 更新后，用新 slug 获取（title 可能变了）
    const newSlug = body.title ? generateSlug(body.title) : slug;
    const blog = await getBlogBySlug(newSlug);
    return NextResponse.json({ success: true, data: blog });
  } catch (error) {
    console.error("PUT /api/blogs/[slug] error:", error);
    return NextResponse.json(
      { success: false, error: "更新博客失败" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const deleted = await deleteBlog(slug);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "博客不存在" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: "已删除" });
  } catch (error) {
    console.error("DELETE /api/blogs/[slug] error:", error);
    return NextResponse.json(
      { success: false, error: "删除失败" },
      { status: 500 }
    );
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[\s\u3000]+/g, "-")
    .replace(/[^a-z0-9\u4e00-\u9fff\u3400-\u4dbf-]+/g, "")
    .replace(/^-+|-+$/g, "")
    || "post-" + Date.now();
}
