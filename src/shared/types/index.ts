export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  // 并发设备上限（来自后端用户信息）
  maxConcurrentDevices?: number;
  membershipTier: 'guest' | 'basic' | 'premium' | 'vip';
  membershipExpiry?: Date;
  // 套餐回显相关（可选）
  currentSubscriptionPlanId?: string;
  currentSubscriptionPlanName?: string;
  currentSubscriptionStartTime?: string | Date;
  currentSubscriptionEndTime?: string | Date;
  currentSubscriptionPlanLevel?: number; // 1/2/3 用于样式层级
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
  // 旧注册接口（保留兼容）
  register: (name: string, email: string, password: string) => Promise<void>;
  // 新注册接口：邮箱验证码注册
  sendRegisterCode: (email: string) => Promise<void>;
  registerWithCode: (email: string, code: string, password: string) => Promise<void>;
  logout: () => void;
  // 表示登录/注册等认证动作的进行态（用于按钮/表单禁用）
  isLoading: boolean;
  // 应用启动阶段的初始化态（仅用于路由守卫决定是否渲染页面）
  isInitializing: boolean;
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
  tags?: string[];        // 标签（字符串数组，数量不限）
}

// 更新文章请求参数（与CreatePostRequest相同）
export interface UpdatePostRequest {
  title: string;          // 文章标题 (必填, 5-200字符)
  content: string;        // 文章内容 (必填, 最少10个字符)
  summary?: string;       // 文章概要 (可选)
  coverImage?: string;    // 封面图片URL (可选)
  categoryId: string;     // 分类ID
  tags?: string[];        // 标签（字符串数组，数量不限）
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
  tags?: string[];        // 标签
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
  authorAvatar?: string;   // 作者头像（资源ID或URL）
  categoryName: string;    // 分类名称
  tags?: string[];         // 标签
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
  tags?: string[];         // 标签
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

// ================ 资源管理相关接口定义 ================

// 资源类型
export type ResourceType = 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AUDIO' | 'OTHER';

// 资源DTO（API返回的资源数据）
export interface ResourceDTO {
  id: string;             // 资源ID
  fileKey: string;        // 存储key
  size: number;           // 文件大小（字节）
  format: string;         // 文件格式（扩展名/MIME简写）
  userId: string;         // 上传用户ID
  resourceType: ResourceType | string; // 资源类型
  originalName: string;   // 原始文件名
  downloadUrl?: string;   // 可用的下载URL（如后端提供）
  createTime: string;     // 创建时间
  updateTime: string;     // 更新时间
}

// 资源分页查询请求参数
export interface ResourceQueryRequest {
  pageNum?: number;        // 页码，从1开始
  pageSize?: number;       // 每页大小
  resourceType?: ResourceType | string; // 资源类型筛选
}

// 上传凭证请求
export interface GetUploadCredentialsRequest {
  originalName: string;    // 原始文件名
  contentType: string;     // MIME类型
}

// 上传凭证DTO（OSS直传参数）
export interface UploadCredentialsDTO {
  // STS临时凭证
  accessKeyId: string;
  accessKeySecret: string;
  securityToken: string;
  expiration: string;

  // OSS信息
  region: string;
  bucket: string;
  endpoint: string;

  // 策略与签名
  policy: string;
  signature: string;
  key: string;
  callback: string;

