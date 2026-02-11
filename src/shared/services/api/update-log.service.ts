import { apiClient, type ApiResponse } from './config';
import type {
  UpdateLogDTO,
  CreateUpdateLogRequest,
  UpdateUpdateLogRequest,
  AdminUpdateLogQueryRequest,
  PageResponse
} from '@shared/types';

/**
 * 更新日志管理 API 服务
 * 提供管理员端更新日志的 CRUD 操作
 */
export class UpdateLogService {

  /**
   * 获取公开发布的更新日志列表（用户端）
   * @returns 更新日志列表
   */
  static async getPublicUpdateLogs(): Promise<UpdateLogDTO[]> {
    const response = await apiClient.get<ApiResponse<UpdateLogDTO[]>>('/app/update-logs');
    return response.data.data;
  }

  /**
   * 获取公开更新日志详情（用户端）
   * @param id 更新日志ID
   */
  static async getPublicUpdateLogDetail(id: string): Promise<UpdateLogDTO> {
    const response = await apiClient.get<ApiResponse<UpdateLogDTO>>(`/app/update-logs/${encodeURIComponent(id)}`);
    const data = response.data.data;
    if (data.changes && !data.changeDetails) {
      data.changeDetails = data.changes;
    }
    return data;
  }

  /**
   * 创建更新日志
   * @param request 创建请求参数
   * @returns 创建成功的更新日志信息
   */
  static async createUpdateLog(request: CreateUpdateLogRequest): Promise<UpdateLogDTO> {
    // 后端接口字段更新：请求体的 changeDetails 改为 changes
    const { changeDetails, ...rest } = request as unknown as Record<string, unknown> & { changeDetails?: unknown };
    const payload = { ...rest, changes: changeDetails } as unknown;
    const response = await apiClient.post<ApiResponse<UpdateLogDTO>>('/admin/update-logs', payload);
    return response.data.data;
  }

  /**
   * 更新更新日志
   * @param id 更新日志ID
   * @param request 更新请求参数
   * @returns 更新后的更新日志信息
   */
  static async updateUpdateLog(id: string, request: UpdateUpdateLogRequest): Promise<UpdateLogDTO> {
    // 后端接口字段更新：请求体的 changeDetails 改为 changes
    const { changeDetails, ...rest } = request as unknown as Record<string, unknown> & { changeDetails?: unknown };
    const payload = { ...rest, changes: changeDetails } as unknown;
    const response = await apiClient.put<ApiResponse<UpdateLogDTO>>(`/admin/update-logs/${id}`, payload);
    return response.data.data;
  }

  /**
   * 获取更新日志详情
   * @param id 更新日志ID
   * @returns 更新日志详细信息
   */
  static async getUpdateLog(id: string): Promise<UpdateLogDTO> {
    const response = await apiClient.get<ApiResponse<UpdateLogDTO>>(`/admin/update-logs/${id}`);
    const data = response.data.data;

    // 确保字段兼容性：如果 changes 存在但 changeDetails 不存在，则映射字段
    if (data.changes && !data.changeDetails) {
      data.changeDetails = data.changes;
    }

    return data;
  }

  /**
   * 删除更新日志
   * @param id 更新日志ID
   * @returns void
   */
  static async deleteUpdateLog(id: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/admin/update-logs/${id}`);
  }

  /**
   * 分页查询更新日志列表
   * @param request 查询请求参数
   * @returns 更新日志分页列表
   */
  static async getUpdateLogs(request: AdminUpdateLogQueryRequest): Promise<PageResponse<UpdateLogDTO>> {
    const response = await apiClient.get<ApiResponse<PageResponse<UpdateLogDTO>>>('/admin/update-logs', {
      params: request
    });
    const data = response.data.data;

    // 确保字段兼容性：为每个记录映射 changes 到 changeDetails
    if (data.records) {
      data.records = data.records.map(item => {
        if (item.changes && !item.changeDetails) {
          item.changeDetails = item.changes;
        }
        return item;
      });
    }

    return data;
  }

  /**
   * 切换更新日志状态
   * 在草稿和发布状态之间切换
   * @param id 更新日志ID
   * @returns 切换后的更新日志信息
   */
  static async toggleUpdateLogStatus(id: string): Promise<UpdateLogDTO> {
    const response = await apiClient.put<ApiResponse<UpdateLogDTO>>(`/admin/update-logs/${id}/toggle-status`);
    return response.data.data;
  }
}
