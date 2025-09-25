# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 React + TypeScript + Vite 的现代化社区平台前端应用，采用模块化的多应用架构设计。

## 常用开发命令

```bash
# 安装依赖
npm install

# 开发服务器（端口：5173）
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint

# TypeScript 类型检查
npx tsc --noEmit
```

## 项目架构

### 多应用架构设计
项目采用多应用架构，主要分为以下几个应用模块：

- **@marketing** - 营销首页（公开路由）
- **@user-portal** - 用户门户（Dashboard主要功能）
- **@user-backend** - 用户后台管理
- **@admin-backend** - 管理员后台
- **@shared** - 共享模块（组件、工具、服务等）

### 路径别名配置
- `@/` → `./src/`
- `@shared/` → `./src/shared/`
- `@apps/` → `./src/apps/`
- `@marketing/` → `./src/apps/marketing/`
- `@user-portal/` → `./src/apps/user-portal/`
- `@user-backend/` → `./src/apps/user-backend/`
- `@admin-backend/` → `./src/apps/admin-backend/`

### 核心技术栈
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** + **shadcn/ui** (New York style)
- **React Router v7** - 路由管理
- **Axios** - HTTP 客户端（配置在 @shared/services/api）
- **React Hot Toast** - 消息提示
- **Lucide React** - 图标库
- **Cherry Markdown** - Markdown 编辑器

## 开发指南

### API 配置
- 后端 API 代理：`/api` → `http://127.0.0.1:8520`
- API 客户端配置在：`src/shared/services/api/config.ts`
- 自动处理 JWT token 认证和错误响应

### 路由架构
- 公开路由：`/` (营销页面)
- 用户 Dashboard：`/dashboard/*` (需认证)
- 管理员后台：`/dashboard/admin/*` (需认证)
- 路由配置和工具函数：`src/shared/routes/routes.ts`

### 状态管理
- **AuthContext** - 用户认证状态
- **ThemeContext** - 主题切换
- 本地状态使用 React Hooks

### UI 组件体系
- 基础 UI 组件：`src/shared/components/ui/`
- 业务组件：`src/shared/components/business/`
- 通用组件：`src/shared/components/common/`
- shadcn/ui 配置：`components.json`

### 开发规范
- 使用 ESLint + TypeScript ESLint 进行代码检查
- 遵循 Tailwind CSS 样式开发
- 组件采用函数组件 + Hooks 模式
- TypeScript 严格模式，确保类型安全

### 特殊功能
- **MarkdownEditor** - 支持实时预览的 Markdown 编辑器
- **SubscribeButton** - 统一的订阅/关注按钮组件
- **Comments** - 通用评论系统，支持业务类型区分
- **ImageUpload** - 图片上传组件
- **Transfer** - 数据穿梭框组件

### 构建和部署
- 构建输出目录：`dist/`
- 静态资源：`public/`
- 生产构建会自动优化和压缩资源
- 1. 项目中已存在响应统一拦截器，获取 message 触发 toast，不需要再请求后再写 toast  2.弹出层都需要禁用 esc 关闭弹出层，防抖
