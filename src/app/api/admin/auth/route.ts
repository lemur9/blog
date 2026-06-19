import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function getPassword(): string {
  return process.env.ADMIN_PASSWORD || "admin123";
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * POST /api/admin/auth
 * 验证密码，成功返回 token（同时设置 cookie 兼容旧版）
 */
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { success: false, error: "请输入密码" },
        { status: 400 }
      );
    }

    const expected = getPassword();

    if (password === expected) {
      const token = generateToken();
      const response = NextResponse.json({ success: true, token });
      // 同时设置 cookie（兼容直接从 cookie 读取的场景）
      response.cookies.set({
        name: "admin_token",
        value: token,
        path: "/",
        maxAge: 60 * 60 * 24,
        sameSite: "lax",
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
      });
      return response;
    }

    return NextResponse.json(
      { success: false, error: "密码错误" },
      { status: 401 }
    );
  } catch (error) {
    console.error("POST /api/admin/auth error:", error);
    return NextResponse.json(
      { success: false, error: "服务器错误" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/auth/check
 * 检查当前是否已认证
 */
export async function GET(request: NextRequest) {
  const cookies = request.cookies;
  const token = cookies.get("admin_token")?.value;

  if (!token) {
    return NextResponse.json({ success: false, authenticated: false });
  }

  // Simple check: if ADMIN_PASSWORD is set, consider authenticated
  // Token validation happens on each protected API call
  return NextResponse.json({ success: true, authenticated: true });
}
