export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  membershipTier: 'guest' | 'basic' | 'premium' | 'vip';
  membershipExpiry?: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  thumbnail: string;
  price: number;
  originalPrice?: number;
  rating: number;
  studentCount: number;
  tags: string[];
  requiredTier: 'basic' | 'premium' | 'vip';
  isNew?: boolean;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  duration: string;
  videoUrl?: string;
  isCompleted?: boolean;
  order: number;
}

export interface MembershipPlan {
  id: string;
  name: string;
  tier: 'basic' | 'premium' | 'vip';
  price: number;
  originalPrice?: number;
  duration: string;
  features: string[];
  isPopular?: boolean;
  color: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    membershipTier: 'guest' | 'basic' | 'premium' | 'vip';
  };
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  comments: number;
  tags: string[];
  type: 'article' | 'question';
  isAnswered?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    membershipTier: 'guest' | 'basic' | 'premium' | 'vip';
  };
  createdAt: Date;
  likes: number;
  postId: string;
  isAnswer?: boolean;
}

export interface ChangelogEntry {
  id: string;
  version: string;
  title: string;
  description: string;
  releaseDate: Date;
  changes: ChangelogChange[];
  status: 'draft' | 'published' | 'archived';
  isImportant: boolean;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  viewCount: number;
  feedbackCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChangelogChange {
  id: string;
  type: 'feature' | 'improvement' | 'bugfix' | 'breaking' | 'security';
  title: string;
  description: string;
  category?: string;
}

// API 相关类型定义
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

// 登录请求参数
export interface LoginRequest {
  email: string;
  password: string;
}

// 注册请求参数
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// 后端用户数据结构
export interface BackendUser {
  id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  email: string;
  status: string;
  emailNotificationEnabled: boolean;
  maxConcurrentDevices: number;
  createTime: string;
  updateTime: string;
}

// 登录响应数据
export interface LoginResponse {
  token: string;
  user: BackendUser;
}

// 创建文章请求参数
export interface CreatePostRequest {
  title: string;          // 文章标题 (必填, 5-200字符)
  content: string;        // 文章内容 (必填, 最少10个字符, 支持Markdown)
  summary?: string;       // 文章概要 (可选, 最多500字符)
  coverImage?: string;    // 封面图片URL (可选, 最多500字符)
  categoryId: string;     // 分类ID (必填, 必须是有效的分类UUID)
}

// 更新文章请求参数（与CreatePostRequest相同）
export interface UpdatePostRequest {
  title: string;          // 文章标题 (必填, 5-200字符)
  content: string;        // 文章内容 (必填, 最少10个字符)
  summary?: string;       // 文章概要 (可选)
  coverImage?: string;    // 封面图片URL (可选)
  categoryId: string;     // 分类ID
}

// 修改文章状态请求参数
export interface PostStatusRequest {
  status: 'DRAFT' | 'PUBLISHED'; // 目标状态
}

// 文章DTO（API返回的详细文章数据）
export interface PostDTO {
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
  publishTime?: string;    // 发布时间
  createTime: string;      // 创建时间
  updateTime: string;      // 更新时间
}

// 前端展示的文章DTO（公开文章列表）
export interface FrontPostDTO {
  id: string;
  title: string;
  summary?: string;
  coverImage?: string;
  authorName: string;      // 作者名称
  categoryName: string;    // 分类名称
  likeCount: number;
  viewCount: number;
  commentCount: number;
  isTop: boolean;
  publishTime: string;     // 发布时间
}

// 前端展示的文章详情DTO（公开文章详情）
export interface FrontPostDetailDTO {
  id: string;
  title: string;
  content: string;         // 完整文章内容
  summary?: string;
  coverImage?: string;
  authorId: string;        // 作者ID
  authorName: string;      // 作者名称
  authorAvatar?: string;   // 作者头像
  categoryId: string;      // 分类ID
  categoryName: string;    // 分类名称
  likeCount: number;
  viewCount: number;
  commentCount: number;
  isTop: boolean;
  publishTime: string;     // 发布时间
  createTime: string;      // 创建时间
  updateTime: string;      // 更新时间
}

// 分页查询响应
export interface PageResponse<T> {
  records: T[];            // 数据列表
  total: number;           // 总记录数
  size: number;            // 每页大小
  current: number;         // 当前页码
  orders?: OrderItem[];    // 排序信息
  optimizeCountSql: boolean;
  searchCount: boolean;
  optimizeJoinOfCountSql: boolean;
  maxLimit?: number;
  countId?: string;
  pages: number;           // 总页数
}

// 排序项
export interface OrderItem {
  column: string;
  asc: boolean;
}

// 公开文章查询请求参数
export interface PublicPostQueryRequest {
  pageNum?: number;                    // 页码，从1开始，默认为1
  pageSize?: number;                   // 每页大小，默认为10，最大为100
  categoryType?: 'ARTICLE' | 'QA';     // 分类类型过滤（可选）
}

// 文章分类
export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;        // 父分类ID
  type: 'ARTICLE' | 'QA';   // 分类类型
  level: number;            // 分类层级
  sortOrder: number;        // 排序值
  icon?: string;            // 图标
  isActive: boolean;        // 是否激活
  createTime: string;       // 创建时间
  updateTime: string;       // 更新时间
  children?: Category[];    // 子分类（树形结构）
}

