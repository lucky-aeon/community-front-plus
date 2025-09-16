# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目架构

这是一个使用 React 18 + TypeScript + Vite 构建的敲鸭社区前端应用，采用模块化多应用架构设计。

### 应用模块结构
- **营销页面** (`@marketing`) - 公开展示页面，包含首页、产品介绍等
- **用户门户** (`@user-portal`) - 登录后的用户主要功能区域
- **用户后台** (`@user-backend`) - 个人内容管理区域
- **管理员后台** (`@admin-backend`) - 系统管理功能

### 路由架构
使用 React Router v7 进行路由管理：
- `/` - 营销首页（公开路由）
- `/dashboard/*` - 用户门户（受保护路由）
- `/dashboard/admin/*` - 管理员后台（受保护路由）

### 共享资源结构
所有共享组件和服务位于 `src/shared/` 目录：
- `components/` - UI组件、业务组件、通用组件
- `services/api/` - API 服务层
- `types/` - TypeScript 类型定义
- `routes/` - 路由相关组件和配置
- `context/` - 认证和主题上下文

## 常用命令

### 开发环境
```bash
# 安装依赖
npm install

# 启动开发服务器 (localhost:5173)
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint
```

### API 代理
开发服务器配置了 API 代理，所有 `/api/*` 请求会被代理到 `http://127.0.0.1:8080`

## 技术栈核心依赖

- **React 18** + **TypeScript** - 核心框架
- **Vite** - 构建工具和开发服务器
- **React Router DOM v7** - 路由管理
- **Tailwind CSS** - 样式框架
- **Lucide React** - 图标库
- **Axios** - HTTP 客户端
- **React Hot Toast** - 通知组件
- **Cherry Markdown** - Markdown 编辑器

## 路径别名配置

```typescript
'@' -> './src'
'@shared' -> './src/shared'
'@apps' -> './src/apps'
'@marketing' -> './src/apps/marketing'
'@user-portal' -> './src/apps/user-portal'
'@user-backend' -> './src/apps/user-backend'
'@admin-backend' -> './src/apps/admin-backend'
```

## 状态管理

- **认证状态** - `AuthContext` 管理用户登录状态和认证操作
- **主题状态** - `ThemeContext` 管理深色/浅色主题切换
- **本地状态** - 使用 React Hooks (useState, useReducer)

## API 服务架构

所有 API 调用通过 `src/shared/services/api/` 下的服务模块处理：
- `auth.service.ts` - 用户认证
- `posts.service.ts` - 文章/帖子管理
- `courses.service.ts` - 课程管理
- `comments.service.ts` - 评论系统
- `categories.service.ts` - 分类管理
- `upload.service.ts` - 文件上传

## 开发注意事项

### 组件开发规范
- 使用函数组件 + React Hooks
- 严格遵循 TypeScript 类型安全
- UI 样式使用 Tailwind CSS 类名
- 可复用组件放在 `@shared/components/ui/`
- 业务组件放在 `@shared/components/business/`

### 路由保护
- 使用 `ProtectedRoute` 保护需要登录的路由
- 使用 `PublicOnlyRoute` 限制已登录用户访问公开页面

### 代码质量
- ESLint 配置自动检查代码质量
- TypeScript 严格模式启用
- 提交前运行 `npm run lint` 检查代码