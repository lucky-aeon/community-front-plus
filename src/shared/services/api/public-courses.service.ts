import { apiClient, ApiResponse } from './config';
import { PageResponse, PublicCourseDTO, PublicCourseDetailDTO } from '@shared/types';

/**
 * 公开课程查询服务（未登录首页使用）
 */
export class PublicCoursesService {
  /**
   * 分页查询公开课程列表
   * POST /api/public/courses/queries
   */
  static async getPublicCoursesList(params?: { pageNum?: number; pageSize?: number; }): Promise<PageResponse<PublicCourseDTO>> {
    const response = await apiClient.post<ApiResponse<PageResponse<PublicCourseDTO>>>(
      '/public/courses/queries',
      {
        pageNum: params?.pageNum ?? 1,
        pageSize: params?.pageSize ?? 1000,
      }
    );
    return response.data.data;
  }

  /**
   * 获取公开课程详情
   * GET /api/public/courses/{id}
   */
  static async getPublicCourseDetail(id: string): Promise<PublicCourseDetailDTO> {
    const response = await apiClient.get<ApiResponse<PublicCourseDetailDTO>>(`/public/courses/${id}`);
    const data = response.data.data;
    // 归一化数组字段，防止 UI 直接 .length 时报 null 错误
    return {
      ...data,
      techStack: data.techStack ?? [],
      tags: data.tags ?? [],
      resources: data.resources ?? [],
      chapters: data.chapters ?? [],
    } as PublicCourseDetailDTO;
  }
}
