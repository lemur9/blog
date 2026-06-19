"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import {
  Save, Eye, EyeOff, Plus, Trash2, LogOut, FileText,
  Calendar, Tag, CheckCircle2, XCircle,
} from "lucide-react";

interface BlogItem {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  content: string;
  status: "draft" | "published";
  date: string;
  author: string;
  summary: string;
  readingTime: number;
}

export default function EditorPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "draft" | "published">("all");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("未分类");
  const [tagsStr, setTagsStr] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [summary, setSummary] = useState("");

  const showToast = useCallback((type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const getToken = () => {
    // 优先从 localStorage 读取（兼容 localhost / 127.0.0.1）
    if (typeof window !== "undefined") {
      const ls = localStorage.getItem("admin_token");
      if (ls) return ls;
    }
    // 降级到 cookie
    const m = document.cookie.match(/admin_token=([^;]+)/);
    return m ? m[1] : null;
  };

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = "Bearer " + token;
      const res = await fetch("/api/admin/blogs", { headers });
      const data = await res.json();
      if (data.success) setBlogs(data.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBlogs(); }, []);

  useEffect(() => {
    if (selectedSlug && blogs.length > 0) {
      const blog = blogs.find((b) => b.slug === selectedSlug);
      if (blog) {
        setTitle(blog.title);
        setCategory(blog.category);
        setTagsStr(blog.tags.join(", "));
        setEditorContent(blog.content);
        setSummary(blog.summary);
      }
    }
  }, [selectedSlug, blogs]);

  const saveBlog = async (status: "draft" | "published") => {
    if (!title.trim() || !editorContent.trim()) {
      showToast("error", "标题和内容不能为空");
      return;
    }
    setSaving(true);
    try {
      const tags = tagsStr.split(",").map((t) => t.trim()).filter(Boolean);
      const isNew = !selectedSlug;
      const url = isNew ? "/api/admin/blogs" : "/api/blogs/" + selectedSlug;
      const token = getToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = "Bearer " + token;
      const res = await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers,
        body: JSON.stringify({
          title: title.trim(),
          category: category || "未分类",
          tags,
          content: editorContent,
          summary: summary.trim(),
          status,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", status === "published" ? "已发布" : "已保存草稿");
        await loadBlogs();
        if (isNew && data.data?.slug) setSelectedSlug(data.data.slug);
      } else {
        showToast("error", data.error || "保存失败");
      }
    } catch (err) {
      console.error("saveBlog error:", err);
      showToast("error", "网络错误，请检查控制台");
    } finally {
      setSaving(false);
    }
  };

  const deleteBlog = async (slug: string) => {
    if (!confirm("确定要删除这篇文章吗？")) return;
    setDeleting(true);
    try {
      const token = getToken();
      const res = await fetch("/api/blogs/" + slug, {
        method: "DELETE",
        headers: token ? { "Authorization": "Bearer " + token } : {}
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", "已删除");
        setSelectedSlug(null);
        setTitle("");
        setCategory("未分类");
        setTagsStr("");
        setEditorContent("");
        setSummary("");
        await loadBlogs();
      } else {
        showToast("error", data.error || "删除失败");
      }
    } catch {
      showToast("error", "网络错误");
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = async () => {
    // 清除 localStorage
    localStorage.removeItem("admin_token");
    // 清除 cookie
    document.cookie = "admin_token=; path=/; max-age=0";
    router.push("/admin/login");
  };

  const handleNew = () => {
    setSelectedSlug(null);
    setTitle("");
    setCategory("未分类");
    setTagsStr("");
    setEditorContent("");
    setSummary("");
  };

  const filteredBlogs = [...blogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">博客编辑器</h1>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors">
            <LogOut className="w-4 h-4" /> 退出登录
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex gap-6 p-6">
        <aside className="w-72 shrink-0">
          <button onClick={handleNew} className="w-full mb-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
            <Plus className="w-4 h-4" /> 新建文章
          </button>
          <div className="flex gap-1 mb-3 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button onClick={() => setActiveTab("all")} className={"flex-1 text-sm py-1.5 rounded-md font-medium transition-colors " + (activeTab === "all" ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300")}>全部 ({blogs.length})</button>
            <button onClick={() => setActiveTab("draft")} className={"flex-1 text-sm py-1.5 rounded-md font-medium transition-colors " + (activeTab === "draft" ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300")}>草稿 ({blogs.filter((b) => b.status === "draft").length})</button>
            <button onClick={() => setActiveTab("published")} className={"flex-1 text-sm py-1.5 rounded-md font-medium transition-colors " + (activeTab === "published" ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300")}>已发布 ({blogs.filter((b) => b.status === "published").length})</button>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {loading ? (
              <div className="p-6 text-center text-gray-400">加载中...</div>
            ) : filteredBlogs.length === 0 ? (
              <div className="p-6 text-center text-gray-400">暂无文章</div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredBlogs.map((blog) => (
                  <li key={blog.slug}>
                    <button
                      onClick={() => setSelectedSlug(blog.slug)}
                      className={"w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors " + (selectedSlug === blog.slug ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600" : "border-l-4 border-transparent")}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-gray-900 dark:text-white truncate">{blog.title}</span>
                        {blog.status === "published" ? (
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">已发布</span>
                        ) : (
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500">草稿</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" /> {blog.date}
                        <span>{"·"}</span>
                        <Tag className="w-3 h-3" /> {blog.category}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          {toast && (
            <div className={"mb-4 p-3 rounded-xl flex items-center gap-2 " + (toast.type === "success" ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400")}>
              {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {toast.msg}
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <input type="text" value={title} onChange={(e) => { if (e.target.value.length <= 100) setTitle(e.target.value); }} placeholder="文章标题（最多100字）" maxLength={100} className="w-full text-2xl font-bold text-gray-900 dark:text-white bg-transparent border-none outline-none placeholder-gray-300 dark:placeholder-gray-600" />
                <span className="ml-3 text-xs text-gray-400 whitespace-nowrap">{title.length}/100</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">分类</label>
                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="输入分类" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">标签（逗号分隔）</label>
                <input type="text" value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} placeholder="Next.js, TypeScript" className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">摘要</label>
              <textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="文章摘要" rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">正文内容（Markdown）</label>
                <button onClick={() => setShowPreview(!showPreview)} className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  {showPreview ? (<><EyeOff className="w-4 h-4" /> 隐藏预览</>) : (<><Eye className="w-4 h-4" /> 显示预览</>)}
                </button>
              </div>
              <div className="flex gap-4" style={{ minHeight: "400px" }}>
                <textarea
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  placeholder="在这里写 Markdown..."
                  className={"flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y " + (showPreview ? "w-1/2" : "w-full")}
                  style={{ minHeight: "400px" }}
                />
                {showPreview && (
                  <div className="w-1/2 pl-4 border-l border-gray-200 dark:border-gray-700 overflow-auto">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{editorContent || "*预览区域*"}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => saveBlog("draft")} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-colors disabled:opacity-50">
                <Save className="w-4 h-4" /> 保存草稿
              </button>
              <button onClick={() => saveBlog("published")} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium transition-colors disabled:opacity-50">
                <FileText className="w-4 h-4" /> 发布文章
              </button>
              {selectedSlug && (
                <button onClick={() => deleteBlog(selectedSlug)} disabled={deleting} className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors disabled:opacity-50">
                  <Trash2 className="w-4 h-4" /> 删除
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
