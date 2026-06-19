import { NextRequest, NextResponse } from "next/server";
import { getAllCategories, createCategory } from "@/lib/mdx";

/**
 * GET /api/categories
 * 获取所有分类列表
 */
export async function GET() {
  try {
    const categories = await getAllCategories();
    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      { success: false, error: "获取分类列表失败" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories
 * 创建新分类
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createCategory(body.name);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, data: { category: result.category } },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/categories error:", error);
    return NextResponse.json(
      { success: false, error: "创建分类失败" },
      { status: 500 }
    );
  }
}
