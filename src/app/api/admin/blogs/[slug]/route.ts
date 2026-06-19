import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/admin-auth";
import { getBlogBySlug, updateBlog, deleteBlog, BlogUpdateInput, publishBlog } from "@/lib/mdx";

function authCheck(request: NextRequest) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json(
      { success: false, error: "未授权，请先登录" },
      { status: 401 }
    );
  }
  return null;
}

/**
 * GET /api/admin/blogs/[slug]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authErr = authCheck(request);
  if (authErr) return authErr;

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
    console.error("GET /api/admin/blogs/[slug] error:", error);
    return NextResponse.json(
      { success: false, error: "获取博客详情失败" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/blogs/[slug]?action=publish|unpublish
 * 更新博客或执行发布/取消发布操作
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authErr = authCheck(request);
  if (authErr) return authErr;

  try {
    const { slug } = await params;
    const { searchParams } = request.nextUrl;
    const action = searchParams.get("action");

    if (action === "publish") {
      const published = await publishBlog(slug);
      if (!published) {
        return NextResponse.json(
          { success: false, error: "发布失败" },
          { status: 404 }
        );
      }
      const blog = await getBlogBySlug(slug);
      return NextResponse.json({ success: true, data: blog });
    }

    if (action === "unpublish") {
      const updated = await updateBlog(slug, { status: "draft" });
      if (!updated) {
        return NextResponse.json(
          { success: false, error: "操作失败" },
          { status: 404 }
        );
      }
      const blog = await getBlogBySlug(slug);
      return NextResponse.json({ success: true, data: blog });
    }

    const body: BlogUpdateInput = await request.json();

    if (body.title && body.title.length > 100) {
      return NextResponse.json(
        { success: false, error: "标题长度不能超过 100 个字符" },
        { status: 400 }
      );
    }

    const updated = await updateBlog(slug, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "博客不存在或更新失败" },
        { status: 404 }
      );
    }

    const blog = await getBlogBySlug(slug);
    return NextResponse.json({ success: true, data: blog });
  } catch (error) {
    console.error("PUT /api/admin/blogs/[slug] error:", error);
    return NextResponse.json(
      { success: false, error: "操作失败" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/blogs/[slug]
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authErr = authCheck(_request);
  if (authErr) return authErr;

  try {
    const { slug } = await params;
    const deleted = await deleteBlog(slug);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "博客不存在或删除失败" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "删除成功" });
  } catch (error) {
    console.error("DELETE /api/admin/blogs/[slug] error:", error);
    return NextResponse.json(
      { success: false, error: "删除博客失败" },
      { status: 500 }
    );
  }
}
