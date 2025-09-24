import { apiClient, ApiResponse } from './config';
import { ResourceAccessService } from './resource-access.service';
import { PageResponse } from '@shared/types';
import { FollowDTO, FollowQueryRequest } from '@shared/types';

/**
 * 用户关注管理相关服务
 * 约定后端接口：
 * - GET /api/user/follows/users
 * - GET /api/user/follows/courses
 */
export class UserFollowsService {
  /**
   * 获取全部关注（用户+课程）列表
   * GET /api/user/follows
   * 不传 targetType，后端返回全部
   */
  static async getAllFollows(params: FollowQueryRequest = {}): Promise<PageResponse<FollowDTO>> {
    const res = await apiClient.get<ApiResponse<PageResponse<FollowDTO>>>('/user/follows', { params });
    const page = res.data.data;
    page.records = page.records.map((r) => {
      const coverFallback = (r as Record<string, unknown>)?.['courseCover'] as string | undefined;
      return {
        ...r,
        targetCover: ResourceAccessService.toAccessUrl(r.targetCover) || ResourceAccessService.toAccessUrl(coverFallback),
        targetAvatar: ResourceAccessService.toAccessUrl(r.targetAvatar),
      } as FollowDTO;
    });
    return page;
  }
  /**
   * 获取我关注的用户列表
   * GET /api/user/follows/users
   */
  static async getFollowedUsers(params: FollowQueryRequest = {}): Promise<PageResponse<FollowDTO>> {
    const res = await apiClient.get<ApiResponse<PageResponse<FollowDTO>>>('/user/follows', { params: { ...params, targetType: 'USER' } });
    const page = res.data.data;
    page.records = page.records.map((r) => ({
      ...r,
      targetAvatar: ResourceAccessService.toAccessUrl(r.targetAvatar),
    } as FollowDTO));
    return page;
  }

  /**
   * 获取我订阅的课程列表
   * GET /api/user/follows/courses
   */
  static async getFollowedCourses(params: FollowQueryRequest = {}): Promise<PageResponse<FollowDTO>> {
    const res = await apiClient.get<ApiResponse<PageResponse<FollowDTO>>>('/user/follows', { params: { ...params, targetType: 'COURSE' } });
    const page = res.data.data;
    page.records = page.records.map((r) => {
      const coverFallback = (r as Record<string, unknown>)?.['courseCover'] as string | undefined;
      return {
        ...r,
        targetCover: ResourceAccessService.toAccessUrl(r.targetCover) || ResourceAccessService.toAccessUrl(coverFallback),
      } as FollowDTO;
    });
    return page;
  }
}

export default UserFollowsService;
