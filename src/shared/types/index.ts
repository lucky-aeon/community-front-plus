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
export interface ApiResponse<T = any> {
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