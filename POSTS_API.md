# 文章API对接说明

本文档介绍了敲鸭社区前端项目中文章相关API的对接和使用方法。

## 📋 API 概览

### 用户文章管理接口
- `POST /api/user/posts` - 创建新文章（默认状态为草稿）
- `PUT /api/user/posts/{id}` - 更新文章（只有文章作者才能修改）
- `GET /api/user/posts/{id}` - 获取文章详情（只能查看自己的文章）
- `GET /api/user/posts` - 分页查询当前用户的文章列表
- `DELETE /api/user/posts/{id}` - 删除文章（软删除）
- `PATCH /api/user/posts/{id}/status` - 修改文章状态（草稿↔已发布）

### 公开文章查询接口
- `POST /api/public/posts/queries` - 分页查询公开文章列表（已发布）

## 🔧 服务层使用

### 导入服务
```typescript
import { PostsService } from '@shared/services/api/posts.service';
import { CreatePostRequest, UpdatePostRequest, PostDTO } from '@shared/types';
```

### 创建文章
```typescript
const createRequest: CreatePostRequest = {
  title: '文章标题',
  content: '文章内容（支持Markdown）',
  summary: '文章摘要（可选）',
  coverImage: '封面图片URL（可选）',
  categoryId: '分类ID'
};

const createdPost = await PostsService.createPost(createRequest);
```

### 更新文章
```typescript
const updateRequest: UpdatePostRequest = {
  title: '新标题',
  content: '新内容',
  categoryId: '新分类ID'
};

const updatedPost = await PostsService.updatePost(postId, updateRequest);
```

### 获取用户文章列表
```typescript
// 获取所有文章
const allPosts = await PostsService.getUserPosts();

// 分页和过滤
const publishedPosts = await PostsService.getUserPosts({
  pageNum: 1,
  pageSize: 10,
  status: 'PUBLISHED'
});
```

### 发布和撤回文章
```typescript
// 发布文章（草稿 → 已发布）
await PostsService.publishPost(postId);

// 撤回文章（已发布 → 草稿）
await PostsService.draftPost(postId);

// 或者直接设置状态
await PostsService.updatePostStatus(postId, 'PUBLISHED');
```

### 删除文章
```typescript
await PostsService.deletePost(postId);
```

### 获取公开文章列表
```typescript
const publicPosts = await PostsService.getPublicPosts({
  pageNum: 1,
  pageSize: 20,
  categoryType: 'ARTICLE' // 或 'QA'
});
```

## 📊 数据类型

### PostDTO（文章详情）
```typescript
interface PostDTO {
  id: string;
  title: string;
  content: string;
  summary?: string;
  coverImage?: string;
  authorId: string;
  categoryId: string;
  status: 'DRAFT' | 'PUBLISHED';
  likeCount: number;
  viewCount: number;
  commentCount: number;
  isTop: boolean;
  publishTime?: string;
  createTime: string;
  updateTime: string;
}
```

### FrontPostDTO（公开文章列表）
```typescript
interface FrontPostDTO {
  id: string;
  title: string;
  summary?: string;
  coverImage?: string;
  authorName: string;
  categoryName: string;
  likeCount: number;
  viewCount: number;
  commentCount: number;
  isTop: boolean;
  publishTime: string;
}
```

### 分页响应
```typescript
interface PageResponse<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
  // ... 其他分页信息
}
```

## 🎨 UI 组件使用

### 文章列表页面
```typescript
import { MyArticlesPage } from '@apps/user-backend/components/MyArticlesPage';

<MyArticlesPage 
  onArticleClick={(articleId) => {
    // 处理文章点击事件
    console.log('点击文章:', articleId);
  }}
/>
```

### 创建/编辑文章页面
```typescript
import { CreatePostPage } from '@apps/user-portal/components/CreatePostPage';

// 创建新文章
<CreatePostPage 
  onPostCreated={() => {
    // 文章创建完成后的回调
    console.log('文章创建成功');
  }}
/>

// 编辑现有文章
<CreatePostPage 
  onPostCreated={() => {
    // 文章更新完成后的回调
    console.log('文章更新成功');
  }}
  initialData={existingPost} // 传入要编辑的文章数据
/>
```

## 🔐 认证要求

大部分用户文章管理接口需要JWT令牌认证，确保在请求头中包含：
```
Authorization: Bearer <token>
```

公开文章查询接口无需认证。

## ⚠️ 注意事项

1. **文章状态**：新创建的文章默认为草稿状态
2. **权限控制**：只有文章作者才能修改、删除自己的文章
3. **软删除**：删除文章是软删除，不会物理删除数据
4. **分类验证**：创建文章时必须提供有效的分类ID
5. **内容限制**：
   - 标题：5-200字符
   - 内容：最少10个字符
   - 摘要：最多500字符（可选）

## 🧪 测试

可以使用 `posts.service.test.ts` 文件中的示例代码进行测试：

```typescript
import { testCompleteWorkflow } from '@shared/services/api/posts.service.test';

// 运行完整的工作流程测试
await testCompleteWorkflow();
```

## 🔗 相关文件

- `src/shared/services/api/posts.service.ts` - 文章服务层
- `src/shared/types/index.ts` - 类型定义
- `src/apps/user-backend/components/MyArticlesPage.tsx` - 文章管理页面
- `src/apps/user-portal/components/CreatePostPage.tsx` - 创建/编辑文章页面
- `src/shared/services/api/posts.service.test.ts` - 测试示例