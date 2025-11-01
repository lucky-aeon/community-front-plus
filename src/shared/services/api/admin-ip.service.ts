import { apiClient, ApiResponse } from './config';
import { BannedIpDTO, BanIpRequest } from '@shared/types';

/**
 * 管理员IP封禁管理服务类
 * 提供被封禁IP查询和解封功能
 */
export class AdminIpService {

  /**
   * 获取当前被封禁的IP列表
   * GET /api/admin/ip-ban
   *
   * @description 获取系统中当前被封禁的所有IP地址列表
   * @returns Promise<BannedIpDTO[]> 被封禁IP列表数据
   */
  static async getBannedIps(): Promise<BannedIpDTO[]> {
    const response = await apiClient.get<ApiResponse<BannedIpDTO[]>>('/admin/ip-ban');
    return response.data.data;
  }

  /**
   * 解除指定IP的封禁
   * DELETE /api/admin/ip-ban/{ip}
   *
   * @description 手动解除指定IP地址的封禁状态
   * @param ip 要解封的IP地址
   * @returns Promise<void> 操作结果，成功时无返回内容
   */
  static async unbanIp(ip: string): Promise<void> {
    await apiClient.delete(`/admin/ip-ban/${encodeURIComponent(ip)}`);
  }

  /**
   * 管理员封禁指定IP
   * POST /api/admin/ip-ban
   *
   * @description 手动封禁指定IP地址，时长由后端默认或请求参数决定
   */
  static async banIp(request: BanIpRequest): Promise<void> {
    await apiClient.post<ApiResponse<void>>('/admin/ip-ban', request);
  }
}
