# Skills 市场补充用户信息设计

## 基本信息

- 日期：2026-03-27
- 主题：在 Skills 市场的列表卡片与详情页中补充作者用户信息
- 影响范围：`qiaoya-community-frontend`、`qiaoya-community-backend`
- 文档落点：由于仓库根目录不是 Git 仓库，本设计文档落在前端仓库中统一归档

## 背景

当前 Skills 市场已经展示作者名称，但作者信息仍然过薄：

- 列表卡片仅显示作者名，缺少头像与个人简介
- 详情页头部仅显示作者名，缺少更完整的作者信息块
- 项目内已经存在公开用户主页与公开用户资料接口，但 Skills 页面没有复用这套能力

这导致用户在浏览 Skill 时无法快速判断作者身份，也无法自然进入作者主页继续浏览其内容。

## 目标

本次需求的目标是：

- 在 Skills 列表卡片中展示作者头像、昵称、个人简介
- 在 Skills 详情页中展示独立的作者信息块，包含头像、昵称、个人简介
- 头像和昵称支持跳转到现有用户公开主页
- 不为列表页引入额外的逐条用户资料请求
- 保持现有 Skills 搜索、分页、点赞、收藏、GitHub 跳转逻辑不变

## 非目标

本次不包含以下内容：

- 不新增数据库表或新增 Skills 表字段
- 不新增独立的“Skill 作者聚合接口”
- 不修改用户公开主页本身的内容结构
- 不新增“查看作者”按钮
- 不改动 Skills 详情页评论、点赞、收藏的业务逻辑
- 不对用户中心的 Skill 编辑能力做交互调整

## 现状分析

### 已有能力

- Skills 公开列表接口：`GET /api/public/skills`
- Skills 公开详情接口：`GET /api/public/skills/{id}`
- Skills DTO 已包含：
  - `userId`
  - `authorName`
  - `likeCount`
  - `favoriteCount`
  - `commentCount`
- 用户公开主页路由已存在：
  - 前端：`/dashboard/users/:userId`
  - 路由工具：`routeUtils.getUserProfileRoute(userId)`
- 用户公开资料接口已存在：
  - `GET /api/user/{userId}`
- 用户领域实体已包含：
  - `name`
  - `description`
  - `avatar`

### 当前缺口

- Skill DTO 没有暴露 `authorAvatar` 与 `authorDescription`
- 前端 `PublicSkillDTO` 与 `PublicSkillDetailDTO` 没有对应字段
- Skills 页面没有复用头像解析与用户主页跳转规则

## 方案对比

### 方案一：扩展现有 Skill DTO 并随技能一起返回作者信息

做法：

- 在后端 `SkillListDTO`、`SkillDetailDTO` 中增加作者头像与作者简介字段
- 在 `SkillAssembler` 中统一从 `UserEntity` 映射
- 前端直接消费扩展后的 Skill DTO

优点：

- 改动最小，符合当前 Skills 模块已有的 `authorName` 扁平字段风格
- 列表页不会产生 N+1 用户资料请求
- 详情页无需额外发起用户资料请求才能展示作者信息
- 适合本次需求的增量实现

缺点：

- Skill DTO 会承担一部分作者字段，模型不如嵌套对象纯粹

### 方案二：前端基于 `userId` 逐条拉取用户公开资料

做法：

- Skills 列表和详情先拉 Skill
- 再按 `userId` 调用用户公开资料接口补齐头像和简介

优点：

- 最大化复用现有用户公开资料接口

缺点：

- 列表页会出现多次并发请求
- 需要更复杂的加载、错误和缓存处理
- 会带来性能和稳定性上的不必要成本

### 方案三：将作者信息改为嵌套对象

做法：

- Skill DTO 改为 `author: { id, name, avatar, description }`

优点：

- 数据模型更清晰

缺点：

- 相对当前仓库风格改动更大
- 前后端类型、序列化和兼容性调整成本高于本次需求需要

## 结论

采用方案一：扩展现有 Skill DTO，并由后端在查询 Skill 时一并补齐作者头像与作者简介。

这是当前上下文下性价比最高的方案，既能覆盖需求，也能避免前端额外请求与模型大改。

## 详细设计

### 一、数据模型与接口设计

后端新增字段：

- `SkillListDTO`
  - `authorAvatar`
  - `authorDescription`
- `SkillDetailDTO`
  - 继承 `SkillListDTO`，无需重复定义

前端新增字段：

- `PublicSkillDTO`
  - `userId`
  - `authorAvatar`
  - `authorDescription`
