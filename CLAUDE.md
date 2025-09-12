# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
```bash
npm run dev      # Start development server (default: http://localhost:5173)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint code quality checks
```

### Dependencies
```bash
npm install      # Install all dependencies
```

## Code Architecture

### Application Structure
This is a React + TypeScript + Vite frontend application for a community learning platform called "巧牙社区" (QiaoYa Community).

### Authentication Flow
- **Dual UI Pattern**: The app renders completely different interfaces based on authentication state
- **Unauthenticated**: Landing page with marketing sections (Hero, Features, Courses, Pricing, Testimonials)
- **Authenticated**: Dashboard with internal navigation (Home, Discussions, Courses, Profile, Create Post)
- **State Management**: Uses React Context (`AuthContext`) with localStorage persistence
- **Mock Authentication**: Currently uses simulated login with mock user data based on email patterns

### Navigation Architecture
- **Landing Page**: Traditional marketing site with sections and CTAs
- **Dashboard**: Tab-based internal navigation using state-driven routing
- **Deep Navigation**: Dashboard handles detail views (PostDetailPage, CourseDetailPage) through local state management
- **No Router**: Uses component state for navigation instead of React Router

### Data Architecture
- **Mock Data**: All data comes from `src/data/mockData.ts`
- **Membership Tiers**: 4-tier system (guest, basic, premium, vip) that controls course access
- **Content Types**: Courses with chapters, Posts (articles/questions), Comments, Users
- **TypeScript**: Full type coverage with interfaces in `src/types/index.ts`

### Component Organization
```
components/
├── auth/           # AuthModal for login/register
├── courses/        # Course display and management
├── dashboard/      # All authenticated user pages
├── home/           # Landing page sections
├── layout/         # Header component
├── pricing/        # Membership plan components
└── ui/             # Reusable UI components (Button, Card, etc.)
```

### Key Dependencies
- **Styling**: Tailwind CSS with custom animations and gradients
- **Icons**: Lucide React
- **State**: React Context (no external state management)
- **Build**: Vite with React plugin

### Development Guidelines
- **Responsive Design**: All components should support mobile-first responsive design
- **Membership Gating**: Course access controlled by user membership tier
- **TypeScript**: Strict typing required for all new code
- **Component Pattern**: Functional components with hooks
- **Styling**: Use Tailwind utility classes, custom animations defined in tailwind.config.js

### Authentication Testing
Use email patterns to test different membership tiers:
- `vip@test.com` → VIP membership
- `premium@test.com` → Premium membership  
- `basic@test.com` → Basic membership
- Other emails → Guest membership

## 前端开发规范

### TypeScript 组件开发模式

#### 基础组件模式 (UI Components)
基础UI组件放在 `src/components/ui/` 目录，遵循以下模式：

```typescript
// 示例：Button.tsx
import React from 'react';
import { cn } from '../../utils/cn';

interface ComponentProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  // 其他自定义属性
}

export const ComponentName: React.FC<ComponentProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ...props
}) => {
  const baseClasses = 'base-tailwind-classes';
  const variants = {
    primary: 'variant-specific-classes',
    secondary: 'variant-specific-classes'
  };
  const sizes = {
    sm: 'size-specific-classes',
    md: 'size-specific-classes'
  };

  return (
    <element
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </element>
  );
};
```

#### 业务组件模式 (Feature Components)
业务组件包含业务逻辑，遵循以下模式：

```typescript
// 示例：CourseCard.tsx
import React from 'react';
import { Icon1, Icon2 } from 'lucide-react';
import { DataType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../ui/Card';

interface ComponentProps {
  data: DataType;
  onAction?: () => void;
}

export const ComponentName: React.FC<ComponentProps> = ({ data, onAction }) => {
  const { user } = useAuth();

  // 业务逻辑函数
  const businessLogic = () => {
    // 实现逻辑
  };

  return (
    <Card hover className="overflow-hidden">
      {/* 组件内容 */}
    </Card>
  );
};
```

#### 页面组件模式 (Page Components)
页面组件放在 `src/components/dashboard/` 或相应目录：

```typescript
import React, { useState } from 'react';
import { ComponentImports } from '../ui/ComponentName';

export const PageName: React.FC = () => {
  const [state, setState] = useState(initialValue);

  const handleAction = () => {
    // 处理逻辑
  };

  return (
    <div className="page-container-classes">
      {/* 页面内容 */}
    </div>
  );
};
```

### Tailwind CSS 样式规范

#### 样式组织原则
1. **响应式优先**：使用 `sm:`, `md:`, `lg:` 前缀
2. **状态变体**：使用 `hover:`, `focus:`, `active:` 前缀
3. **条件样式**：使用 `cn()` 函数组合条件样式

#### 常用样式模式
```typescript
// 卡片容器
'bg-white rounded-2xl shadow-lg border border-gray-100'

// 按钮基础样式
'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200'

// 渐变背景
'bg-gradient-to-r from-blue-600 to-purple-600'

// 悬停效果
'hover:shadow-xl hover:-translate-y-1 transition-all duration-300'

// 响应式网格
'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'

// 文本截断
'line-clamp-2' // 两行截断
'line-clamp-3' // 三行截断
```

