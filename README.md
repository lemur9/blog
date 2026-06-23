# 博客系统

基于 Next.js + TypeScript + MDX 的个人博客系统，支持多 Agent 协作开发。

## 技术栈

- **框架：** Next.js 15.4.x (App Router, standalone 部署)
- **语言：** TypeScript
- **样式：** Tailwind CSS 4 + @tailwindcss/typography
- **内容：** MDX 文件驱动
- **主题切换：** next-themes (深色/浅色模式)
- **Markdown 渲染：** unified + remark-parse + remark-gfm + remark-rehype + rehype-stringify
- **代码高亮：** rehype-highlight + prismjs
- **评论系统：** Giscus (GitHub Discussions)
- **搜索：** FlexSearch
- **RSS：** rss 库 + feed.xml

## 项目结构

```
blog/
├── content/                  # MDX 文章目录
│   ├── .categories.json      # 分类管理（自动创建）
│   ├── hello-world.mdx
│   ├── getting-started-with-nextjs.mdx
│   └── tailwind-css-tips.mdx
├── src/
│   ├── app/                  # Next.js App Router 页面
│   │   ├── (site) pages      # 前台页面
│   │   │   ├── page.tsx      # 首页（文章列表）
│   │   │   ├── about/        # 关于页
│   │   │   ├── tags/         # 标签页
│   │   │   └── post/[slug]/  # 文章详情页
│   │   ├── admin/            # 后台管理页面
│   │   │   ├── login/        # 登录页
│   │   │   └── editor/       # 博客编辑器
│   │   ├── api/              # API 接口
│   │   │   ├── admin/        # 后台 API（需认证）
│   │   │   │   ├── auth/     # 登录认证
│   │   │   │   ├── blogs/    # 博客 CRUD
│   │   │   │   │   └── [slug]/ # 单篇操作 + publish/unpublish
│   │   │   │   └── logout/   # 登出
│   │   │   ├── blogs/        # 前台 API
│   │   │   │   ├── [slug]/   # 单篇详情/更新/删除
│   │   │   │   │   └── publish/ # 发布/取消发布
│   │   │   └── categories/   # 分类管理
│   │   ├── feed.xml          # RSS 订阅源
│   │   ├── layout.tsx        # 根布局（主题切换、Giscus 元标签）
│   │   └── globals.css       # 全局样式
│   ├── components/           # React 组件
│   │   ├── ArticleCard.tsx   # 文章卡片
│   │   ├── ArticleList.tsx   # 文章列表
│   │   ├── Comment.tsx       # Giscus 评论组件
│   │   ├── DarkModeToggle.tsx # 深色模式切换
│   │   ├── EditorPage.tsx    # 博客编辑器
│   │   ├── Footer.tsx        # 页脚
│   │   ├── Header.tsx        # 导航栏
│   │   ├── SearchBox.tsx     # 搜索框
│   │   └── TableOfContents.tsx # 目录导航
│   ├── lib/                  # 工具函数
│   │   ├── mdx.ts            # MDX 解析、博客 CRUD、分类管理
│   │   └── admin-auth.ts     # 管理员认证（Authorization header + cookie 双通道）
│   └── content/              # MDX 文章源文件
├── next.config.mjs           # Next.js 配置 (standalone + turbopack)
├── package.json
└── tsconfig.json
```

## 快速开始

### 前置要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
cd /home/lemur/work/mixProject/blog
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 或 http://127.0.0.1:3000

### 构建生产版本

```bash
npm run build
```

构建输出：
- `.next/` — 构建产物
- `.next/standalone/` — 独立部署包（含 `package.json`）

### 启动生产服务器

```bash
npm start
```

### 独立部署

```bash
# 构建
npm run build

# 复制独立包
cp -r .next/standalone server/
cp -r .next/static server/.next/static
cp -r content server/content

# 启动
cd server
npm install --omit=dev
PORT=3000 node server.js
```

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `ADMIN_PASSWORD` | `admin123` | 后台登录密码 |
| `NEXT_PUBLIC_GISCUS_REPO` | — | GitHub 仓库名 (如 lemur9/blog) |
| `NEXT_PUBLIC_GISCUS_REPO_ID` | — | Giscus repo ID |
| `NEXT_PUBLIC_GISCUS_CATEGORY_ID` | — | Giscus 讨论区 category ID |
| `NEXT_PUBLIC_GISCUS_MAPPING` | `og:title` | 评论页面映射方式 |
| `NEXT_PUBLIC_GISCUS_LANG` | `zh-CN` | 评论系统语言 |
| `NEXT_PUBLIC_GISCUS_THEME` | `preferred_color_scheme` | 评论主题跟随系统 |

