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
- `admin-user.service.ts` - 管理员用户管理

## 开发注意事项

### 组件开发规范
- 使用函数组件 + React Hooks
- 严格遵循 TypeScript 类型安全
- UI 样式使用 Tailwind CSS 类名
- 可复用组件放在 `@shared/components/ui/`
- 业务组件放在 `@shared/components/business/`

### UI组件使用规范
**重要原则：始终优先使用项目统一的UI组件，避免使用原生HTML元素**

#### 为什么要使用统一UI组件？
- **视觉一致性**：确保整个应用的界面风格统一
- **用户体验**：提供一致的交互行为和视觉反馈
- **主题支持**：支持深色/浅色主题自动切换
- **可维护性**：集中管理样式和行为，便于后续维护和升级
- **可访问性**：内置无障碍访问支持
- **代码质量**：减少重复代码，提高开发效率

#### 原生HTML元素 → UI组件映射表

| 原生HTML元素 | 项目UI组件 | 导入路径 | 主要特性 |
|-------------|------------|----------|---------|
| `<button>` | `Button` | `@shared/components/ui/Button` | 多种样式变体、加载状态、图标支持 |
| `<input>` | `Input` | `@shared/components/ui/Input` | 图标支持、错误提示、标签集成 |
| `<select>` | `Select` | `@shared/components/ui/Select` | 自定义下拉样式、搜索功能、键盘导航 |
| `<textarea>` | `Textarea` | `@shared/components/ui/Textarea` | 自动高度调整、字符计数 |
| `confirm()` | `ConfirmDialog` | `@shared/components/ui/ConfirmDialog` | 自定义样式、图标、动画效果 |
| 状态文本显示 | `Badge` | `@shared/components/ui/Badge` | 多种颜色变体、尺寸选项 |
| `<div className="card">` | `Card` | `@shared/components/ui/Card` | 统一卡片样式、阴影效果 |
| 加载提示 | `LoadingSpinner` | `@shared/components/ui/LoadingSpinner` | 多种尺寸、统一动画 |
| 文件上传 | `ImageUpload` | `@shared/components/ui/ImageUpload` | 拖拽上传、预览、进度显示 |
| 标签输入 | `TagInput` | `@shared/components/ui/TagInput` | 标签管理、验证 |
| 弹窗对话框 | `PortalModal` | `@shared/components/ui/PortalModal` | Portal渲染、遮罩层、动画 |

#### 常见错误示例 vs 正确示例

**❌ 错误：使用原生HTML元素**
```tsx
// 不要这样做
<button 
  className="px-4 py-2 bg-blue-500 text-white rounded" 
  onClick={handleClick}
>
  保存
</button>

<input 
  type="text" 
  className="border border-gray-300 rounded px-3 py-2"
  placeholder="请输入用户名"
/>

<select className="border border-gray-300 rounded px-3 py-2">
  <option value="">请选择</option>
  <option value="active">激活</option>
</select>

{user.isActive ? '激活' : '禁用'}

{confirm('确定要删除吗？') && deleteItem()}
```

**✅ 正确：使用项目UI组件**
```tsx
// 应该这样做
import { Button } from '@shared/components/ui/Button';
import { Input } from '@shared/components/ui/Input';
import { Select } from '@shared/components/ui/Select';
import { Badge } from '@shared/components/ui/Badge';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';

<Button 
  variant="primary" 
  onClick={handleClick}
>
  保存
</Button>

<Input 
  placeholder="请输入用户名"
  label="用户名"
/>

<Select
  options={statusOptions}
  value={selectedStatus}
  onChange={setSelectedStatus}
  placeholder="请选择状态"
/>

<Badge variant={user.isActive ? 'success' : 'secondary'}>
  {user.isActive ? '激活' : '禁用'}
</Badge>

<ConfirmDialog
  isOpen={showDialog}
  title="确认删除"
  message="确定要删除这个项目吗？此操作不可撤销。"
  onConfirm={handleDelete}
  onCancel={() => setShowDialog(false)}
  variant="danger"
/>
```

#### 代码审查检查清单

开发和代码审查时，请检查以下要点：

**必须检查项：**
- [ ] 是否使用了原生 `<button>` 而不是 `Button` 组件？
- [ ] 是否使用了原生 `<input>` 而不是 `Input` 组件？
- [ ] 是否使用了原生 `<select>` 而不是 `Select` 组件？
- [ ] 是否使用了原生 `confirm()` 而不是 `ConfirmDialog` 组件？
- [ ] 状态显示是否使用了 `Badge` 组件而不是普通文本？
- [ ] 是否正确导入了所需的UI组件？

**推荐检查项：**
- [ ] 组件的 variant 和 size 属性是否合理？
- [ ] 是否充分利用了组件的特性（如图标、加载状态等）？
- [ ] 交互逻辑是否符合用户体验最佳实践？
- [ ] 是否考虑了可访问性和键盘导航？

#### 特殊情况说明

**何时可以考虑使用原生HTML元素：**
- 项目UI组件库中确实没有对应的组件
- 需要非常特殊的样式定制，且UI组件无法满足
- 性能关键场景下，原生元素更合适