- `PublicSkillDetailDTO`
  - 继承 `PublicSkillDTO`

映射规则：

- `authorName` ← `UserEntity.name`
- `authorAvatar` ← `UserEntity.avatar`
- `authorDescription` ← `UserEntity.description`
- `userId` 继续作为用户主页跳转标识保留

接口边界：

- 不新增新接口
- 不修改查询参数
- 继续使用现有公开 Skills 列表和详情接口

### 二、前端展示设计

#### 1. Skills 列表卡片

列表卡片中作者区域调整为：

- 展示头像
- 展示昵称
- 展示个人简介摘要
- 保留创建时间

交互规则：

- 点击头像进入用户主页
- 点击昵称进入用户主页
- 点击卡片其他区域进入 Skill 详情
- 作者区域点击事件需要阻断卡片默认跳转，避免误触
- GitHub 按钮、点赞按钮、收藏按钮的点击行为保持不变

布局规则：

- 作者简介最多展示 2 行
- 创建时间继续作为技能元信息保留
- 不挤占底部交互按钮区

#### 2. Skills 详情页

详情页新增独立作者信息块，展示：

- 作者头像
- 作者昵称
- 作者个人简介

交互规则：

- 点击头像进入用户主页
- 点击昵称进入用户主页
- 不新增单独的“查看作者”按钮

布局规则：

- 作者信息块与技能摘要、GitHub、点赞收藏分区展示
- 移动端时作者信息块向下堆叠，避免头部横向拥挤

### 三、头像与空值兜底

头像展示需要兼容以下来源：

- 系统头像路径，例如 `/avatars/avatar_1.png`
- 资源 ID
- 完整 URL
- 站内相对路径

前端复用项目既有头像解析逻辑，不单独重新实现一套转换规则。

空值兜底规则：

- 头像缺失：使用默认系统头像
- 昵称缺失：显示 `匿名作者`
- 简介缺失：列表页为空时不展示额外占位块，详情页显示 `作者暂未填写个人简介`

### 四、路由与跳转

用户主页入口直接复用现有路由工具：

- `routeUtils.getUserProfileRoute(userId)`

本次不新增新路由，不新增 `/skills` 侧的用户页别名。

## 兼容性考虑

- 老数据没有头像或简介时，页面仍能正常展示
- 用户中心 Skill 管理页如果复用 Skill DTO，将自然获得新增字段，但本次不主动调整其页面
- 新增字段为向后兼容扩展，不影响现有接口调用方按旧字段读取
- 不新增前端逐条用户请求，因此不会引入列表页性能回退

## 影响文件

### 后端

- `src/main/java/org/xhy/community/application/skill/dto/SkillListDTO.java`
- `src/main/java/org/xhy/community/application/skill/dto/SkillDetailDTO.java`
- `src/main/java/org/xhy/community/application/skill/assembler/SkillAssembler.java`
- 如需补充测试，涉及 Skills AppService 或 Assembler 的测试文件

### 前端

- `src/shared/types/index.ts`
- `src/shared/services/api/skills.service.ts`
- `src/shared/components/business/SkillCard.tsx`
- `src/apps/user-portal/components/SkillsPage.tsx`
- `src/apps/user-portal/components/SkillDetailPage.tsx`

## 验证方案

后端验证：

- 检查 Skills 列表接口返回作者头像、作者简介字段
- 检查 Skills 详情接口返回作者头像、作者简介字段
- 若已有相关单元测试，补充 DTO 映射断言
- 运行 `mvn test`

前端验证：

- 列表页展示头像、昵称、简介摘要
- 点击头像或昵称进入用户主页
- 点击卡片非作者区域仍进入 Skill 详情
- 详情页展示作者信息块
- 详情页点击头像或昵称进入用户主页
- GitHub、点赞、收藏逻辑不受影响
- 运行 `npm run build`
- 运行 `npm run lint`

## 风险与控制

风险一：卡片点击区域冲突

- 控制方式：在作者区域显式阻断冒泡，避免整卡点击吞掉作者主页跳转

风险二：头像字段来源不一致

- 控制方式：统一走现有头像解析逻辑，兼容资源 ID、URL 与系统头像路径

风险三：作者简介过长导致布局变形

- 控制方式：列表页做 2 行截断，详情页保留更完整展示但遵循现有响应式布局

## 实施边界

本设计完成后，下一阶段实现只聚焦：

- DTO 扩展
- Assembler 映射
- Skills 列表卡片展示
- Skills 详情作者信息块展示
- 用户主页跳转接入

不在本次实现中顺带重构 Skills 模块整体样式，也不扩展用户主页内容。
