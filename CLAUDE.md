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

### Component Organization (已重构为Apps架构)
```
src/
├── apps/                    # 应用模块 (Apps-based Architecture)
│   ├── marketing/           # 营销前台 - 未登录用户界面
│   │   └── components/      # Hero, Testimonials, CTA, Features
│   ├── user-portal/         # 用户门户 - 已登录用户学习界面
│   │   └── components/      # Dashboard, CoursesPage, DiscussionsPage, ProfilePage
│   └── user-backend/        # 用户后台 - 内容管理界面
│       └── components/      # MyArticlesPage, MessageCenterPage, ProfileSettingsPage
├── shared/                  # 共享资源
│   ├── components/
│   │   ├── ui/              # 基础UI组件 (Button, Card, Input, Badge)
│   │   ├── business/        # 业务组件 (CourseCard, AuthModal, PricingCard)
│   │   └── common/          # 通用组件 (Header)
│   ├── constants/           # 常量和模拟数据
│   ├── types/               # TypeScript 类型定义
│   └── utils/               # 工具函数
├── context/                 # React Context
└── main.tsx, App.tsx        # 应用入口
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

#### 目录组织 (Apps-based Architecture)
```
src/
├── apps/                     # 应用模块架构
│   ├── marketing/            # 营销前台应用
│   │   └── components/       # Hero, Testimonials, CTA, Features
│   ├── user-portal/          # 用户门户应用 (学习界面)
│   │   └── components/       # Dashboard, CoursesPage, DiscussionsPage, ProfilePage
│   └── user-backend/         # 用户后台应用 (内容管理)
│       └── components/       # MyArticlesPage, MessageCenterPage, ProfileSettingsPage
├── shared/                   # 共享资源
│   ├── components/
│   │   ├── ui/               # 基础UI组件 (Button, Card, Input, Badge)
│   │   ├── business/         # 业务组件 (CourseCard, AuthModal, PricingCard)
│   │   └── common/           # 通用组件 (Header)
│   ├── constants/            # 常量和模拟数据 (原 data/)
│   ├── types/                # TypeScript 类型定义
│   └── utils/                # 工具函数 (cn.ts 等)
├── context/                  # React Context (AuthContext)
└── main.tsx, App.tsx         # 应用入口文件
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

## 目录结构规范 (Apps-based Architecture)

### 必须遵循的目录架构
项目采用 Apps-based 架构，**必须**按以下结构组织代码：

```
src/
├── apps/                     # 应用模块 - 按业务功能划分
│   ├── marketing/            # 营销前台 (未登录用户界面)
│   ├── user-portal/          # 用户门户 (已登录学习界面)  
│   └── user-backend/         # 用户后台 (内容管理界面)
├── shared/                   # 共享资源 - 跨应用复用
│   ├── components/ui/        # 基础UI组件
│   ├── components/business/  # 业务组件
│   ├── components/common/    # 通用组件
│   ├── constants/           # 常量和模拟数据
│   ├── types/               # TypeScript类型定义
│   └── utils/               # 工具函数
└── context/                 # 全局Context
```

### 路径别名规范 (必须配置)
**vite.config.ts 中必须配置以下别名：**

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@shared': path.resolve(__dirname, './src/shared'),
    '@apps': path.resolve(__dirname, './src/apps'),
    '@marketing': path.resolve(__dirname, './src/apps/marketing'),
    '@user-portal': path.resolve(__dirname, './src/apps/user-portal'),
    '@user-backend': path.resolve(__dirname, './src/apps/user-backend'),
  }
}
```

### 导入路径强制规范

#### ✅ 正确的导入方式
```typescript
// Apps 中导入 shared 资源 - 必须使用别名
import { Button } from '@shared/components/ui/Button';
import { CourseCard } from '@shared/components/business/CourseCard';
import { mockData } from '@shared/constants/mockData';

// Shared 内部导入 - 必须使用相对路径  
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

// 应用组件导入 - 必须使用别名
import { Hero } from '@apps/marketing/components/Hero';
import { Dashboard } from '@apps/user-portal/components/Dashboard';
```

#### ❌ 禁止的导入方式
```typescript
// 禁止在 apps 中使用长相对路径
import { Button } from '../../shared/components/ui/Button';

// 禁止在 shared 内部使用别名
import { Button } from '@shared/components/ui/Button';

