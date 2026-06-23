export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server";

/**
 * POST /api/admin/logout
 * 清除 token（cookie + localStorage）
 */
export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "已退出登录",
  });

  response.cookies.set("admin_token", "", {
    path: "/",
    maxAge: 0,
    sameSite: "lax",
  });

  return response;
}

/**
 * GET /api/admin/logout
 * 前端通过 window.location.href 跳转时清除 localStorage
 */
export async function GET() {
  return NextResponse.json({ success: true, cleared: true });
}
