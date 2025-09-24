import { apiClient, ApiResponse } from './config';
import {
  QueryTestimonialRequest,
  AdminTestimonialDTO,
  PageResponse,
  ChangeStatusRequest,
  TestimonialStatus
} from '@shared/types';

/**
 * 管理员评价管理服务类
 * 提供评价的审核、删除和排序管理功能
 */
export class AdminTestimonialService {

  /**
   * 分页查询所有学员评价
   * GET /api/admin/testimonials
   *
   * @description 管理员查看所有用户的评价，包含用户名和审核状态
   * @param params 查询参数，包含分页信息和状态筛选
   * @returns Promise<PageResponse<AdminTestimonialDTO>> 分页的评价列表数据
   */
  static async getAllTestimonials(params: QueryTestimonialRequest = {}): Promise<PageResponse<AdminTestimonialDTO>> {
    const response = await apiClient.get<ApiResponse<PageResponse<AdminTestimonialDTO>>>('/admin/testimonials', {
      params: {
        pageNum: params.pageNum || 1,
        pageSize: params.pageSize || 10,
        ...params.status && { status: params.status }
      }
    });
    return response.data.data;
  }

  /**
   * 修改评价状态
   * PUT /api/admin/testimonials/{testimonialId}/status
   *
   * @description 管理员审核评价，可以设置为通过、拒绝或发布状态
   * @param testimonialId 评价ID
   * @param status 目标状态
   * @returns Promise<AdminTestimonialDTO> 更新后的评价详情信息
   */
  static async changeTestimonialStatus(testimonialId: string, status: TestimonialStatus): Promise<AdminTestimonialDTO> {
    const requestData: ChangeStatusRequest = { status };
    const response = await apiClient.put<ApiResponse<AdminTestimonialDTO>>(`/admin/testimonials/${testimonialId}/status`, requestData);
    return response.data.data;
  }

  /**
   * 删除评价
   * DELETE /api/admin/testimonials/{testimonialId}
   *
   * @description 管理员删除不当或违规的评价
   * @param testimonialId 评价ID
   * @returns Promise<void> 删除操作结果
   */
  static async deleteTestimonial(testimonialId: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/admin/testimonials/${testimonialId}`);
  }

  /**
   * 设置评价排序权重
   * PUT /api/admin/testimonials/{testimonialId}/sort-order
   *
   * @description 管理员设置优质评价的排序权重，实现推荐置顶功能
   * @param testimonialId 评价ID
   * @param sortOrder 排序权重，数值越大排序越靠前
   * @returns Promise<AdminTestimonialDTO> 更新后的评价详情信息
   */
  static async updateSortOrder(testimonialId: string, sortOrder: number): Promise<AdminTestimonialDTO> {
    const response = await apiClient.put<ApiResponse<AdminTestimonialDTO>>(`/admin/testimonials/${testimonialId}/sort-order`, null, {
      params: { sortOrder }
    });
    return response.data.data;
  }

  /**
   * 获取评价状态的中文描述
   * @param status 评价状态
   * @returns 中文描述
   */
  static getStatusDescription(status: TestimonialStatus): string {
    const statusMap: Record<TestimonialStatus, string> = {
      'PENDING': '待审核',
      'APPROVED': '已通过',
      'REJECTED': '已拒绝',
      'PUBLISHED': '已发布'
    };
    return statusMap[status] || status;
  }

  /**
   * 获取评价状态对应的颜色类型
   * @param status 评价状态
   * @returns 用于Badge组件的颜色类型
   */
  static getStatusVariant(status: TestimonialStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
    const variantMap: Record<TestimonialStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      'PENDING': 'outline',
      'APPROVED': 'secondary',
      'REJECTED': 'destructive',
      'PUBLISHED': 'default'
    };
    return variantMap[status] || 'outline';
  }
}