// 创建文章响应（保持向下兼容）
export interface CreatePostResponse {
  id: string;
  title: string;
  content: string;
  summary?: string;
  coverImage?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  categoryId: string;
  category?: Category;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

// ================ 用户个人信息管理相关接口 ================

// 更新用户个人简介请求参数
export interface UpdateProfileRequest {
  description?: string;      // 个人简介，最大500个字符，可为空
}

// 修改密码请求参数
export interface ChangePasswordRequest {
  oldPassword: string;       // 原密码，用于验证用户身份
  newPassword: string;       // 新密码，长度6-20位
}

// 用户DTO（API返回的完整用户数据）
export interface UserDTO {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  emailNotificationEnabled: boolean;
  maxConcurrentDevices: number;
  createTime: string;
  updateTime: string;
}

// ================ 评论相关接口定义 ================

// 业务类型枚举
export type BusinessType = 'POST' | 'COURSE';

// 评论DTO（API返回的评论数据）
export interface CommentDTO {
  id: string;                    // 评论ID
  content: string;               // 评论内容
  businessId: string;            // 业务ID（文章ID或课程ID）
  businessType: BusinessType;    // 业务类型
  parentCommentId?: string;      // 父评论ID（用于回复）
  rootCommentId?: string;        // 根评论ID（用于多级回复）
  commentUserId: string;         // 评论用户ID
  commentUserName: string;       // 评论用户名称
  commentUserAvatar?: string;    // 评论用户头像
  replyUserId?: string;          // 被回复用户ID
  replyUserName?: string;        // 被回复用户名称
  likeCount: number;             // 点赞数
  replyCount: number;            // 回复数
  createTime: string;            // 创建时间
  updateTime: string;            // 更新时间
  isLiked?: boolean;             // 当前用户是否已点赞（前端使用）
}

// 创建评论请求参数
export interface CreateCommentRequest {
  content: string;               // 评论内容，必填，最大2000字符
  businessId: string;            // 业务ID，必填
  businessType: BusinessType;    // 业务类型，必填
}

// 回复评论请求参数
export interface ReplyCommentRequest {
  content: string;               // 回复内容，必填，最大2000字符
  parentCommentId: string;       // 父评论ID，必填
  businessId: string;            // 业务ID，必填
  businessType: BusinessType;    // 业务类型，必填
  replyUserId: string;           // 被回复用户ID，必填
}

// 查询评论列表请求参数
export interface QueryCommentsRequest {
  pageNum?: number;              // 页码，从1开始，默认为1
  pageSize?: number;             // 每页大小，默认为10
  businessId: string;            // 业务ID，必填
  businessType: BusinessType;    // 业务类型，必填
}

// 查询用户相关评论请求参数
export interface QueryUserCommentsRequest {
  pageNum?: number;              // 页码，从1开始，默认为1
  pageSize?: number;             // 每页大小，默认为10
}

// 评论树结构（前端展示用）
export interface CommentTreeNode extends CommentDTO {
  children?: CommentTreeNode[];  // 子评论列表
  level: number;                 // 评论层级，0为根评论
}