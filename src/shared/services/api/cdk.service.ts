import { apiClient, ApiResponse } from './config';
import {
  CDKDTO,
  CreateCDKRequest,
  CDKQueryRequest,
  PageResponse
} from '@shared/types';

/**
 * CDK管理API服务
 * 提供CDK的创建、查询、删除等管理功能
 */
export class CDKService {
  private static readonly BASE_PATH = '/admin/cdk';

  /**
   * 创建CDK
   * 支持批量生成CDK，可绑定套餐或课程
   * @param request 创建CDK请求参数
   * @returns 创建成功的CDK列表
   */
  static async createCDK(request: CreateCDKRequest): Promise<CDKDTO[]> {
    const response = await apiClient.post<ApiResponse<CDKDTO[]>>(this.BASE_PATH, request);
    return response.data.data;
  }

  /**
   * 分页获取CDK列表
   * 支持按类型、目标ID、状态等条件筛选
   * @param request 查询请求参数
   * @returns 分页CDK列表
   */
  static async getPagedCDKs(request: CDKQueryRequest): Promise<PageResponse<CDKDTO>> {
    const response = await apiClient.get<ApiResponse<PageResponse<CDKDTO>>>(this.BASE_PATH, {
      params: request
    });
    return response.data.data;
  }

  /**
   * 删除CDK
   * 删除指定的CDK（软删除），已使用的CDK不可删除
   * @param id CDK的ID
   */
  static async deleteCDK(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}`);
  }
}