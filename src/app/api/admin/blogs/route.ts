export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/admin-auth";
import { getAllBlogs, createBlog, BlogCreateInput, BlogListParams, POSTS_DIR } from "@/lib/mdx";

/**
 * 中间件式认证检查
 */
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
 * GET /api/admin/blogs
 * 获取所有博客（含草稿），支持分页、分类/标签筛选
 */
export async function GET(request: NextRequest) {
  const authErr = authCheck(request);
  if (authErr) return authErr;

  try {
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;
    const tag = searchParams.get("tag") || undefined;

    const result = await getAllBlogs({
      page,
      pageSize: isNaN(pageSize) ? 20 : pageSize,
      category,
      tag,
      status: status as "draft" | "published" | undefined,
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/blogs error:", error);
    return NextResponse.json(
      { success: false, error: "获取博客列表失败" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/blogs
 * 创建新博客
 */
export async function POST(request: NextRequest) {
  const authErr = authCheck(request);
  if (authErr) return authErr;

  try {
    const body: BlogCreateInput = await request.json();

    if (!body.title || !body.category || !body.content) {
      return NextResponse.json(
        { success: false, error: "缺少必填字段：title, category, content" },
        { status: 400 }
      );
    }

    if (body.title.length > 100) {
      return NextResponse.json(
        { success: false, error: "标题长度不能超过 100 个字符" },
        { status: 400 }
      );
    }

    // 检查是否在生产环境
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: "生产环境暂不支持创建文章，请在本地开发" },
        { status: 501 }
      );
    }

    const result = await createBlog(body);

    return NextResponse.json(
      { success: true, data: result },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/blogs error:", error);
    return NextResponse.json(
      { success: false, error: "创建博客失败" },
      { status: 500 }
    );
  }
}