**在这些情况下，仍建议：**
- 优先考虑扩展现有UI组件
- 如必须使用原生元素，保持样式与项目整体风格一致
- 在代码注释中说明使用原生元素的原因

### 路由保护
- 使用 `ProtectedRoute` 保护需要登录的路由
- 使用 `PublicOnlyRoute` 限制已登录用户访问公开页面

### Toast/通知处理规范

**重要原则：理解并正确使用项目的统一通知系统**

#### 项目通知架构

项目使用 **React Hot Toast** 配合 **Axios 响应拦截器** 实现统一的通知处理：

1. **响应拦截器自动处理** (`src/shared/services/api/config.ts:32-88`)
   - 成功响应：如果 `response.data.message` 存在且非空，自动显示成功提示
   - 错误响应：根据状态码自动显示相应的错误提示
   - 所有 API 调用都会经过这个统一处理

2. **手动 Toast 调用**
   - 仅在特殊场景下使用，如客户端验证错误、非 API 操作提示等

#### ✅ 正确使用方式

**当后端返回 message 时，信任响应拦截器：**
```tsx
// ✅ 正确：让响应拦截器处理成功提示
const handleUpdateData = async () => {
  try {
    const updatedData = await SomeService.updateData(params);
    // 不需要手动调用 toast.success()
    // 响应拦截器会自动处理后端返回的 message
    
    // 只处理业务逻辑
    setData(updatedData);
  } catch (error) {
    console.error('操作失败:', error);
    // 不需要手动调用 toast.error()
    // 响应拦截器已经处理了错误提示
  }
};
```

**仅在特殊情况下手动调用 Toast：**
```tsx
// ✅ 正确：客户端验证错误
if (!email || !isValidEmail(email)) {
  toast.error('请输入有效的邮箱地址');
  return;
}

// ✅ 正确：非 API 操作提示
const handleCopyToClipboard = () => {
  navigator.clipboard.writeText(text);
  toast.success('已复制到剪贴板');
};

// ✅ 正确：特殊业务逻辑提示
if (selectedItems.length === 0) {
  toast.warning('请至少选择一个项目');
  return;
}
```

#### ❌ 常见错误示例

**错误1：重复通知**
```tsx
// ❌ 错误：会产生两个 toast
const handleSave = async () => {
  try {
    await SomeService.save(data);
    toast.success('保存成功'); // 重复了！响应拦截器已经处理
  } catch (error) {
    toast.error('保存失败'); // 重复了！响应拦截器已经处理
  }
};
```

**错误2：忽略后端 message**
```tsx
// ❌ 错误：没有利用后端的具体错误信息
try {
  await SomeService.validate(data);
} catch (error) {
  toast.error('验证失败'); // 太笼统，后端可能返回了具体错误信息
}
```

#### 调试指南

**当遇到通知相关问题时：**

1. **检查响应拦截器配置**
   ```bash
   # 查看拦截器逻辑
   cat src/shared/services/api/config.ts
   ```

2. **检查后端响应结构**
   ```bash
   # 在浏览器开发者工具查看网络请求
   # 确认 response.data.message 的内容
   ```

3. **确认是否重复调用**
   ```tsx
   // 搜索代码中的 toast 调用
   // 确保没有与响应拦截器重复
   ```

4. **常见问题排查**
   - 出现两个相同/相似的通知 → 检查是否手动调用了重复的 toast
   - 通知信息不准确 → 检查后端返回的 message 内容
   - 没有通知显示 → 检查后端是否返回了 message 字段

#### 响应拦截器处理逻辑
```typescript
// 成功响应处理 (src/shared/services/api/config.ts:34-37)
if (response.data?.message && response.data.message.trim() !== '') {
  toast.success(response.data.message);
}

// 错误响应处理 (src/shared/services/api/config.ts:42-77)
// 根据状态码显示相应错误信息
// 400: 显示后端返回的具体错误信息
// 401: 登录已过期，请重新登录
// 403: 权限不足
// 404: 请求的资源未找到
// 500: 服务器错误，请稍后再试
// 其他: 显示后端返回的错误信息或默认信息
```

#### 代码审查检查清单

**Toast 相关检查项：**
- [ ] 是否有重复的 toast 调用（手动 + 响应拦截器）？
- [ ] 手动 toast 调用是否必要（是否应该由响应拦截器处理）？
- [ ] 错误处理是否信任响应拦截器的统一处理？
- [ ] Toast 信息是否准确反映了操作结果？
- [ ] 是否正确导入了 `react-hot-toast`？

**特别注意：**
- 当后端 API 返回 `message` 字段时，优先使用响应拦截器处理
- 避免在 API 成功回调中手动调用 `toast.success()`
- 避免在 API 错误处理中手动调用 `toast.error()`
- 手动 Toast 应该仅用于客户端逻辑、非 API 操作或特殊业务场景

### 代码质量
- ESLint 配置自动检查代码质量
- TypeScript 严格模式启用
- 提交前运行 `npm run lint` 检查代码