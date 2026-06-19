"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 防止 loading 状态卡死 —— 最多10秒后自动重置
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        console.log("[login] loading timeout, resetting");
        setLoading(false);
        setError("响应超时，请重试");
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    console.log("[login] handleSubmit called, password:", !!password, "loading:", loading);
    if (loading || !password.trim()) {
      console.log("[login] already loading or empty password, ignore");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const apiUrl = "/api/admin/auth";
      console.log("[login] fetching:", apiUrl);
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      console.log("[login] response status:", res.status);
      const data = await res.json();
      console.log("[login] response data:", data);

      if (data.success) {
        // 用 localStorage 存储 token（个人博客，兼容 localhost / 127.0.0.1）
        localStorage.setItem("admin_token", data.token);
        console.log("[login] token saved to localStorage, redirecting to /admin/editor");
        router.push("/admin/editor");
      } else {
        setError(data.error || "认证失败");
      }
    } catch (err) {
      console.error("[login] fetch failed:", err);
      setError("网络错误，请稍后重试");
    } finally {
      console.log("[login] setting loading to false");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
            <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">管理登录</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">请输入密码以访问博客编辑器</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入管理密码"
              autoComplete="new-password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-medium transition-colors disabled:cursor-not-allowed"
          >
            {loading ? "验证中..." : "登录"}
          </button>
        </form>
      </div>
    </div>
  );
}
