import { NextRequest, NextResponse } from "next/server";

/**
 * 验证 admin_token（优先读 Authorization header，其次读 cookie）
 * 兼容 localStorage (Authorization header) 和 cookie 两种方式
 */
export function verifyAdminAuth(request: NextRequest): boolean {
  // 1. 优先从 Authorization header 读取（localStorage 场景）
  const authHeader = request.headers.get("authorization") || "";
  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    if (/^[a-f0-9]{32,}$/.test(token)) return true;
  }

  // 2. 其次从 cookie 读取（传统 cookie 场景）
  const token = request.cookies.get("admin_token")?.value;
  if (!token) return false;

  // Simple validation: token must be a non-empty hex string (>= 16 chars)
  if (!/^[a-f0-9]{32,}$/.test(token)) return false;

  return true;
}

/**
 * 清除认证
 */
export function clearAuthResponse(): NextResponse {
  return NextResponse.json(
    { success: true, message: "已退出登录" },
    { status: 200 }
  );
}