### 文件命名和组织规范

#### 文件命名
- 组件文件：`PascalCase.tsx` (如 `CourseCard.tsx`)
- 工具函数：`camelCase.ts` (如 `cn.ts`)
- 类型定义：`index.ts` (在 types 目录下)
- 数据文件：`camelCase.ts` (如 `mockData.ts`)

#### 目录组织
```
src/
├── components/
│   ├── ui/           # 基础UI组件 (Button, Card, Input 等)
│   ├── auth/         # 认证相关组件
│   ├── dashboard/    # 仪表盘页面组件
│   ├── courses/      # 课程相关组件
│   ├── home/         # 首页组件
│   └── layout/       # 布局组件
├── context/          # React Context
├── data/             # 模拟数据
├── types/            # TypeScript 类型定义
└── utils/            # 工具函数
```

### Props 接口设计规范

#### 基础组件 Props
```typescript
interface BaseComponentProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'option1' | 'option2';
  size?: 'sm' | 'md' | 'lg';
}
```

#### 业务组件 Props
```typescript
interface BusinessComponentProps {
  data: RequiredDataType;
  onAction?: () => void;
  onSecondaryAction?: (id: string) => void;
  disabled?: boolean;
  loading?: boolean;
}
```

#### 页面组件 Props
```typescript
interface PageComponentProps {
  onNavigate?: (page: string) => void;
  onItemClick?: (itemId: string) => void;
  onBack?: () => void;
}
```

## AI 协作指南

### 标准化提示词模板

#### 创建新组件
```
请创建一个 [组件名] 组件，位于 src/components/[目录]/[组件名].tsx

要求：
- 使用 TypeScript
- 遵循项目的组件模式 (参考 [参考组件])
- 使用 Tailwind CSS 样式
- 支持 [具体功能需求]
- Props 接口包含：[列出必需的 props]

参考现有组件的样式和结构。
```

#### 修改现有组件
```
请修改 src/components/[路径]/[组件名].tsx 组件

需要修改的内容：
- [具体修改需求1]
- [具体修改需求2]

保持现有的：
- 组件结构和样式风格
- Props 接口兼容性
- TypeScript 类型安全
```

#### 添加新功能
```
请在 [组件/页面] 中添加 [功能名称] 功能

功能要求：
- [详细功能描述]
- 数据来源：[mockData/context/props]
- 用户交互：[点击/输入/选择等]
- 权限控制：[如果涉及会员等级]

遵循项目现有的模式和风格。
```

#### 调试问题
```
[组件名] 组件出现问题：[具体问题描述]

当前行为：[实际发生的情况]
期望行为：[应该发生的情况]
复现步骤：[如何触发问题]

请检查并修复，保持代码风格一致。
```

### 权限控制模式

#### 会员等级检查
```typescript
const { user } = useAuth();

// 检查是否可以访问功能
const canAccess = () => {
  if (!user || user.membershipTier === 'guest') return false;
  
  const tierHierarchy = { basic: 1, premium: 2, vip: 3 };
  return tierHierarchy[user.membershipTier] >= tierHierarchy[requiredTier];
};

// 条件渲染
{canAccess() ? (
  <AccessibleContent />
) : (
  <UpgradeRequired />
)}
```

#### 按钮状态控制
```typescript
<Button
  disabled={!canAccess()}
  onClick={onAction}
>
  {!user 
    ? 'Login to Access' 
    : canAccess() 
      ? 'Available Action' 
      : 'Upgrade Required'
  }
</Button>
```

### 常用开发模式

#### 状态管理模式
```typescript
// 页面级状态
const [activeTab, setActiveTab] = useState('default');
const [selectedItem, setSelectedItem] = useState<string | null>(null);
const [isLoading, setIsLoading] = useState(false);

// 全局状态 (通过 Context)
const { user, login, logout } = useAuth();
```

#### 事件处理模式
```typescript
// 简单事件处理
const handleClick = () => {
  // 处理逻辑
};

// 带参数的事件处理
const handleItemClick = (itemId: string) => {
  setSelectedItem(itemId);
  onItemSelect?.(itemId);
};

// 异步事件处理
const handleAsyncAction = async () => {
  setIsLoading(true);
  try {
    await someAsyncOperation();
  } catch (error) {
    console.error('操作失败:', error);
  } finally {
    setIsLoading(false);
  }
};
```

#### 条件渲染模式
```typescript
// 基础条件渲染
{isVisible && <Component />}

// 三元运算符
{condition ? <ComponentA /> : <ComponentB />}

// 复杂条件渲染
{loading ? (
  <LoadingSpinner />
) : data.length > 0 ? (
  <DataList data={data} />
) : (
  <EmptyState />
)}
```

#### 列表渲染模式
```typescript
// 基础列表渲染
{items.map((item) => (
  <ItemComponent 
    key={item.id} 
    item={item} 
    onAction={() => handleAction(item.id)}
  />
))}

// 带条件的列表渲染
{items
  .filter(item => item.isVisible)
  .map((item) => (
    <ItemComponent key={item.id} item={item} />
  ))
}
```