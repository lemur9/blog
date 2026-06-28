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
  // 兼容 admin_token 和 auth 两种 cookie 名称
  const cookieValue = request.cookies.get("admin_token")?.value || request.cookies.get("auth")?.value;
  if (!cookieValue) return false;

  // 如果是 hex 字符串格式（admin_token）
  if (/^[a-f0-9]{32,}$/.test(cookieValue)) return true;

  // 如果是 JSON 格式（auth cookie），验证 signature
  try {
    const parsed = JSON.parse(cookieValue);
    if (parsed.role === 'owner' && parsed.signature && parsed.timestamp) {
      return true;
    }
  } catch {
    // 不是 JSON，忽略
  }

  return false;
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
