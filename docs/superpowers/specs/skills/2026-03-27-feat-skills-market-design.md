# Skills 市场前端设计

## 相关文档

- 后端：`qiaoya-community-backend/docs/superpowers/specs/skills/2026-03-27-feat-skills-market-design.md`

## 背景

社区需要新增一个对游客可见的 Skills 市场，同时在欢迎页和登录后首页的导航栏提供入口。欢迎页点击后在新标签页打开公开市场，登录后首页点击后在当前页进入登录态市场。用户中心需要新增「我的 Skills」管理，支持新增、编辑、删除、查看自己的 Skills。

## 范围

本次前端范围只覆盖以下能力：

- 欢迎页导航新增 `Skills` tab，并在新标签页打开 `/skills`
- 登录后顶部导航新增 `Skills` tab，并在当前页进入 `/dashboard/skills`
- 新增公开市场页与登录态市场页
- 新增 Skills 详情弹窗
- 顶部「发布」菜单新增 `发布 Skills`
- 用户中心新增 Skills 列表、新增页、编辑页

本次不做以下内容：

- 技能审核流
- 草稿/发布状态
- 技能分类、标签、搜索、收藏、点赞
- 技能独立详情路由

## 路由设计

### 公开路由

- `/skills`
  - 使用营销页风格布局
  - 允许未登录访问
  - 显示收录数和 Skills 列表

### 登录后路由

- `/dashboard/skills`
  - 使用 `AppLayout`
  - 与 `/skills` 复用市场主体组件
  - 当前标签页内切换

### 用户中心路由

- `/dashboard/user-backend/skills`
  - 我的 Skills 列表
- `/dashboard/user-backend/skills/create`
  - 创建 Skills
- `/dashboard/user-backend/skills/edit/:id`
  - 编辑 Skills

## 导航与入口设计

### 欢迎页 Header

现有 [`src/shared/components/common/Header.tsx`](../../../../../src/shared/components/common/Header.tsx) 导航项只有锚点跳转能力，需要扩展为同时支持：

- `href`：页面内锚点
- `onClick`：自定义交互

Skills 导航项使用 `onClick`，执行 `window.open('/skills', '_blank', 'noopener,noreferrer')`。

### 登录后 TopNavigation

现有 [`src/shared/components/ui/TopNavigation.tsx`](../../../../../src/shared/components/ui/TopNavigation.tsx) 使用配置数组渲染主导航。新增一项：

- `id: 'skills'`
- `name: 'Skills'`
- `path: '/dashboard/skills'`

该项不接入 `MENU_CODE`，原因如下：

- Skills 市场对游客公开可见
- 登录后导航也应对所有登录用户可见
- [`src/shared/routes/MenuGuard.tsx`](../../../../../src/shared/routes/MenuGuard.tsx) 对无菜单码路由默认放行

### 发布入口

现有顶部「发布」菜单已有文章与题目入口，需要新增：

- 桌面端：`发布 Skills`
- 移动端：`发布 Skills`

点击后跳转到 `/dashboard/user-backend/skills/create`。

## 页面设计

### 市场页主体

市场页主体拆成可复用组件，例如：

- `SkillsMarketPage`
- `SkillsMarketStats`
- `SkillsCardList`
- `SkillCard`
- `SkillDetailDialog`

页面展示结构：

1. 页面标题区
2. 收录数统计卡
3. Skills 卡片网格
4. 分页区

### 卡片展示

每张卡片仅展示：

- 名称
- 简介
- GitHub 图标按钮

交互约定：

- 点击卡片主体：打开详情弹窗
- 点击 GitHub 图标按钮：阻止冒泡，新标签页打开 GitHub URL

### 详情弹窗

详情弹窗展示：

- 名称
- 简介
- GitHub 按钮
- Markdown 描述

描述渲染使用 [`src/shared/components/ui/SharedMarkdownRenderer.tsx`](../../../../../src/shared/components/ui/SharedMarkdownRenderer.tsx)，不使用编辑器的只读模式，避免引入多余工具栏和重量级实例。

详情内容进入弹窗时再请求详情接口，不在列表接口内携带完整 Markdown。

### 用户中心列表

用户中心页面保持与现有「我的题库」和「我的文章」一致的管理风格，列表列建议为：

- 名称
- 简介
- GitHub URL
- 创建时间
- 更新时间
- 操作

操作按钮：

- 查看：打开详情弹窗
- 编辑：进入编辑页
- 删除：使用确认弹窗后删除

### 创建与编辑页

表单字段只保留四个业务字段：

- 名称
- 简介
- 描述（Markdown）
- GitHub URL

描述字段使用 [`src/shared/components/ui/MarkdownEditor.tsx`](../../../../../src/shared/components/ui/MarkdownEditor.tsx)。

本地校验：

- 名称必填
- 简介必填
- 描述必填
- GitHub URL 必填且格式合法

提交成功消息依赖后端返回 `message`，组件层不重复弹成功提示。

## 前端数据模型与服务

新增 `SkillDTO`、`CreateSkillRequest`、`UpdateSkillRequest`、`SkillQueryRequest` 等类型，风格与现有 `InterviewQuestionDTO` 和 `PageResponse<T>` 保持一致。

新增 `skills.service.ts`，至少包含：

- `getPublicSkills`
- `getPublicSkillById`
- `getMySkills`
- `getMySkillById`
- `createSkill`
- `updateSkill`
- `deleteSkill`

## 错误处理

- Axios 请求失败统一交给全局拦截器处理
- 组件层只保留本地校验提示
- 删除使用现有确认对话框，失败时只记录日志，不重复弹错误 toast

## 验证方案

- `npm run build`
- `npm run lint`
- 手工验证欢迎页导航、登录后导航、市场列表、详情弹窗、发布入口、用户中心增删改查

## 风险与取舍

- 欢迎页 Header 需要从纯锚点导航升级为混合交互导航，改动点集中但影响公共入口，需要注意不要破坏现有锚点跳转
- `TopNavigation` 新增无菜单码路由时，要确保高亮逻辑与移动端菜单同步生效
- 详情弹窗按需拉取可以减少列表负载，但需要处理加载态与重复点击态