创建 `.env.local` 文件：

```bash
ADMIN_PASSWORD=your_secure_password
NEXT_PUBLIC_GISCUS_REPO=lemur9/blog
NEXT_PUBLIC_GISCUS_REPO_ID=your_repo_id
NEXT_PUBLIC_GISCUS_CATEGORY_ID=your_category_id
```

## API 接口

### 前台 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/blogs` | 获取博客列表（支持分页、分类/标签筛选） |
| GET | `/api/blogs/:slug` | 获取单篇详情 |
| PUT | `/api/blogs/:slug` | 更新博客 |
| DELETE | `/api/blogs/:slug` | 删除博客 |
| PUT | `/api/blogs/:slug/publish` | 发布/取消发布 |
| GET | `/api/categories` | 获取分类列表 |
| POST | `/api/categories` | 创建分类 |

查询参数：`page`, `pageSize`, `category`, `tag`, `status`

### 后台 API（需认证）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/admin/auth` | 登录认证（返回 token） |
| GET | `/api/admin/auth/check` | 检查认证状态 |
| POST | `/api/admin/logout` | 登出（清除 cookie） |
| GET | `/api/admin/blogs` | 获取所有博客（含草稿） |
| POST | `/api/admin/blogs` | 创建博客 |
| PUT | `/api/admin/blogs/:slug` | 更新博客 |
| PUT | `/api/admin/blogs/:slug?action=publish` | 发布博客 |
| PUT | `/api/admin/blogs/:slug?action=unpublish` | 取消发布 |
| DELETE | `/api/admin/blogs/:slug` | 删除博客 |

**认证方式：** 登录成功后返回 token，客户端存入 `localStorage`，后续请求通过 `Authorization: Bearer <token>` header 发送。同时兼容 cookie 认证。

## 管理后台

- 地址：`/admin/login`
- 默认密码：`admin123`
- 功能：
  - 登录/登出
  - 创建/编辑/删除博客
  - 草稿/发布状态管理
  - 分类/标签管理
  - Markdown 实时预览（split-pane 编辑/预览）
  - 标题字数限制（100 字符）防 ENAMETOOLONG

## 数据模型

### 博客（Blog）

```typescript
interface Blog {
  slug: string;            // URL slug（kebab-case）
  title: string;           // 标题（最长 100 字符）
  category: string;        // 分类
  tags: string[];          // 标签
  content: string;         // Markdown 正文
  status: "draft" | "published"; // 状态
  date: string;            // 日期
  author: string;          // 作者
  summary: string;         // 摘要
  readingTime: number;     // 阅读时间（分钟）
}
```

### 存储方式

- 文章内容以 MDX 文件存储在 `src/content/` 目录
- 分类列表存储在 `content/.categories.json`
- 无数据库，文件系统即存储

## 核心流程

### 博客发布流程

```
1. 登录后台 → /admin/login
2. 点击新建文章 → /admin/editor
3. 填写标题、分类、标签、摘要、正文
4. 点击"保存草稿" → status=draft
5. 点击"发布" → status=published
6. 前台首页自动显示
```

### 搜索功能

首页集成 FlexSearch，支持按标题搜索文章。

### 评论系统

文章详情页集成 Giscus，评论存储在 GitHub Discussions 中，支持 reactions，语言为中文。

## 测试

```bash
# 运行 lint
npm run lint
```

## 常见问题

### 中文标题文章 404

Next.js Turbopack 对中文路由有兼容性问题，中文标题生成的 slug 可能导致页面访问 404。建议标题使用英文或使用拼音。

### 登录 Cookie 跨域问题

`localhost` 和 `127.0.0.1` 被视为不同源。解决方案：登录 token 存入 `localStorage`，通过 `Authorization: Bearer` header 传递，不受同源策略限制。

### Giscus 评论不显示

1. 确认 GitHub Discussions 已启用
2. 检查 `.env.local` 中的 `NEXT_PUBLIC_GISCUS_REPO_ID` 和 `NEXT_PUBLIC_GISCUS_CATEGORY_ID` 是否正确
3. 访问 https://giscus.app 重新获取配置

## 项目协作

- 多 Agent 协作模式：前端爪（前端）、后端爪（后端）、测试爪（测试）、产品爪（产品）、人事爪（HR）
- 项目群：项目群（oc_9855d70c297a007c65f695c1d79f9cea）
- 各 Agent 严格遵守 `@` 人规范，必须使用富文本 post + at tag
