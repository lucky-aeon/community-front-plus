import { apiClient, ApiResponse } from './config';
import { ResourceAccessService } from './resource-access.service';
import {
  CreateCourseRequest,
  UpdateCourseRequest,
  CourseQueryRequest,
  CourseDTO,
  PageResponse,
  AppCourseQueryRequest,
  FrontCourseDTO,
  FrontCourseDetailDTO
} from '@shared/types';

// 课程管理服务类
export class CoursesService {
  
  /**
   * ============= 前台课程查询接口 =============
   */

  /**
   * 分页查询前台课程列表
   * POST /api/app/courses/queries
   */
  static async getFrontCoursesList(params?: AppCourseQueryRequest): Promise<PageResponse<FrontCourseDTO>> {
    const response = await apiClient.post<ApiResponse<PageResponse<FrontCourseDTO>>>('/app/courses/queries', {
      pageNum: params?.pageNum || 1,
      pageSize: params?.pageSize || 10,
      ...(params?.keyword && { keyword: params.keyword }),
      ...(params?.techStack && { techStack: params.techStack }),
      ...(params?.tags && { tags: params.tags })
    });
    const page = response.data.data;
    page.records = page.records.map(c => ({ ...c, coverImage: ResourceAccessService.toAccessUrl(c.coverImage) } as FrontCourseDTO));
    return page;
  }

  /**
   * 根据课程ID获取前台课程详情
   * GET /api/app/courses/{id}
   */
  static async getFrontCourseDetail(id: string): Promise<FrontCourseDetailDTO> {
    const response = await apiClient.get<ApiResponse<FrontCourseDetailDTO>>(`/app/courses/${id}`);
    const data = response.data.data;
    return { ...data, coverImage: ResourceAccessService.toAccessUrl(data.coverImage) } as FrontCourseDetailDTO;
  }

  /**
   * ============= 管理员课程管理接口 =============
   */

  /**
   * 创建新课程
   * POST /api/admin/courses
   */
  static async createCourse(params: CreateCourseRequest): Promise<CourseDTO> {
    const response = await apiClient.post<ApiResponse<CourseDTO>>('/admin/courses', params);
    const data = response.data.data;
    return { ...data, coverImage: ResourceAccessService.toAccessUrl(data.coverImage) } as CourseDTO;
  }

  /**
   * 更新课程信息
   * PUT /api/admin/courses/{id}
   */
  static async updateCourse(id: string, params: UpdateCourseRequest): Promise<CourseDTO> {
    const response = await apiClient.put<ApiResponse<CourseDTO>>(`/admin/courses/${id}`, params);
    const data = response.data.data;
    return { ...data, coverImage: ResourceAccessService.toAccessUrl(data.coverImage) } as CourseDTO;
  }

  /**
   * 删除课程（软删除）
   * DELETE /api/admin/courses/{id}
   */
  static async deleteCourse(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<null>>(`/admin/courses/${id}`);
  }

  /**
   * 获取课程详情
   * GET /api/admin/courses/{id}
   */
  static async getCourseById(id: string): Promise<CourseDTO> {
    const response = await apiClient.get<ApiResponse<CourseDTO>>(`/admin/courses/${id}`);
    const data = response.data.data;
    return { ...data, coverImage: ResourceAccessService.toAccessUrl(data.coverImage) } as CourseDTO;
  }

  /**
   * 分页查询课程列表（支持状态筛选和关键词搜索）
   * GET /api/admin/courses
   */
  static async getCoursesList(params?: CourseQueryRequest): Promise<PageResponse<CourseDTO>> {
    const response = await apiClient.get<ApiResponse<PageResponse<CourseDTO>>>('/admin/courses', {
      params: {
        pageNum: params?.pageNum || 1,
        pageSize: params?.pageSize || 10,
        ...(params?.status && { status: params.status }),
        ...(params?.keyword && { keyword: params.keyword })
      }
    });
    const page = response.data.data;
    page.records = page.records.map(c => ({ ...c, coverImage: ResourceAccessService.toAccessUrl(c.coverImage) } as CourseDTO));
    return page;
  }

  /**
   * ============= 实用工具方法 =============
   */

  /**
   * 根据状态获取状态显示文本
   * @param status 课程状态
   * @returns 状态显示文本
   */
  static getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'PENDING': '待更新',
      'IN_PROGRESS': '更新中',
      'COMPLETED': '已完成'
    };
    return statusMap[status] || '未知状态';
  }

  /**
   * 根据状态获取状态颜色变体
   * @param status 课程状态
   * @returns 状态颜色变体
   */
  static getStatusVariant(status: string): 'warning' | 'primary' | 'success' | 'default' {
    const variantMap: Record<string, 'warning' | 'primary' | 'success' | 'default'> = {
      'PENDING': 'warning',
      'IN_PROGRESS': 'primary',
      'COMPLETED': 'success'
    };
    return variantMap[status] || 'default';
  }

  /**
   * 格式化总阅读时间
   * @param minutes 分钟数
   * @returns 格式化的时间字符串
   */
  static formatReadingTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}分钟`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`;
    }
  }
}
