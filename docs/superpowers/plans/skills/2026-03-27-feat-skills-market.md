# Skills 市场前端 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为欢迎页、登录后首页和用户中心接入 Skills 市场与 Skills 自管理能力。

**Architecture:** 在现有 React Router 结构上新增 `/skills`、`/dashboard/skills` 和用户中心 `skills` 路由；公开页与登录态页复用一套市场主体组件，用户中心复用详情弹窗和编辑表单；数据由新增的 `skills.service.ts` 统一访问公开接口和用户接口。

**Tech Stack:** React, TypeScript, Vite, React Router, shadcn/ui, Axios API client, Cherry Markdown Editor, SharedMarkdownRenderer

## Related docs

- Spec: `docs/superpowers/specs/skills/2026-03-27-feat-skills-market-design.md`
- Backend plan: `../../../../../qiaoya-community-backend/docs/superpowers/plans/skills/2026-03-27-feat-skills-market.md`

---

### Task 1: 路由、类型与 API 服务

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/apps/user-portal/components/Dashboard.tsx`
- Modify: `src/shared/routes/routes.ts`
- Modify: `src/shared/types/index.ts`
- Create: `src/shared/services/api/skills.service.ts`
- Modify: `src/shared/services/api/index.ts`

- [ ] **Step 1: 为 Skills 定义共享类型**

```ts
export interface SkillDTO {
  id: string;
  userId?: string;
  name: string;
  summary: string;
  description?: string;
  githubUrl: string;
  createTime?: string;
  updateTime?: string;
}

export interface SkillQueryRequest {
  pageNum?: number;
  pageSize?: number;
}

export interface CreateSkillRequest {
  name: string;
  summary: string;
  description: string;
  githubUrl: string;
}

export interface UpdateSkillRequest extends CreateSkillRequest {}
```

- [ ] **Step 2: 新增 Skills API 服务**

```ts
export class SkillsService {
  static async getPublicSkills(params: SkillQueryRequest = {}): Promise<PageResponse<SkillDTO>> {
    const response = await apiClient.get<ApiResponse<PageResponse<SkillDTO>>>('/public/skills', { params });
    return response.data.data;
  }

  static async getPublicSkillById(id: string): Promise<SkillDTO> {
    const response = await apiClient.get<ApiResponse<SkillDTO>>(`/public/skills/${id}`);
    return response.data.data;
  }

  static async getMySkills(params: SkillQueryRequest = {}): Promise<PageResponse<SkillDTO>> {
    const response = await apiClient.get<ApiResponse<PageResponse<SkillDTO>>>('/user/skills', { params });
    return response.data.data;
  }
}
```

- [ ] **Step 3: 注册新路由常量**

```ts
export const ROUTES = {
  SKILLS_PUBLIC: '/skills',
  DASHBOARD_SKILLS: '/dashboard/skills',
  USER_BACKEND_SKILLS: '/dashboard/user-backend/skills',
  USER_BACKEND_SKILLS_CREATE: '/dashboard/user-backend/skills/create',
  USER_BACKEND_SKILLS_EDIT: '/dashboard/user-backend/skills/edit/:id',
} as const;
```

- [ ] **Step 4: 将 Skills 页面接入顶层路由**

```tsx
// App.tsx
<Route path="/skills" element={<SkillsPublicPage />} />

// Dashboard.tsx
<Route path="/skills" element={<SkillsDashboardPage />} />
```

- [ ] **Step 5: 运行前端静态检查，确保新类型和路由没有破坏编译**

Run: `npm run lint`
Expected: no new lint errors in `skills` related files

- [ ] **Step 6: 提交本任务**

```bash
git add src/App.tsx src/apps/user-portal/components/Dashboard.tsx src/shared/routes/routes.ts src/shared/types/index.ts src/shared/services/api/skills.service.ts src/shared/services/api/index.ts
git commit -m "feat(skills): 添加前端 skills 路由与服务" -m "- 新增 skills 类型与 API 服务\n- 接入公开页与登录态路由常量"
```

### Task 2: 市场页、详情弹窗与导航入口

**Files:**
- Modify: `src/shared/components/common/Header.tsx`
- Modify: `src/shared/components/ui/TopNavigation.tsx`
- Create: `src/apps/skills/components/SkillsMarketPage.tsx`
- Create: `src/apps/skills/components/SkillCard.tsx`
- Create: `src/apps/skills/components/SkillDetailDialog.tsx`
- Create: `src/apps/skills/components/SkillsPublicPage.tsx`
- Create: `src/apps/skills/components/SkillsDashboardPage.tsx`

- [ ] **Step 1: 抽出可复用的市场主体组件**

```tsx
export const SkillsMarketPage: React.FC<{
  mode: 'public' | 'dashboard';
}> = ({ mode }) => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PageResponse<SkillDTO> | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
};
```

- [ ] **Step 2: 实现卡片与详情弹窗**

```tsx
<button type="button" onClick={() => setActiveId(skill.id)}>
  <div>{skill.name}</div>
  <div>{skill.summary}</div>
  <Button
    variant="ghost"
    size="icon"
    onClick={(e) => {
      e.stopPropagation();
      window.open(skill.githubUrl, '_blank', 'noopener,noreferrer');
    }}
  >
    <Github className="h-4 w-4" />
  </Button>