// 禁止跨应用直接导入
import { MarketingComponent } from '../marketing/components/Hero';
```

### 组件创建规范

#### 新建应用模块组件
1. **路径**: `src/apps/{app-name}/components/{ComponentName}.tsx`
2. **导入顺序**: React库 → Context → Shared组件 → 应用内组件 → 数据类型
3. **必须**遵循项目现有组件模式

#### 新建共享组件  
1. **UI组件**: `src/shared/components/ui/{ComponentName}.tsx`
2. **业务组件**: `src/shared/components/business/{ComponentName}.tsx`  
3. **通用组件**: `src/shared/components/common/{ComponentName}.tsx`

### 开发强制要求

#### Claude Code 必须遵循的规则
1. **创建新组件时**，必须先检查现有架构，放入正确目录
2. **修改导入路径时**，必须使用正确的别名或相对路径规范
3. **重构时**，必须保持架构一致性，不能破坏模块边界
4. **添加新功能时**，必须评估放在哪个应用模块最合适

#### 路径重构命令 (必要时使用)
```bash
# 修复apps中的shared导入
find src/apps -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '\.\./\.\./shared/|from '@shared/|g"

# 修复shared内部导入
find src/shared/components/ui -name "*.tsx" | xargs sed -i '' "s|from '\.\./\.\./shared/utils/|from '../../utils/|g" 

# 构建验证
npm run build
```

### 扩展规范

#### 新增应用模块流程
1. 在 `src/apps/` 创建新目录
2. 添加 `components/` 子目录
3. 在 `vite.config.ts` 添加别名
4. 在 `App.tsx` 集成路由
5. 更新本规范文档

#### 禁止的操作
- **禁止**在 apps 之间直接导入组件
- **禁止**在 shared 中导入 apps 的组件  
- **禁止**破坏现有的模块边界
- **禁止**在不合适的目录创建组件

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

## 品牌设计规范

### 敲鸭品牌色彩体系
敲鸭社区采用以黄色为核心的温和色彩体系，体现教育平台的专业性和亲和力。

#### 官方主题色
- **淡雅黄 (Elegant Yellow)**
  - Tailwind CSS: `bg-yellow-200`
  - Key: `elegant-yellow`
  - 特点: 淡雅清新，优雅气质
  - 使用场景: 默认按钮主题色，全站主色调

#### 黄色延伸色彩系统
项目提供15种丰富的黄色变体，分为以下类别：

**经典黄色系 (3款)**
- 活力黄 (`vibrant-yellow`) - 纯正活力黄，充满生机
- 经典黄 (`classic-yellow`) - 经典敲鸭黄，平衡饱和度  
- 深邃黄 (`deep-yellow`) - 深邃浓郁，专业感强

**暖调黄色系 (4款)**
- 当前黄橙渐变 (`current-yellow`) - 经典渐变，活力橙黄
- 暖金黄 (`warm-yellow`) - 温暖金黄调，亲和力强
- 蜂蜜黄 (`honey-yellow`) - 自然蜂蜜色，甜美温暖
- 琥珀黄 (`amber-yellow`) - 深度琥珀色，沉稳大气

**高级金色系 (3款)**  
- 香槟金 (`champagne-gold`) - 优雅香槟金，高级质感
- 古典金 (`classic-gold`) - 古典金色，庄重典雅
- 阳光金 (`sunshine-gold`) - 明亮阳光金，活力四射

**渐变黄色系 (3款)**
- 金黄渐变 (`gold-gradient`) - 奢华金黄渐变，层次丰富
- 柔和渐变 (`soft-gradient`) - 温和渐变过渡，自然舒适

**柔和黄色系 (2款)**
- 柔和黄 (`soft-yellow`) - 柔和温雅，舒适护眼
- 淡雅黄 (`elegant-yellow`) - **官方推荐** 淡雅清新，优雅气质

#### 品牌设计原则
1. **Logo颜色保持**：黄色敲鸭Logo作为品牌识别核心不变
2. **主题色应用**：界面主按钮和重要元素使用淡雅黄
3. **色彩层次**：通过黄色的不同明度和饱和度创造层次感
4. **优雅平衡**：避免过于鲜艳的黄色，保持优雅专业的视觉效果

#### 按钮颜色使用规范
```typescript
// 推荐使用淡雅黄作为默认主题
const theme = useTheme();
theme.setVariantByKey('elegant-yellow');

// 在特殊场景可使用其他黄色变体
// 活跃场景：vibrant-yellow
// 温暖场景：honey-yellow  
// 高端场景：champagne-gold
```

#### 设计系统演示
访问 `http://localhost:5173/?demo=button` 查看完整的黄色延伸系统演示。

### Logo规范
- **文件**: `/public/logo.jpg`
- **使用**: 黄色敲鸭头像作为品牌标识
- **尺寸**: 通常使用 `h-8 w-8` (32x32px) 尺寸
- **应用**: 头部导航、页脚、登录界面等关键位置