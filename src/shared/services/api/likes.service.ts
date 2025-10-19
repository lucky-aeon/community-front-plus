import { apiClient, type ApiResponse } from './config';

export type LikeTargetType = 'POST' | 'COMMENT' | 'COURSE' | 'CHAPTER' | 'INTERVIEW_QUESTION';

export interface ToggleLikeRequestBody {
  targetType: LikeTargetType;
  targetId: string;
}

// 后端的状态DTO（不包含计数）
export interface ServerLikeStatusDTO {
  targetId: string;
  targetType: LikeTargetType;
  isLiked: boolean;
}

// 后端的计数DTO
export interface ServerLikeCountDTO {
  targetId: string;
  targetType: LikeTargetType;
  count: number;
}

// 前端统一回传给组件使用的状态
export interface LikeStatusDTO {
  liked: boolean;
  likeCount: number;
}

export class LikesService {
  /** 切换点赞状态（需要登录），仅返回 isLiked，计数需另查 */
  static async toggle(body: ToggleLikeRequestBody): Promise<{ isLiked: boolean }> {
    const res = await apiClient.post<ApiResponse<{ isLiked: boolean }>>('/likes/toggle', body);
    const data = (res.data?.data || {}) as { isLiked?: boolean };
    return { isLiked: !!data.isLiked };
  }

  /** 获取点赞状态（当前用户） */
  static async getStatus(targetType: LikeTargetType, targetId: string): Promise<{ isLiked: boolean }> {
    const res = await apiClient.get<ApiResponse<ServerLikeStatusDTO>>(`/likes/status/${encodeURIComponent(targetType)}/${encodeURIComponent(targetId)}`);
    const data = (res.data?.data || {}) as ServerLikeStatusDTO;
    return { isLiked: !!data.isLiked };
  }

  /** 获取点赞计数 */
  static async getCount(targetType: LikeTargetType, targetId: string): Promise<number> {
    const res = await apiClient.get<ApiResponse<ServerLikeCountDTO>>(`/likes/count/${encodeURIComponent(targetType)}/${encodeURIComponent(targetId)}`);
    const data = (res.data?.data || {}) as ServerLikeCountDTO;
    return Number(data.count || 0);
  }

  /** 便捷：同时获取状态与计数 */
  static async getStatusWithCount(targetType: LikeTargetType, targetId: string): Promise<LikeStatusDTO> {
    const [st, cnt] = await Promise.all([
      this.getStatus(targetType, targetId).catch(() => ({ isLiked: false })),
      this.getCount(targetType, targetId).catch(() => 0),
    ]);
    return { liked: !!st.isLiked, likeCount: Number(cnt || 0) };
  }
}