</button>
```

- [ ] **Step 3: 在欢迎页 Header 接入新标签打开 Skills**

```ts
const navItems = [
  { label: '课程', href: '#courses' },
  { label: 'Skills', onClick: () => window.open('/skills', '_blank', 'noopener,noreferrer') },
];
```

- [ ] **Step 4: 在 TopNavigation 接入 `/dashboard/skills` 与发布入口**

```tsx
{
  id: 'skills',
  name: 'Skills',
  path: '/dashboard/skills',
  icon: Sparkles,
  description: '社区技能市场',
}

<DropdownMenuItem className="cursor-pointer" onClick={goCreateSkill}>
  发布 Skills
</DropdownMenuItem>
```

- [ ] **Step 5: 运行构建验证页面组件和导航改动**

Run: `npm run build`
Expected: Vite build succeeds and outputs `dist/`

- [ ] **Step 6: 提交本任务**

```bash
git add src/shared/components/common/Header.tsx src/shared/components/ui/TopNavigation.tsx src/apps/skills/components/SkillsMarketPage.tsx src/apps/skills/components/SkillCard.tsx src/apps/skills/components/SkillDetailDialog.tsx src/apps/skills/components/SkillsPublicPage.tsx src/apps/skills/components/SkillsDashboardPage.tsx
git commit -m "feat(skills): 添加 skills 市场页面与导航入口" -m "- 新增公开页和登录态市场页面\n- 接入欢迎页导航和顶部发布入口"
```

### Task 3: 用户中心 Skills 管理

**Files:**
- Modify: `src/apps/user-backend/components/UserBackend.tsx`
- Modify: `src/apps/user-backend/components/UserBackendLayout.tsx`
- Create: `src/apps/user-backend/components/MySkillsPage.tsx`
- Create: `src/apps/user-backend/components/SkillEditorPage.tsx`
- Create: `src/apps/user-backend/components/CreateSkillPage.tsx`
- Create: `src/apps/user-backend/components/EditSkillPage.tsx`

- [ ] **Step 1: 在用户中心左侧导航和路由中注册 Skills 管理**

```tsx
{ id: 'skills', name: '我的 Skills', icon: Sparkles, path: '/dashboard/user-backend/skills' }

<Route path="/skills" element={<MySkillsPage />} />
<Route path="/skills/create" element={<CreateSkillPage />} />
<Route path="/skills/edit/:id" element={<EditSkillPage />} />
```

- [ ] **Step 2: 实现我的 Skills 列表**

```tsx
<TableRow key={skill.id}>
  <TableCell>{skill.name}</TableCell>
  <TableCell>{skill.summary}</TableCell>
  <TableCell>{skill.githubUrl}</TableCell>
  <TableCell className="text-right">
    <Button onClick={() => setViewId(skill.id)}>查看</Button>
    <Button variant="outline" onClick={() => navigate(`/dashboard/user-backend/skills/edit/${skill.id}`)}>编辑</Button>
    <Button variant="outline" onClick={() => setDeleteConfirm(skill.id)}>删除</Button>
  </TableCell>
</TableRow>
```

- [ ] **Step 3: 实现创建/编辑表单页**

```tsx
<Input value={name} onChange={(e) => setName(e.target.value)} placeholder="请输入 skills 名称" />
<Input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="请输入简介" />
<MarkdownEditor value={description} onChange={setDescription} placeholder="请输入描述，支持 Markdown" />
<Input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/owner/repo" />
```

- [ ] **Step 4: 运行 lint 和 build 做最终前端校验**

Run: `npm run lint && npm run build`
Expected: both commands succeed

- [ ] **Step 5: 提交本任务**

```bash
git add src/apps/user-backend/components/UserBackend.tsx src/apps/user-backend/components/UserBackendLayout.tsx src/apps/user-backend/components/MySkillsPage.tsx src/apps/user-backend/components/SkillEditorPage.tsx src/apps/user-backend/components/CreateSkillPage.tsx src/apps/user-backend/components/EditSkillPage.tsx
git commit -m "feat(skills): 添加用户中心 skills 管理" -m "- 新增我的 skills 列表与编辑页\n- 接入查看编辑删除与发布 skills"
```
