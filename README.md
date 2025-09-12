# 巧牙社区前端

一个基于 React + TypeScript + Vite 构建的现代化社区平台前端应用。

## 技术栈

### 核心框架
- **React 18** - 现代化的前端框架
- **TypeScript** - 类型安全的 JavaScript 超集
- **Vite** - 快速的构建工具和开发服务器

### UI 和样式
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Lucide React** - 精美的图标库
- **PostCSS + Autoprefixer** - CSS 后处理

### 开发工具
- **ESLint** - 代码质量检查
- **TypeScript ESLint** - TypeScript 特定的 ESLint 规则

## 功能特性

- 🏠 **首页** - 展示社区特色和功能
- 👤 **用户认证** - 登录/注册系统
- 📚 **课程管理** - 课程展示和详情页面
- 💬 **讨论区** - 社区交流功能
- 📝 **内容发布** - 创建和管理帖子
- 👥 **用户档案** - 个人信息管理
- 📊 **仪表盘** - 用户控制面板

## 快速开始

### 环境要求

- Node.js >= 16
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:5173](http://localhost:5173) 查看应用

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
```

## 项目结构

```
src/
├── components/          # 可复用组件
│   ├── auth/           # 认证相关组件
│   ├── courses/        # 课程相关组件
│   ├── dashboard/      # 仪表盘页面组件
│   ├── home/          # 首页组件
│   ├── layout/        # 布局组件
│   ├── pricing/       # 定价相关组件
│   └── ui/            # 基础UI组件
├── context/           # React Context
├── data/              # 模拟数据
├── types/             # TypeScript 类型定义
├── utils/             # 工具函数
├── App.tsx            # 主应用组件
├── main.tsx          # 应用入口
└── index.css         # 全局样式
```

## 开发指南

### 组件开发
- 使用函数组件和 React Hooks
- 遵循 TypeScript 类型安全
- 采用 Tailwind CSS 进行样式开发

### 状态管理
- 使用 React Context 进行全局状态管理
- 本地状态使用 useState 和 useReducer

### 代码规范
- 遵循 ESLint 配置的代码规范
- 使用 TypeScript 进行类型检查
- 组件和函数采用驼峰命名法

## 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/新功能`)
3. 提交更改 (`git commit -am '添加新功能'`)
4. 推送到分支 (`git push origin feature/新功能`)
5. 创建 Pull Request