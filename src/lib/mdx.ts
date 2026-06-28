import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve content directory for both dev and standalone deployment
// 优先使用环境变量 CONTENT_DIR（Vercel 部署时需要设置为可写路径）
let POSTS_DIR: string;
try {
  // 优先使用环境变量
  if (process.env.CONTENT_DIR) {
    POSTS_DIR = process.env.CONTENT_DIR;
  } else {
    POSTS_DIR = path.join(__dirname, "..", "content");
    if (!fs.existsSync(POSTS_DIR)) {
      POSTS_DIR = path.join(process.cwd(), "content");
    }
  }
} catch {
  POSTS_DIR = path.join(process.cwd(), "content");
}

// ==================== Blog API 数据模型 ====================

export type BlogStatus = "draft" | "published";

export interface Blog {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  content: string;
  status: BlogStatus;
  date: string;
  author: string;
  summary: string;
  readingTime: number;
}

export interface BlogCreateInput {
  title: string;
  category: string;
  tags?: string;
  content: string;
  summary?: string;
}

export interface BlogUpdateInput {
  title?: string;
  category?: string;
  tags?: string;
  content?: string;
  summary?: string;
  status?: BlogStatus;
}

export interface BlogListParams {
  status?: BlogStatus;
  category?: string;
  tag?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ==================== Category 管理 ====================

const CATEGORIES_FILE = path.join(__dirname, "..", "content", ".categories.json");

interface CategoriesData {
  categories: string[];
}

export async function getAllCategories(): Promise<string[]> {
  try {
    if (!fs.existsSync(CATEGORIES_FILE)) {
      return ["未分类"];
    }
    const raw = fs.readFileSync(CATEGORIES_FILE, "utf-8");
    const data: CategoriesData = JSON.parse(raw);
    return data.categories || ["未分类"];
  } catch {
    return ["未分类"];
  }
}

export async function createCategory(name: string): Promise<{ success: boolean; category?: string; error?: string }> {
  if (!name || !name.trim()) {
    return { success: false, error: "分类名称不能为空" };
  }
  const trimmed = name.trim();
  const cats = await getAllCategories();
  if (cats.includes(trimmed)) {
    return { success: false, error: "分类已存在" };
  }
  try {
    const data: CategoriesData = { categories: [...cats, trimmed] };
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(data, null, 2), "utf-8");
    return { success: true, category: trimmed };
  } catch (err) {
    return { success: false, error: "创建分类失败" };
  }
}

// ==================== Legacy Post 数据模型 ====================

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  author: string;
  tags: string[];
  summary: string;
  readingTime: number;
}

export interface Post extends PostMeta {
  content: string;
}

