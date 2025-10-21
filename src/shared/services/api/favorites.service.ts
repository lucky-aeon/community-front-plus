import { apiClient, ApiResponse } from './config';
import {
  FavoriteListItemDTO,
  FavoriteStatusDTO,
  ToggleFavoriteRequest,
  MyFavoritesQueryRequest,
  BatchFavoriteRequest,
  PageResponse,
  FavoriteTargetType,
} from '@shared/types';

/**
 * 收藏服务类
 * 提供收藏的增删查功能
 */
export class FavoritesService {

  /**
   * 切换收藏状态
   * 未收藏->收藏，已收藏->取消收藏
   * POST /api/favorites/toggle
   */
  static async toggleFavorite(targetId: string, targetType: FavoriteTargetType): Promise<{ isFavorited: boolean }> {
    const params: ToggleFavoriteRequest = {
      targetId,
      targetType,
    };
    const response = await apiClient.post<ApiResponse<{ isFavorited: boolean }>>(
      '/favorites/toggle',
      params
    );
    return response.data.data;
  }

  /**
   * 查询收藏状态
   * 查询当前用户是否已收藏指定目标，并返回收藏数量
   * GET /api/favorites/status/{targetType}/{targetId}
   */
  static async getFavoriteStatus(targetId: string, targetType: FavoriteTargetType): Promise<FavoriteStatusDTO> {
    const response = await apiClient.get<ApiResponse<FavoriteStatusDTO>>(
      `/favorites/status/${targetType}/${targetId}`
    );
    return response.data.data;
  }

  /**
   * 批量查询收藏状态
   * POST /api/favorites/status/batch
   */
  static async batchGetFavoriteStatus(targets: { targetId: string; targetType: FavoriteTargetType }[]): Promise<FavoriteStatusDTO[]> {
    const params: BatchFavoriteRequest = { targets };
    const response = await apiClient.post<ApiResponse<FavoriteStatusDTO[]>>(
      '/favorites/status/batch',
      params
    );
    return response.data.data;
  }

  /**
   * 我的收藏列表（分页）
   * 查询当前用户的收藏列表，按收藏时间倒序
   * GET /api/favorites/my
   */
  static async getMyFavorites(params: MyFavoritesQueryRequest = {}): Promise<PageResponse<FavoriteListItemDTO>> {
    const response = await apiClient.get<ApiResponse<PageResponse<FavoriteListItemDTO>>>(
      '/favorites/my',
      { params }
    );
    return response.data.data;
  }

  /**
   * ============= 便捷方法 =============
   */

  /**
   * 收藏文章
   */
  static async togglePostFavorite(postId: string): Promise<{ isFavorited: boolean }> {
    return this.toggleFavorite(postId, 'POST');
  }

  /**
   * 收藏章节
   */
  static async toggleChapterFavorite(chapterId: string): Promise<{ isFavorited: boolean }> {
    return this.toggleFavorite(chapterId, 'CHAPTER');
  }

  /**
   * 收藏评论
   */
  static async toggleCommentFavorite(commentId: string): Promise<{ isFavorited: boolean }> {
    return this.toggleFavorite(commentId, 'COMMENT');
  }

  /**
   * 收藏题目
   */
  static async toggleInterviewQuestionFavorite(questionId: string): Promise<{ isFavorited: boolean }> {
    return this.toggleFavorite(questionId, 'INTERVIEW_QUESTION');
  }
}