  // 兼容字段
  uploadUrl?: string;
  fileKey?: string;
  expirationTime?: string;
  maxFileSize?: number;
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
  avatar?: string;           // 头像资源ID（保存ID，由后端解析为可访问URL）
}

// 修改密码请求参数
export interface ChangePasswordRequest {
  oldPassword: string;       // 原密码，用于验证用户身份
  newPassword: string;       // 新密码，长度6-20位
}

// 用户DTO（API返回的完整用户数据）
export type UserRole = 'ADMIN' | 'USER';

export interface UserDTO {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  emailNotificationEnabled: boolean;
  maxConcurrentDevices: number;
  role?: UserRole;             // 后端将新增的角色字段：ADMIN/USER
  createTime: string;
  updateTime: string;
  // ========== 后端新增：用户当前套餐相关字段 ==========
  // 冗余字段：当前套餐的关键信息（可选）
  currentSubscriptionPlanId?: string;
  currentSubscriptionPlanName?: string;
  currentSubscriptionStartTime?: string; // ISO字符串
  currentSubscriptionEndTime?: string;   // ISO字符串
  currentSubscriptionPlanLevel?: number; // 1/2/3（如果后端提供则直传）
}

// 用户套餐状态（与后端 SubscriptionStatus 对齐）
export type SubscriptionStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

// 用户套餐DTO（与后端 UserSubscriptionDTO 对齐的前端定义）
export interface UserSubscriptionDTO {
  id: string;
  userId: string;
  subscriptionPlanId: string;
  subscriptionPlanName: string;
  startTime: string;              // ISO字符串
  endTime: string;                // ISO字符串
  status: SubscriptionStatus | string;
  cdkCode?: string;
  daysRemaining?: number;
  isActive?: boolean;
  createTime: string;
}

// ================ 评论相关接口定义 ================

// 业务类型枚举
export type BusinessType = 'POST' | 'COURSE' | 'CHAPTER';

// 评论DTO（API返回的评论数据）
export interface CommentDTO {
  id: string;                    // 评论ID
  content: string;               // 评论内容
  businessId: string;            // 业务ID（文章ID或课程ID）
  businessType: BusinessType;    // 业务类型
  businessName?: string;         // 业务名称（文章标题/课程名称等，可选）
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

// ================ 分类管理相关接口定义 ================

// 创建分类请求参数
export interface CreateCategoryRequest {
  name: string;                  // 分类名称，必填，2-50字符
  type: 'ARTICLE' | 'QA';        // 分类类型，必填
  sortOrder?: number;            // 排序值，可选
}

// 更新分类请求参数
export interface UpdateCategoryRequest {
  name: string;                  // 分类名称，必填，2-50字符
  type: 'ARTICLE' | 'QA';        // 分类类型，必填
  sortOrder?: number;            // 排序值，可选
}

// 分页查询分类列表请求参数
export interface CategoryQueryRequest {
  pageNum?: number;              // 页码，从1开始，默认为1
  pageSize?: number;             // 每页大小，默认为10
  type?: 'ARTICLE' | 'QA';       // 分类类型过滤，可选
  parentId?: string;             // 父分类ID过滤，可选
}

// 分类DTO（API返回的完整分类数据）
export interface CategoryDTO {
  id: string;                    // 分类ID
  name: string;                  // 分类名称
  description?: string;          // 分类描述
  parentId?: string;             // 父分类ID
  type: 'ARTICLE' | 'QA';        // 分类类型
  level: number;                 // 分类层级
  sortOrder: number;             // 排序值
  icon?: string;                 // 图标
  isActive: boolean;             // 是否激活
  createTime: string;            // 创建时间
  updateTime: string;            // 更新时间
  children?: CategoryDTO[];      // 子分类（树形结构用）
}

// ================ 管理员课程管理相关接口定义 ================

// 课程状态枚举
export type CourseStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

// 课程资源类型
export interface CourseResource {
  title: string;                 // 资源标题
  description: string;           // 资源描述
  icon: string;                  // 图标名称
}

// 管理员课程DTO（API返回的完整课程数据）
export interface CourseDTO {
  id: string;                    // 课程ID
  title: string;                 // 课程标题
  description?: string;          // 课程描述
  coverImage?: string;           // 封面图片URL
  techStack?: string[];          // 技术栈数组
  projectUrl?: string;           // 项目URL
  demoUrl?: string;              // 演示地址
  resources?: CourseResource[];  // 课程资源列表
  tags?: string[];               // 标签数组
  rating: number;                // 评分
  price?: number;                // 课程售价
  originalPrice?: number;        // 课程原价
  status: CourseStatus;          // 课程状态
  authorId: string;              // 作者ID
  totalReadingTime: number;      // 总阅读时间（分钟）
  createTime: string;            // 创建时间
  updateTime: string;            // 更新时间
}

// 创建课程请求参数
export interface CreateCourseRequest {
  title: string;                 // 课程标题，必填
  description?: string;          // 课程描述，可选，最大10000字符
  coverImage?: string;           // 封面图片URL，可选
  techStack?: string[];          // 技术栈数组，可选，最多20个
  projectUrl?: string;           // 项目URL，可选，最大500字符
  demoUrl?: string;              // 演示地址，可选，最大500字符
  resources?: CourseResource[];  // 课程资源列表，可选
  tags?: string[];               // 标签数组，可选，最多15个
  rating?: number;               // 评分，可选，0-5分
  price?: number;                // 课程售价，可选
  originalPrice?: number;        // 课程原价，可选
  status: CourseStatus;          // 课程状态，必填
}

// 更新课程请求参数
export interface UpdateCourseRequest {
  title?: string;                // 课程标题，可选
  description?: string;          // 课程描述，可选，最大10000字符
  coverImage?: string;           // 封面图片URL，可选
  techStack?: string[];          // 技术栈数组，可选，最多20个
  projectUrl?: string;           // 项目URL，可选，最大500字符
  demoUrl?: string;              // 演示地址，可选，最大500字符
  resources?: CourseResource[];  // 课程资源列表，可选
  tags?: string[];               // 标签数组，可选，最多15个
  rating?: number;               // 评分，可选，0-5分
  price?: number;                // 课程售价，可选
  originalPrice?: number;        // 课程原价，可选
  status?: CourseStatus;         // 课程状态，可选
}

// 课程查询请求参数
export interface CourseQueryRequest {
  pageNum?: number;              // 页码，从1开始，默认为1
  pageSize?: number;             // 每页大小，默认为10
  status?: CourseStatus;         // 状态筛选，可选
  keyword?: string;              // 关键词搜索，可选
}

// ================ 管理员文章管理相关接口定义 ================

// 管理员文章查询请求参数
export interface AdminPostQueryRequest {
  pageNum?: number;              // 页码，从1开始，默认为1
  pageSize?: number;             // 每页大小，默认为10
}

// 管理员文章DTO（API返回的文章数据，包含作者名称和分类名称）
export interface AdminPostDTO {
  id: string;                    // 文章ID
  title: string;                 // 文章标题
  summary?: string;              // 文章概要
  coverImage?: string;           // 封面图片URL
  authorId: string;              // 作者ID
  authorName: string;            // 作者名称
  categoryId: string;            // 分类ID
  categoryName: string;          // 分类名称
  status: 'DRAFT' | 'PUBLISHED'; // 文章状态
  likeCount: number;             // 点赞数
  viewCount: number;             // 浏览数
  commentCount: number;          // 评论数
  isTop: boolean;                // 是否置顶
  publishTime?: string;          // 发布时间
  createTime: string;            // 创建时间
  updateTime: string;            // 更新时间
}

// ================ 管理员课程章节管理相关接口定义 ================

// 管理员课程章节DTO（API返回的完整章节数据）
export interface ChapterDTO {
  id: string;                    // 章节ID
  title: string;                 // 章节标题
  content: string;               // 章节内容（Markdown格式）
  courseId: string;              // 所属课程ID
  authorId: string;              // 作者ID
  sortOrder: number;             // 排序值
  readingTime?: number;          // 阅读时间（分钟），可选
  createTime: string;            // 创建时间
  updateTime: string;            // 更新时间
}

// 创建课程章节请求参数
export interface CreateChapterRequest {
  title: string;                 // 章节标题，必填，2-200字符
  content: string;               // 章节内容，必填，最少10个字符
  courseId: string;              // 所属课程ID，必填
  sortOrder: number;             // 排序值，必填
  readingTime?: number;          // 阅读时间（分钟），可选
}

// 更新课程章节请求参数
export interface UpdateChapterRequest {
  title: string;                 // 章节标题，必填，2-200字符
  content: string;               // 章节内容，必填，最少10个字符
  courseId: string;              // 所属课程ID，必填
  sortOrder: number;             // 排序值，必填
  readingTime?: number;          // 阅读时间（分钟），可选
}

// 查询课程章节列表请求参数
export interface ChapterQueryRequest {
  courseId: string;              // 课程ID，必填
  pageNum?: number;              // 页码，从1开始，默认为1
  pageSize?: number;             // 每页大小，默认为10
}

// ================ 管理员用户管理相关接口定义 ================

// 管理员用户查询请求参数
export interface AdminUserQueryRequest {
  pageNum?: number;              // 页码，从1开始，默认为1
  pageSize?: number;             // 每页大小，默认为10
  email?: string;                // 用户邮箱模糊搜索，可选
  name?: string;                 // 用户昵称模糊搜索，可选
  status?: 'ACTIVE' | 'INACTIVE'; // 用户状态过滤，可选
}

// 管理员视角的用户DTO（API返回的用户数据）
export interface AdminUserDTO {
  id: string;                    // 用户ID
  name: string;                  // 用户名称
  description?: string;          // 用户描述
  avatar?: string;               // 用户头像
  email: string;                 // 用户邮箱
  status: 'ACTIVE' | 'INACTIVE'; // 用户状态
  emailNotificationEnabled: boolean; // 邮箱通知是否启用
  maxConcurrentDevices: number;  // 最大并发设备数
  createTime: string;            // 创建时间
  updateTime: string;            // 更新时间
}

// 更新用户设备数量请求参数
export interface UpdateUserDeviceCountRequest {
  maxConcurrentDevices: number;  // 新的最大并发设备数，必须为正整数
}

// ================ 管理员设备会话相关接口定义 ================

// 活跃会话（IP维度）
export interface ActiveSessionDTO {
  ip: string;                    // IP 地址
  lastSeenTime: string;          // 最近活跃时间（ISO字符串）
  isCurrent: boolean;            // 是否为当前会话
}

// 管理员查看的用户会话汇总
export interface UserSessionSummaryDTO {
  userId: string;                // 用户ID
  username: string;              // 用户名
  email: string;                 // 邮箱
  maxDevices: number;            // 最大并发设备数
  activeIpCount: number;         // 活跃IP数量
  activeIps: ActiveSessionDTO[]; // 活跃IP列表
  isBanned: boolean;             // 是否被封禁
}

// 管理端会话查询参数
export interface AdminDeviceSessionQueryRequest {
  pageNum?: number;              // 页码
  pageSize?: number;             // 每页大小
  userId?: string;               // 过滤：用户ID
  username?: string;             // 过滤：用户名（模糊）
  ip?: string;                   // 过滤：IP
}

// Token 黑名单统计信息
export interface TokenBlacklistStatsDTO {
  totalBlacklistedTokens: number; // 当前黑名单中的token数量
  description: string;            // 描述信息
}

// 被拉黑用户查询请求
export interface BlacklistQueryRequest {
  pageNum?: number;               // 页码
  pageSize?: number;              // 每页大小
  username?: string;              // 用户名搜索
  email?: string;                 // 邮箱搜索
}

// 被拉黑用户信息 DTO
export interface BlacklistedUserDTO {
  userId: string;                 // 用户ID
  username: string;               // 用户名
  email: string;                  // 邮箱
  blacklistedAt?: number;         // 被拉黑时间戳（毫秒 or 秒，后端为Long）
  blacklistedTime?: string;       // 被拉黑时间（ISO字符串）
  tokenCount: number;             // 被拉黑token数量
  blacklistedTokens?: string[];   // 可选：被拉黑token列表
}

// ================ 前台课程相关接口定义 ================

// 前台课程查询请求参数
export interface AppCourseQueryRequest {
  pageNum?: number;              // 页码，从1开始，默认为1
  pageSize?: number;             // 每页大小，默认为10，最大为100
  keyword?: string;              // 课程标题关键词搜索，可选
  techStack?: string;            // 技术栈筛选，可选
  tags?: string;                 // 标签筛选，可选
}

// 前台课程列表DTO（API返回的课程数据）
export interface FrontCourseDTO {
  id: string;                    // 课程ID
  title: string;                 // 课程标题
  description: string;           // 课程描述
  coverImage?: string;           // 封面图片URL
  techStack: string[];           // 技术栈列表
  projectUrl?: string;           // 项目地址
  demoUrl?: string;              // 演示地址
  resources?: CourseResource[];  // 课程资源列表
  tags: string[];                // 标签列表
  rating: number;                // 评分
  status: CourseStatus;          // 课程状态
  authorName: string;            // 作者名称
  totalReadingTime: number;      // 总阅读时间（分钟）
  chapterCount: number;          // 章节数量
  price?: number;                // 当前售价（可选）
  originalPrice?: number;        // 原价（可选）
  createTime: string;            // 创建时间
}

// 前台课程详情章节信息
export interface FrontChapterDTO {
  id: string;                    // 章节ID
  title: string;                 // 章节标题
  sortOrder: number;             // 章节排序
  readingTime: number;           // 章节阅读时长（分钟）
  createTime: string;            // 章节创建时间
}

// 前台课程详情DTO（API返回的课程详细信息）
export interface FrontCourseDetailDTO {
  id: string;                    // 课程ID
  title: string;                 // 课程标题
  description: string;           // 课程描述
  coverImage?: string;           // 封面图片URL
  techStack: string[];           // 技术栈列表
  projectUrl?: string;           // 项目地址
  demoUrl?: string;              // 演示地址
  resources?: CourseResource[];  // 课程资源列表
  tags: string[];                // 标签列表
  rating: number;                // 评分
  price?: number;                // 课程售价
  originalPrice?: number;        // 课程原价
  status: CourseStatus;          // 课程状态
  authorName: string;            // 作者名称
  authorId: string;              // 作者ID
  totalReadingTime: number;      // 总阅读时长（分钟）
  createTime: string;            // 创建时间
  updateTime: string;            // 更新时间
  chapters: FrontChapterDTO[];   // 章节列表
}

// ================ 公开课程相关接口定义 ================

// 公开课程列表DTO（未登录可见，字段不含敏感信息，也无作者名与封面）
export interface PublicCourseDTO {
  id: string;
  title: string;
  description: string;
  techStack?: string[];
  tags?: string[];
  rating?: number;
  status: CourseStatus;
  totalReadingTime: number;
  chapterCount: number;
  originalPrice?: number;
  price?: number;
  demoUrl?: string;
  resources?: CourseResource[];
  createTime: string;
}

// 公开课程详情DTO（未登录可见，包含章节列表）
export interface PublicCourseDetailDTO {
  id: string;
  title: string;
  description: string;
  techStack?: string[];
  tags?: string[];
  rating?: number;
  status: CourseStatus;
  totalReadingTime: number;
  originalPrice?: number;
  price?: number;
  demoUrl?: string;
  resources?: CourseResource[];
  createTime: string;
  updateTime?: string;
  chapters: FrontChapterDTO[];
}

// ================ 管理员用户活动日志相关接口定义 ================

// 活动类型枚举（与后端ActivityType.java保持一致）
export type ActivityType =
  // 认证相关
  | 'LOGIN_SUCCESS'        // 登录成功
  | 'LOGIN_FAILED'         // 登录失败
  | 'REGISTER_SUCCESS'     // 注册成功
  | 'REGISTER_FAILED'      // 注册失败
  | 'LOGOUT'               // 用户登出
  | 'CHANGE_PASSWORD'      // 修改密码
  | 'RESET_PASSWORD'       // 重置密码
  // 内容浏览
  | 'VIEW_POST'            // 查看文章
  | 'VIEW_COURSE'          // 查看课程
  | 'VIEW_USER_PROFILE'    // 查看用户资料
  | 'SEARCH_CONTENT'       // 搜索内容
  // 内容创作
  | 'CREATE_POST'          // 发表文章
  | 'UPDATE_POST'          // 编辑文章
  | 'DELETE_POST'          // 删除文章
  | 'CREATE_COURSE'        // 创建课程
  | 'UPDATE_COURSE'        // 编辑课程
  | 'DELETE_COURSE'        // 删除课程
  // 社交互动
  | 'LIKE_POST'            // 点赞文章
  | 'UNLIKE_POST'          // 取消点赞文章
  | 'COMMENT_POST'         // 评论文章
  | 'DELETE_COMMENT'       // 删除评论
  | 'FOLLOW_USER'          // 关注用户
  | 'UNFOLLOW_USER'        // 取消关注用户
  | 'SHARE_POST'           // 分享文章
  // 学习行为
  | 'ENROLL_COURSE'        // 注册课程
  | 'COMPLETE_CHAPTER'     // 完成章节
  | 'START_LEARNING'       // 开始学习
  // 管理操作
  | 'ADMIN_LOGIN'          // 管理员登录
  | 'ADMIN_UPDATE_USER'    // 管理员更新用户
  | 'ADMIN_DELETE_POST'    // 管理员删除文章
  | 'ADMIN_UPDATE_COURSE'; // 管理员更新课程

// 活动分类枚举（与后端ActivityCategory.java保持一致）
export type ActivityCategory =
  | 'AUTHENTICATION'       // 认证相关
  | 'BROWSING'             // 内容浏览
  | 'CONTENT_CREATION'     // 内容创作
  | 'SOCIAL_INTERACTION'   // 社交互动
  | 'LEARNING'             // 学习行为
  | 'ADMINISTRATION'       // 管理操作
  | 'OTHER';               // 其他

// 目标类型枚举
export type TargetType =
  | 'POST'          // 文章相关操作
  | 'COURSE'        // 课程相关操作
  | 'USER'          // 用户相关操作
  | 'COMMENT'       // 评论相关操作
  | 'CATEGORY'      // 分类相关操作
  | null;           // 无特定目标

// 用户活动日志DTO（API返回的活动日志数据）
export interface UserActivityLogDTO {
  id: string;                    // 日志ID
  userId: string;                // 用户ID
  nickname: string;              // 用户昵称
  activityType: ActivityType;    // 活动类型
  activityTypeDesc?: string;     // 活动类型描述
  browser?: string;              // 浏览器信息
  equipment?: string;            // 设备信息
  ip?: string;                   // IP地址
  userAgent?: string;            // 用户代理
  failureReason?: string;        // 失败原因
  createTime: string;            // 创建时间
  targetType?: TargetType;       // 目标类型
  targetId?: string;             // 目标对象ID
  targetName?: string;           // 目标对象名称（如文章标题、课程名称等）
  requestPath?: string;          // 请求路径
  contextData?: string;          // 扩展上下文数据（JSON格式）
}

// 查询用户活动日志请求参数
export interface ActivityLogQueryRequest {
  pageNum?: number;              // 页码，从1开始，默认为1
  pageSize?: number;             // 每页大小，默认为10
  userId?: string;               // 用户ID筛选，可选
  activityType?: ActivityType;   // 活动类型筛选，可选（与activityCategory互斥）
  activityCategory?: ActivityCategory; // 活动分类筛选，可选（与activityType互斥）
  startTime?: string;            // 开始时间筛选，可选（格式：YYYY-MM-DD HH:mm:ss）
  endTime?: string;              // 结束时间筛选，可选（格式：YYYY-MM-DD HH:mm:ss）
  ip?: string;                   // IP地址模糊搜索，可选
}

// 前台章节详情DTO（API返回的章节详细信息）
export interface FrontChapterDetailDTO {
  id: string;                    // 章节ID
  title: string;                 // 章节标题
  content: string;               // 章节内容（Markdown格式）
  courseId: string;              // 所属课程ID
  courseName: string;            // 所属课程名称
  sortOrder: number;             // 章节排序
  readingTime: number;           // 章节阅读时长（分钟）
  createTime: string;            // 章节创建时间
  updateTime: string;            // 章节更新时间
}

// ================ 关注功能相关接口定义 ================

// 订阅目标类型
export type SubscribeTargetType = 'USER' | 'COURSE';

// 兼容性：保留旧的类型名称
export type FollowTargetType = SubscribeTargetType;

// 订阅/取消订阅切换请求参数
export interface SubscribeToggleRequest {
  targetId: string;                   // 目标ID，必填
  targetType: SubscribeTargetType;    // 目标类型，必填
}

// 兼容性：保留旧的接口名称作为类型别名
export type FollowToggleRequest = SubscribeToggleRequest;

// 订阅状态检查请求参数
export interface SubscribeStatusRequest {
  targetId: string;                   // 目标ID，必填
  targetType: SubscribeTargetType;    // 目标类型，必填
}

// 兼容性：保留旧的接口名称作为类型别名
export type FollowStatusRequest = SubscribeStatusRequest;

// 订阅状态检查响应
export interface SubscribeStatusResponse {
  isFollowing: boolean;                // 是否已订阅（为保持后端兼容性，字段名保持isFollowing）
  targetId: string;                    // 目标ID
  targetType: SubscribeTargetType;     // 目标类型
}

// 兼容性：保留旧的接口名称作为类型别名
export type FollowStatusResponse = SubscribeStatusResponse;

// 订阅切换响应
export interface SubscribeToggleResponse {
  isFollowing: boolean;                // 切换后的订阅状态（为保持后端兼容性，字段名保持isFollowing）
  targetId: string;                    // 目标ID
  targetType: SubscribeTargetType;     // 目标类型
  message?: string;                    // 操作结果消息
}

// 兼容性：保留旧的接口名称作为类型别名
export type FollowToggleResponse = SubscribeToggleResponse;

// ================ 用户关注管理列表 DTO ================

// 后端 FollowDTO（对接 UserFollowController 返回）
export interface FollowDTO {
  targetId: string;                // 目标ID（用户ID/课程ID）
  targetType: FollowTargetType;    // 目标类型 USER/COURSE
  targetName: string;              // 新增：目标名称（用户昵称/课程标题）
  targetAvatar?: string;           // 头像（当目标为用户时可用）
  targetCover?: string;            // 封面（当目标为课程时可用）
  authorId?: string;               // 课程作者ID（课程时可选）
  authorName?: string;             // 课程作者名称（课程时可选）
  description?: string;            // 简介（用户/课程通用可选）
  // 时间与状态字段（与后端 FollowDTO 对齐）
  followTime?: string;             // 关注/订阅时间（后端字段）
  unfollowTime?: string;           // 取消关注时间（可选）
  status?: string;                 // 状态，如 ACTIVE/INACTIVE
  // 兼容旧字段
  createTime?: string;             // 旧字段：创建时间
}

// 关注查询请求参数
export interface FollowQueryRequest {
  pageNum?: number;               // 页码，从1开始
  pageSize?: number;              // 每页数量
  keyword?: string;               // 关键字（按名称过滤，可选）
  targetType?: FollowTargetType;  // 目标类型（后端若要求，可携带）
}

// ================ 套餐管理相关接口定义 ================

// 套餐状态枚举
export type SubscriptionPlanStatus = 'ACTIVE' | 'INACTIVE';

// 套餐DTO（API返回的完整套餐数据）
export interface SubscriptionPlanDTO {
  id: string;                          // 套餐ID
  name: string;                        // 套餐名称
  level: number;                       // 套餐级别
  validityMonths: number;              // 有效期月数
  price: number;                       // 套餐价格
  originalPrice?: number;              // 原价（可选）
  recommended?: boolean;               // 是否推荐（可选）
  status: SubscriptionPlanStatus;      // 套餐状态
  benefits: string[];                  // 套餐权益列表
  createTime: string;                  // 创建时间
  updateTime: string;                  // 更新时间
}

// ================ 用户消息通知相关接口定义 ================

// 通知类型
export type NotificationType = 'COMMENT' | 'REPLY' | 'LIKE' | 'FOLLOW' | 'SYSTEM';

// 用户通知DTO
export interface UserNotificationDTO {
  id: string;                 // 通知ID
  type: NotificationType;     // 通知类型
  title: string;              // 标题
  content: string;            // 内容
  senderName?: string;        // 发送者名称（系统通知可为空）
  senderAvatar?: string;      // 发送者头像
  read: boolean;              // 是否已读
  createTime: string;         // 创建时间
}

// 通知查询请求
export interface NotificationQueryRequest {
  pageNum?: number;           // 页码，从1开始
  pageSize?: number;          // 每页大小
  type?: NotificationType;    // 类型过滤
  read?: boolean;             // 是否已读过滤（true/false）
}

// 未读数量响应
export interface UnreadCountResponse {
  unreadCount: number;
}

// 创建套餐请求参数
export interface CreateSubscriptionPlanRequest {
  name: string;                        // 套餐名称，必填，2-100字符
  level: number;                       // 套餐级别，必填，必须大于0
  validityMonths: number;              // 有效期月数，必填，必须大于0
  price: number;                       // 套餐价格，必填，不能为负数
  originalPrice?: number;              // 套餐原价，非负，可选
  recommended?: boolean;               // 是否推荐，可选
  benefits: string[];                  // 套餐权益列表，必填，1-20个权益
}

// 更新套餐请求参数（与创建请求相同）
export interface UpdateSubscriptionPlanRequest {
  name: string;                        // 套餐名称，必填，2-100字符
  level: number;                       // 套餐级别，必填，必须大于0
  validityMonths: number;              // 有效期月数，必填，必须大于0
  price: number;                       // 套餐价格，必填，不能为负数
  originalPrice?: number;              // 套餐原价，非负，可选
  recommended?: boolean;               // 是否推荐，可选
  benefits: string[];                  // 套餐权益列表，必填，1-20个权益
}

// 套餐查询请求参数
export interface SubscriptionPlanQueryRequest {
  pageNum?: number;                    // 页码，从1开始，默认为1
  pageSize?: number;                   // 每页大小，默认为10
  name?: string;                       // 套餐名称模糊搜索，可选
  level?: number;                      // 套餐级别筛选，可选
}

// ================ 套餐课程绑定管理相关接口定义 ================

// 简单套餐DTO（用于选择器）
export interface SimpleSubscriptionPlanDTO {
  id: string;                          // 套餐ID
  name: string;                        // 套餐名称
  level: number;                       // 套餐级别
}

// 简单课程DTO（用于穿梭框）
export interface SimpleCourseDTO {
  id: string;                          // 课程ID
  title: string;                       // 课程标题
}

// 更新套餐课程绑定请求参数
export interface UpdateSubscriptionPlanCoursesRequest {
  courseIds: string[];                 // 课程ID列表，可为空数组表示清空绑定
}

// ================ CDK管理相关接口定义 ================

// CDK类型枚举
export type CDKType = 'SUBSCRIPTION_PLAN' | 'COURSE';

// CDK状态枚举
export type CDKStatus = 'ACTIVE' | 'USED' | 'DISABLED';

// CDK数据传输对象
export interface CDKDTO {
  id: string;                          // CDK ID
  code: string;                        // 兑换码
  cdkType: CDKType;                    // CDK类型
  targetId: string;                    // 目标ID（套餐ID或课程ID）
  targetName: string;                  // 目标名称（套餐名称或课程名称）
  batchId: string;                     // 批次ID（同批生成的CDK共享）
  status: CDKStatus;                   // CDK状态
  usedByUserId?: string;               // 使用者用户ID（已使用时才有值）
  usedTime?: string;                   // 使用时间（已使用时才有值）
  createTime: string;                  // 创建时间
  updateTime: string;                  // 更新时间
}

// 创建CDK请求参数
export interface CreateCDKRequest {
  cdkType: CDKType;                    // CDK类型，必填
  targetId: string;                    // 目标ID，必填
  quantity: number;                    // 生成数量，必填，1-100
}

// CDK查询请求参数
export interface CDKQueryRequest {
  pageNum?: number;                    // 页码，从1开始，默认为1
  pageSize?: number;                   // 每页大小，默认为10
  cdkType?: CDKType;                   // CDK类型筛选，可选
  targetId?: string;                   // 目标ID筛选，可选
  status?: CDKStatus;                  // 状态筛选，可选
}

// ================ 系统配置管理相关接口定义 ================

// 系统配置类型枚举
export type SystemConfigType = 'DEFAULT_SUBSCRIPTION_PLAN' | 'EMAIL_TEMPLATE' | 'SYSTEM_MAINTENANCE' | 'USER_SESSION_LIMIT';

// 默认套餐配置数据结构
export interface DefaultSubscriptionConfig {
  subscriptionPlanId: string;           // 套餐ID，必填
}

// 系统配置数据传输对象
export interface SystemConfigDTO {
  id: string;                           // 配置ID
  type: SystemConfigType;               // 配置类型
  data: unknown;                        // 配置数据（根据类型不同而不同）
  description: string;                  // 配置描述
  createTime: string;                   // 创建时间
  updateTime: string;                   // 更新时间
}

// 更新系统配置请求参数
export interface UpdateSystemConfigRequest {
  data: unknown;                        // 配置数据，根据配置类型而定
}

// 用户会话限制配置（管理员可动态调整部分）
export type SessionEvictionPolicy = 'DENY_NEW' | 'EVICT_OLDEST';
export interface UserSessionLimitConfigData {
  maxActiveIps: number;                 // 默认最大并发活跃IP数 (1-10)
  policy: SessionEvictionPolicy;        // 超配额策略
  banTtlDays: number;                   // 封禁时长（天，0=永久）
}

// 用户会话限制固定参数（只读展示用）
export interface UserSessionLimitFixedParams {
  sessionTtlDays: number;               // 会话TTL: 30天
  historyWindowDays: number;            // 历史滑窗: 30天
  banThresholdIps: number;              // 封禁阈值: 10个IP
  heartbeatIntervalSeconds: number;     // 续活间隔: 60秒
}

// 最新章节DTO（首页展示用）
export interface LatestChapterDTO {
  id: string;                    // 章节ID
  title: string;                 // 章节标题
  courseId: string;              // 所属课程ID
  courseName: string;            // 所属课程名称
  sortOrder: number;             // 章节排序
  readingTime: number;           // 章节阅读时长（分钟）
  createTime: string;            // 章节创建时间
}

// 最新评论DTO（首页展示用）
export interface LatestCommentDTO {
  id: string;                    // 评论ID
  content: string;               // 评论内容
  businessId: string;            // 业务ID
  businessType: BusinessType;    // 业务类型
  businessName: string;          // 业务名称（文章标题或课程名称）
  commentUserId: string;         // 评论用户ID
  commentUserName: string;       // 评论用户名称
  commentUserAvatar?: string;    // 评论用户头像
  createTime: string;            // 评论创建时间
}

// ================ 更新日志管理相关接口定义 ================

// 更新日志状态枚举
export type UpdateLogStatus = 'DRAFT' | 'PUBLISHED';

// 变更类型枚举
export type ChangeType = 'FEATURE' | 'IMPROVEMENT' | 'BUGFIX' | 'BREAKING' | 'SECURITY' | 'OTHER';

// 变更详情数据传输对象
export interface ChangeDetailDTO {
  id?: string;                         // 变更详情ID（编辑时存在）
  type: ChangeType;                    // 变更类型，必填
  title: string;                       // 变更标题，必填，最大200字符
  description: string;                 // 变更描述，必填，最大2000字符
}

// 更新日志数据传输对象
export interface UpdateLogDTO {
  id: string;                          // 更新日志ID
  version: string;                     // 版本号
  title: string;                       // 更新标题
  description: string;                 // 更新描述
  status: UpdateLogStatus;             // 状态
  isImportant?: boolean;               // 是否重要更新
  publishTime?: string;                // 发布时间（已发布时才有值）
  createTime: string;                  // 创建时间
  updateTime: string;                  // 更新时间
  authorId: string;                    // 创建者ID
  authorName?: string;                 // 创建者名称
  changeDetails?: ChangeDetailDTO[];   // 变更详情列表（前端兼容字段）
  changes?: ChangeDetailDTO[];         // 变更详情列表（后端实际字段）
}

// 创建更新日志请求参数
export interface CreateUpdateLogRequest {
  version: string;                     // 版本号，必填，最大50字符
  title: string;                       // 更新标题，必填，最大200字符
  description: string;                 // 更新描述，必填，最大2000字符
  isImportant: boolean;                // 是否重要更新，必填
  changeDetails: ChangeDetailDTO[];    // 变更详情列表，必填，至少1个
}

// 更新更新日志请求参数
export interface UpdateUpdateLogRequest {
  version: string;                     // 版本号，必填，最大50字符
  title: string;                       // 更新标题，必填，最大200字符
  description: string;                 // 更新描述，必填，最大2000字符
  isImportant: boolean;                // 是否重要更新，必填
  changeDetails: ChangeDetailDTO[];    // 变更详情列表，必填，至少1个
}

// 管理员更新日志查询请求参数
export interface AdminUpdateLogQueryRequest {
  pageNum?: number;                    // 页码，从1开始，默认为1
  pageSize?: number;                   // 每页大小，默认为10
  status?: UpdateLogStatus;            // 状态筛选，可选
  version?: string;                    // 版本号模糊搜索，可选
  title?: string;                      // 标题模糊搜索，可选
}

// ================ 成员评价管理相关接口定义 ================

// 评价状态枚举
export type TestimonialStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PUBLISHED';

// 管理员评价DTO（API返回的完整评价数据）
export interface AdminTestimonialDTO {
  id: string;                          // 评价ID
  userId: string;                      // 用户ID
  userName: string;                    // 用户名称
  content: string;                     // 评价内容
  rating: number;                      // 评分（1-5分）
  status: TestimonialStatus;           // 评价状态
  sortOrder: number;                   // 排序权重
  createTime: string;                  // 创建时间
  updateTime: string;                  // 更新时间
}

// 评价查询请求参数
export interface QueryTestimonialRequest {
  pageNum?: number;                    // 页码，从1开始，默认为1
  pageSize?: number;                   // 每页大小，默认为10
  status?: TestimonialStatus;          // 状态筛选，可选
}

// 修改评价状态请求参数
export interface ChangeStatusRequest {
  status: TestimonialStatus;           // 目标状态，必填
}

// ================ 用户评价功能相关接口定义 ================

// 用户评价DTO（API返回的用户评价数据）
export interface TestimonialDTO {
  id: string;                          // 评价ID
  userId: string;                      // 用户ID
  content: string;                     // 评价内容
  rating: number;                      // 评分（1-5分）
  status: TestimonialStatus;           // 评价状态
  sortOrder: number;                   // 排序权重
  createTime: string;                  // 创建时间
  updateTime: string;                  // 更新时间
}

// 创建评价请求参数
export interface CreateTestimonialRequest {
  content: string;                     // 评价内容，必填，最大2000字符
  rating: number;                      // 评分，必填，1-5分
}

// 更新评价请求参数（与创建请求相同）
export interface UpdateTestimonialRequest {
  content: string;                     // 评价内容，必填，最大2000字符
  rating: number;                      // 评分，必填，1-5分
}

// 公开展示的评价DTO（营销页面用）
export interface PublicTestimonialDTO {
  id: string;                          // 评价ID
  userNickname: string;                // 用户昵称
  content: string;                     // 评价内容
  rating: number;                      // 评分（1-5分）
}

// ================ 订单管理相关接口定义 ================

// 订单类型枚举
export type OrderType = 'PURCHASE' | 'GIFT';

// 订单数据传输对象
export interface OrderDTO {
  id: string;                          // 订单ID
  orderNo: string;                     // 订单号
  userId: string;                      // 用户ID
  userName: string;                    // 用户名称
  cdkCode: string;                     // CDK代码
  productType: CDKType;                // 产品类型（SUBSCRIPTION_PLAN/COURSE）
  productId: string;                   // 产品ID
  productName: string;                 // 产品名称
  orderType: OrderType;                // 订单类型（PURCHASE/GIFT）
  amount: number;                      // 订单金额
  activatedTime?: string;              // 激活时间（可选）
  remark?: string;                     // 备注（可选）
  createTime: string;                  // 创建时间
}

// 订单查询请求参数
export interface OrderQueryRequest {
  pageNum?: number;                    // 页码，从1开始，默认为1
  pageSize?: number;                   // 每页大小，默认为10
  userId?: string;                     // 用户ID筛选，可选
  orderType?: OrderType;               // 订单类型筛选，可选
  productType?: CDKType;               // 产品类型筛选，可选
  productName?: string;                // 产品名称搜索，可选
  cdkCode?: string;                    // CDK代码搜索，可选
  startTime?: string;                  // 开始时间筛选，可选（格式：YYYY-MM-DD HH:mm:ss）
  endTime?: string;                    // 结束时间筛选，可选（格式：YYYY-MM-DD HH:mm:ss）
}

// 订单统计查询请求参数
export interface OrderStatisticsRequest {
  startTime?: string;                  // 开始时间，可选（格式：YYYY-MM-DD HH:mm:ss）
  endTime?: string;                    // 结束时间，可选（格式：YYYY-MM-DD HH:mm:ss）
}

// 订单统计数据传输对象
export interface OrderStatisticsDTO {
  totalCount: number;                  // 总订单数
  purchaseCount: number;               // 购买订单数
  giftCount: number;                   // 赠送订单数
  totalAmount: number;                 // 总金额（单位：元）
}

// ================ IP封禁管理相关接口定义 ================

// 被封禁IP数据传输对象
export interface BannedIpDTO {
  ip: string;                          // IP地址
  bannedUntil: string;                 // 封禁到期时间（ISO字符串格式）
  remainSeconds: number;               // 剩余封禁时间（秒）
}
