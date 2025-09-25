// OAuth / GitHub 相关类型定义
import type { BackendUser } from '@shared/types';

export interface AuthorizeUrlDTO {
  url: string;
  state: string;
  expireAt: number;
}

export interface OAuthAuthDTO {
  token: string;
  expireAt: number;
  newUser: boolean;
  merged: boolean;
  user: BackendUser;
}

export interface UserSocialBindStatusDTO {
  bound: boolean;
  login?: string;
  avatarUrl?: string;
  provider?: string;
}

export interface AdminSocialAccountDTO {
  id: string;
  userId: string;
  userEmail: string;
  provider: string;
  login: string;
  avatarUrl: string;
  createTime: string;
}

export interface AdminSocialAccountQueryRequest {
  pageNum?: number;
  pageSize?: number;
  userId?: string;
  provider?: string;
  login?: string;
  startTime?: string; // ISO
  endTime?: string;   // ISO
}