function parseFrontmatter(raw: string) {
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!fmMatch) return { meta: {}, content: raw };

  const fmData = fmMatch[1];
  const content = raw.slice(fmMatch[0].length).trim();
  const meta: Record<string, unknown> = {};

  const lines = fmData.split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) { i++; continue; }
    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();

    if (value === "" || value === "[]") {
      const arrLines: string[] = [];
      let j = i + 1;
      while (j < lines.length && lines[j].trim().startsWith("- ")) {
        arrLines.push(lines[j].trim().slice(2).replace(/["']/g, ""));
        j++;
      }
      if (arrLines.length > 0) {
        meta[key] = arrLines;
        i = j;
        continue;
      }
      meta[key] = value === "[]" ? [] : "";
    } else {
      if (value.startsWith("[") && value.endsWith("]")) {
        const inner = value.slice(1, -1);
        meta[key] = inner
          ? inner.split(",").map((v) => v.trim().replace(/["']/g, ""))
          : [];
      } else {
        meta[key] = value.replace(/["']/g, "");
      }
    }
    i++;
  }

  return { meta, content };
}

function estimateReadingTime(text: string): number {
  const wpm = 200;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / wpm));
}

/**
 * 解析标签字符串为数组（内部用）
 */
function parseTags(str: unknown): string[] {
  if (Array.isArray(str)) return str.map(String);
  if (typeof str === "string") {
    return str
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}

/**
 * 将标签数组转为逗号分隔字符串
 */
function formatTags(tags: string[]): string {
  return tags.filter(Boolean).join(",");
}

// ==================== Legacy 兼容方法 ====================

export async function getAllPosts(): Promise<PostMeta[]> {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));
  const posts: PostMeta[] = [];

  for (const file of files) {
    const fullPath = path.join(POSTS_DIR, file);
    const raw = fs.readFileSync(fullPath, "utf-8");
    const { meta, content } = parseFrontmatter(raw);
    const slug = file.replace(/\.mdx$/, "");
    const readingTime = estimateReadingTime(content);

    // 只返回已发布的文章
    const status = (meta.status as string) || "published";
    if (status !== "published") continue;

    posts.push({
      slug,
      title: (meta.title as string) || "",
      date: meta.date ? String(meta.date) : "",
      author: (meta.author as string) || "Lemur",
      tags: Array.isArray(meta.tags) ? (meta.tags as string[]) : [],
      summary: (meta.summary as string) || "",
      readingTime,
    });
  }

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { meta, content } = parseFrontmatter(raw);
  const readingTime = estimateReadingTime(content);

  return {
    slug,
    title: (meta.title as string) || "",
    date: meta.date ? String(meta.date) : "",
    author: (meta.author as string) || "Lemur",
    tags: Array.isArray(meta.tags) ? (meta.tags as string[]) : [],
    summary: (meta.summary as string) || "",
    readingTime,
    content,
  };
}

// ==================== Blog API 方法 ====================

/**
 * 生成 slug：将标题转为 kebab-case
 */
function generateSlug(title: string): string {
  const truncated = title.substring(0, 80);
  return truncated
    .toLowerCase()
    .replace(/[\s\u3000]+/g, "-")
    .replace(/[^a-z0-9\u4e00-\u9fff\u3400-\u4dbf-]+/g, "")
    .replace(/^-+|-+$/g, "")
    || "post-" + Date.now();
}

/**
 * 格式化 frontmatter 字符串
 */
function formatFrontmatter(data: Record<string, unknown>): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${key}: []`);
      } else {
        lines.push(`${key}:`);
        for (const item of value) {
          lines.push(`  - ${item}`);
        }
      }
    } else if (typeof value === "string") {
      lines.push(`${key}: ${value}`);
    } else {
      lines.push(`${key}: ${JSON.stringify(value)}`);
    }
  }
  return lines.join("\n");
}

/**
 * 构建 MDX 文件的完整内容
 */
function buildMdxFile(
  frontmatter: Record<string, unknown>,
  body: string
): string {
  return `---\n${formatFrontmatter(frontmatter)}\n---\n${body}\n`;
}

/**
 * 获取所有博客（支持分页、分类/标签筛选，默认只返回 published）
 */
export async function getAllBlogs(
  params?: BlogListParams
): Promise<PaginatedResult<Blog>> {
  const {
    status,
    category,
    tag,
    page = 1,
    pageSize = 20,
  } = params ?? {};

  // 如果没有指定 status，不过滤；否则按 status 筛选
  const statusFilter = params?.status;

  if (!fs.existsSync(POSTS_DIR)) {
    return { data: [], total: 0, page, pageSize, totalPages: 0 };
  }
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".mdx"));
  const allBlogs: Blog[] = [];

  for (const file of files) {
    const fullPath = path.join(POSTS_DIR, file);
    const raw = fs.readFileSync(fullPath, "utf-8");
    const { meta, content } = parseFrontmatter(raw);
    const slug = file.replace(/\.mdx$/, "");
    const readingTime = estimateReadingTime(content);

    const blogStatus = ((meta.status as string) || "draft") as BlogStatus;

    // 如果指定了 status 则过滤
    if (statusFilter !== undefined && blogStatus !== statusFilter) continue;

    // 按分类筛选
    if (category && (meta.category as string) !== category) continue;

    // 按标签筛选
    if (tag) {
      const blogTags = parseTags(meta.tags);
      if (!blogTags.includes(tag)) continue;
    }

    allBlogs.push({
      slug,
      title: (meta.title as string) || "",
      category: (meta.category as string) || "未分类",
      tags: parseTags(meta.tags),
      content,
      status: blogStatus,
      date: meta.date ? String(meta.date) : "",
      author: (meta.author as string) || "Lemur",
      summary: (meta.summary as string) || "",
      readingTime,
    });
  }

  allBlogs.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const total = allBlogs.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const data = allBlogs.slice(start, start + pageSize);

  return { data, total, page, pageSize, totalPages };
}

/**
 * 根据 slug 获取单篇博客
 */
export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { meta, content } = parseFrontmatter(raw);
  const readingTime = estimateReadingTime(content);

  const blogStatus = ((meta.status as string) || "draft") as BlogStatus;

  return {
    slug,
    title: (meta.title as string) || "",
    category: (meta.category as string) || "未分类",
    tags: parseTags(meta.tags),
    content,
    status: blogStatus,
    date: meta.date ? String(meta.date) : "",
    author: (meta.author as string) || "Lemur",
    summary: (meta.summary as string) || "",
    readingTime,
  };
}

/**
 * 创建新博客（写入 MDX 文件，默认 draft）
 */
export async function createBlog(
  input: BlogCreateInput
): Promise<{ slug: string }> {
  const slug = generateSlug(input.title);
  const now = new Date().toISOString().split("T")[0];

  const tagArray = input.tags ? parseTags(input.tags) : [];

  const frontmatter: Record<string, unknown> = {
    title: input.title,
    date: now,
    author: "Lemur",
    category: input.category,
    tags: tagArray,
    status: "draft" as BlogStatus,
    summary: input.summary || "",
  };

  const mdxContent = buildMdxFile(frontmatter, input.content);
  let finalSlug = slug;
  let filePath = path.join(POSTS_DIR, `${slug}.mdx`);

  // 如果 slug 已存在，添加时间戳后缀
  if (fs.existsSync(filePath)) {
    const timestamp = Date.now();
    finalSlug = `${slug}-${timestamp}`;
    filePath = path.join(POSTS_DIR, `${finalSlug}.mdx`);
  }

  fs.writeFileSync(filePath, mdxContent, "utf-8");
  return { slug: finalSlug };
}

/**
 * 更新博客（更新 MDX 文件）
 */
export async function updateBlog(
  slug: string,
  input: BlogUpdateInput
): Promise<boolean> {
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return false;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { meta, content: existingContent } = parseFrontmatter(raw);

  const updatedMeta: Record<string, unknown> = {
    ...(meta as Record<string, unknown>),
  };

  if (input.title !== undefined) updatedMeta.title = input.title;
  if (input.category !== undefined) updatedMeta.category = input.category;
  if (input.tags !== undefined) {
    updatedMeta.tags = parseTags(input.tags);
  }
  if (input.summary !== undefined) updatedMeta.summary = input.summary;
  if (input.status !== undefined) updatedMeta.status = input.status;

  const newContent = input.content !== undefined ? input.content : existingContent;
  const newSlug = input.title !== undefined ? generateSlug(input.title) : slug;

  const mdxContent = buildMdxFile(updatedMeta, newContent);

  if (newSlug !== slug) {
    // slug 变化了，写入新文件，删除旧文件
    const targetPath = path.join(POSTS_DIR, `${newSlug}.mdx`);
    if (fs.existsSync(targetPath)) {
      // 新 slug 已存在，加时间戳后缀
      const timestamp = Date.now();
      const finalSlug = `${newSlug}-${timestamp}`;
      updatedMeta.title = `${input.title} (${timestamp})`;
      const finalPath = path.join(POSTS_DIR, `${finalSlug}.mdx`);
      const finalMdx = buildMdxFile(updatedMeta, newContent);
      fs.writeFileSync(finalPath, finalMdx, "utf-8");
    } else {
      fs.writeFileSync(targetPath, mdxContent, "utf-8");
    }
    fs.unlinkSync(filePath);
  } else {
    // slug 不变，直接覆盖
    fs.writeFileSync(filePath, mdxContent, "utf-8");
  }

  return true;
}

/**
 * 发布博客（将 status 改为 published）
 */
export async function publishBlog(slug: string): Promise<boolean> {
  return updateBlog(slug, { status: "published" });
}

/**
 * 删除博客
 */
export async function deleteBlog(slug: string): Promise<boolean> {
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return false;
  fs.unlinkSync(filePath);
  return true;
}

// ==================== Legacy 兼容导出 ====================

export async function getAllTags(): Promise<string[]> {
  const posts = await getAllPosts();
  const tagSet = new Set<string>();
  posts.forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}
