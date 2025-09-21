# 方案 B：后端托管菜单与权限（实施计划）

本方案将“菜单定义与授权”下沉到后端，后端按用户权限返回可见/可点的菜单树，前端只负责渲染与路由匹配；接口权限仍由后端强制校验。目标是统一权限来源、降低前端分散配置与跑偏风险。

后端代码目录：/Users/xhy/IdeaProjects/qiaoya-community/qiaoya-community-backend
## 1. 范围与目标
- 后端：存储菜单树；按套餐/用户聚合后返回用户专属导航；提供套餐↔菜单/权限管理接口；对接口做注解化鉴权。
- 前端：移除硬编码菜单，接入“服务端菜单树”；在路由与按钮层面使用权限码进行保护与引导。

## 2. 数据模型（PostgreSQL/Flyway）
- menus（后端托管菜单）
  - id BIGSERIAL PK, parent_id BIGINT NULL, menu_key VARCHAR(64) UNIQUE, title VARCHAR(64), path VARCHAR(128), icon VARCHAR(64), sort INT DEFAULT 0, type VARCHAR(16) DEFAULT 'route', visible BOOLEAN DEFAULT TRUE, permission_code VARCHAR(128) NULL, created_at TIMESTAMP DEFAULT now(), updated_at TIMESTAMP DEFAULT now()
  - 约定：permission_code 默认 `menu:access:<menu_key>`。
- subscription_plan_menus(plan_id CHAR(36), menu_key VARCHAR(64), UNIQUE(plan_id, menu_key))
- subscription_plan_permissions(plan_id CHAR(36), permission_code VARCHAR(128), UNIQUE(plan_id, permission_code))

建议以 `Vxxx__menu_and_permissions.sql` 迁移落库，并附种子数据（见第 7 节）。

## 3. API 设计（后端）
- 鉴权会话：`GET /api/auth/me` 返回用户资料与 entitlements：
  - `permissions: string[]`（含 `api:*` 与 `menu:access:*`）
  - `menuKeys: string[]`（冗余，便于前端快速判断）
- 用户导航：`GET /api/me/navigation`
  - 返回用户可见菜单树（已按权限过滤）：
  ```json
  [{
    "key": "dashboard.courses", "title": "课程", "path": "/dashboard/courses", "icon": "BookOpen", "children": []
  }]
  ```
- 管理端（建议）：
  - `GET/POST/PUT/DELETE /api/admin/menus`（菜单 CRUD）
  - `PUT /api/admin/menus/:id/move`（父子/排序调整）
  - `GET /api/admin/plan-menus/:planId` / `PUT`（全量更新套餐↔菜单）
  - `GET /api/admin/plan-permissions/:planId` / `PUT`（全量更新套餐↔权限码，如 `api:*`）
- 接口鉴权：控制器使用 `@RequirePermissions("api:get:admin.users")`，AOP 在调用前校验，无权返回 403。

## 4. 权益聚合（后端）
- 输入：用户有效订阅（套餐）+（可选）用户直授/剔除补丁。
- 过程：聚合得到 `menuKeys`、`permissions`，并将 `menuKeys` 映射为 `menu:access:<key>` 进入 `permissions`。
- 导航：从 `menus` 表取全量，基于 `menuKeys` 过滤并组装为树返回。

## 5. 前端改造
- AuthContext：扩展 `permissions: string[]`，启动后调用 `/api/auth/me` 初始化。
- NavigationProvider：应用启动时调用 `/api/me/navigation` 渲染菜单；优先使用后端的 `title/icon/path/sort`。
- 路由保护：`<ProtectedRoute requiredPerms={["menu:access:admin.users"]}>…</ProtectedRoute>`；按钮级使用 `usePermission('api:post:…')`。
- 组件建议：
  - `usePermission(codes, mode='any')`
  - `PermissionGate`（未授权时显示升级 CTA）
  - `LockableNavLink`（支持锁定态与弹窗）
- 路由匹配：以服务端下发的 `path` 注册/激活现有路由表；对未知路径提供兜底 404。

## 6. 联调流程（Checklist）
1) 后端执行 Flyway 迁移，插入基础菜单（见第 7 节）。
2) 在后台为“免费/付费”套餐绑定对应菜单与接口权限码。
3) 登录：前端依次调用 `/api/auth/me` 与 `/api/me/navigation`；应仅显示授权菜单。
4) 验证接口鉴权：访问未授权接口，后端 403，前端弹升级引导；升级后刷新 `me` 与导航。

## 7. 初始种子（示例）
- 菜单：
  - `dashboard.home` → `/dashboard`，`icon=Home`
  - `dashboard.courses` → `/dashboard/courses`，`icon=BookOpen`
  - `admin.users` → `/dashboard/admin/users`，`icon=Users`
- 将 `dashboard.*` 绑定到免费套餐，将 `admin.*` 与 `api:get:admin.users` 绑定到高级套餐。

## 8. 迁移与兼容
- M1：保留现有前端路由，实现“服务端菜单树过滤 + 接口强鉴权”。
- M2：前端移除硬编码菜单结构，只保留“路由组件注册表（path→component）”。
- M3：后台上线菜单管理 UI；支持排序/分组/多语言（可加 `menu_i18n` 表）。

## 9. 风险与规约
- 关键约束：`menu_key` 为稳定 ID；重命名需 DB 迁移并同步前端映射。
- 防跑偏：新增只读接口 `GET /api/menus/keys` 用于前端/管理端校验。
- 图标集：`icon` 建议使用一组受控字符串（与前端 icon 名称对齐）。

## 10. 里程碑（建议）
- Week 1：落库与聚合、`/api/auth/me` 扩展、`/api/me/navigation`、接口注解鉴权。
- Week 2：前端接入导航/权限 Hook，改造用户端与管理端主菜单；联调与验收。
- Week 3：上线菜单管理与套餐绑定权限 UI，完善 403 体验与审计。

