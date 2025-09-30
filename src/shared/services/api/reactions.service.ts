import { apiClient, type ApiResponse } from './config';

// 反应业务类型：与后端 ToggleReactionRequest.businessType 对齐
export type ReactionBusinessType = 'POST' | 'COURSE' | 'CHAPTER' | 'COMMENT' | 'MEETING' | 'AI_NEWS';

export interface ToggleReactionRequestBody {
  businessType: ReactionBusinessType;
  businessId: string;
  reactionType: string; // 表情 code
}

export interface ToggleReactionResponse {
  added: boolean; // true 表示本次是添加，false 表示取消
}

export interface ReactionUserDTO {
  userId: string;
  userName: string;
  userAvatar?: string;
}

export interface ReactionSummaryDTO {
  reactionType: string; // code
  count: number;
  userReacted?: boolean;
  users?: ReactionUserDTO[];
}

export class ReactionsService {
  /** 切换表情（需要登录） */
  static async toggle(body: ToggleReactionRequestBody): Promise<ToggleReactionResponse> {
    const res = await apiClient.post<ApiResponse<ToggleReactionResponse>>('/reactions/toggle', body);
    return (res.data?.data || { added: false }) as ToggleReactionResponse;
  }

  /** 获取单个业务对象的表情统计 */
  static async getSummary(businessType: ReactionBusinessType, businessId: string): Promise<ReactionSummaryDTO[]> {
    const res = await apiClient.get<ApiResponse<ReactionSummaryDTO[]>>(`/reactions/${encodeURIComponent(businessType)}/${encodeURIComponent(businessId)}`);
    return (res.data?.data || []) as ReactionSummaryDTO[];
  }

  /** 批量获取多个业务对象的表情统计（按业务ID映射） */
  static async getSummaryBatch(businessType: ReactionBusinessType, businessIds: string[]): Promise<Record<string, ReactionSummaryDTO[]>> {
    const params = new URLSearchParams({ businessIds: businessIds.join(',') });
    const res = await apiClient.get<ApiResponse<Record<string, ReactionSummaryDTO[]>>>(`/reactions/${encodeURIComponent(businessType)}/batch?${params.toString()}`);
    return (res.data?.data || {}) as Record<string, ReactionSummaryDTO[]>;
  }
}

