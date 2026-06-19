# 博客系统

基于 Next.js 16 + TypeScript + MDX 的个人博客系统。

## 技术栈

- **框架：** Next.js 16.2.9 (App Router)
- **语言：** TypeScript
- **样式：** Tailwind CSS 4
- **内容：** MDX 文件驱动
- **主题切换：** next-themes (深色/浅色模式)
- **Markdown 渲染：** remark + rehype 插件链
- **代码高亮：** rehype-highlight

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
│   │   ├── (site)/           # 前台页面（首页、文章详情页、关于页等）
│   │   ├── admin/            # 后台管理页面
│   │   │   ├── login/        # 登录页
│   │   │   └── editor/       # 博客编辑器
│   │   └── api/              # API 接口
│   │       ├── admin/        # 后台 API
│   │       │   ├── auth/     # 登录/登出认证
│   │       │   └── blogs/    # 博客 CRUD
│   │       └── blogs/        # 前台 API
│   │           └── [slug]/   # 单篇文章 API
│   ├── components/           # React 组件
│   ├── lib/                  # 工具函数
│   │   ├── mdx.ts            # MDX 解析、博客 CRUD 逻辑
│   │   └── admin-auth.ts     # 管理员认证
│   └── types/                # TypeScript 类型定义
├── next.config.mjs           # Next.js 配置
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

访问 http://localhost:3000

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

访问 http://localhost:3000

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

创建 `.env.local` 文件：

```bash
ADMIN_PASSWORD=your_secure_password
```

## API 接口

### 前台 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/blogs` | 获取博客列表（默认只返回 published） |
| GET | `/api/blogs/:slug` | 获取单篇详情 |
| PUT | `/api/blogs/:slug` | 更新博客 |
| DELETE | `/api/blogs/:slug` | 删除博客 |

查询参数：`page`, `pageSize`, `category`, `tag`, `status`

### 后台 API（需认证）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/admin/auth` | 登录认证 |
| GET | `/api/admin/auth/check` | 检查认证状态 |
| POST | `/api/admin/logout` | 登出 |
| GET | `/api/admin/blogs` | 获取所有博客（含草稿） |
| POST | `/api/admin/blogs` | 创建博客 |
| GET | `/api/admin/blogs/:slug` | 获取单篇详情 |
| PUT | `/api/admin/blogs/:slug` | 更新博客 |
| PUT | `/api/admin/blogs/:slug?action=publish` | 发布博客 |
| PUT | `/api/admin/blogs/:slug?action=unpublish` | 取消发布 |
| DELETE | `/api/admin/blogs/:slug` | 删除博客 |

认证方式：登录成功后返回 token，客户端存入 `admin_token` cookie，后续请求通过 cookie 验证。

## 管理后台

- 地址：`/admin/login`
- 默认密码：`admin123`
- 功能：
  - 登录/登出
  - 创建/编辑/删除博客
  - 草稿/发布状态管理
  - 分类/标签管理
  - Markdown 实时预览

## 数据模型

### 博客（Blog）

```typescript
interface Blog {
  slug: string;            // URL slug（kebab-case）
  title: string;           // 标题
  category: string;        // 分类
  tags: string[];          // 标签（逗号分隔）
  content: string;         // Markdown 正文
  status: "draft" | "published"; // 状态
  date: string;            // 日期
  author: string;          // 作者
  summary: string;         // 摘要
  readingTime: number;     // 阅读时间（分钟）
}
```

### 存储方式

- 文章内容以 MDX 文件存储在 `content/` 目录
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

### 草稿箱

- 侧边栏新增 Tab 切换：全部 / 草稿 / 已发布
- 每个 Tab 显示对应数量
- 点击可快速筛选查看

## 测试

```bash
# 运行 lint
npm run lint
```

## 常见问题

### 中文标题文章 404

Next.js 16.2.9 + Turbopack 对中文路由有兼容性问题，中文标题生成的 slug 可能导致页面访问 404。

### giscus 评论组件

如需启用评论功能：
1. 在 GitHub 仓库 Settings → Discussions 启用 Discussions
2. 访问 https://giscus.app 配置并获取 repo-id 和 category-id
3. 在代码中配置

## 项目协作

- 多 Agent 协作模式：前端爪（前端）、后端爪（后端）、测试爪（测试）、产品爪（产品）、人事爪（HR）
- 项目群：项目群（oc_9855d70c297a007c65f695c1d79f9cea）
- 各 Agent 严格遵守 `@` 人规范，必须使用富文本 post + at tag
