import { apiClient, ApiResponse } from './config';
import type { ActiveSessionDTO } from '../../types';

export interface MySessionOverview {
  activeIps: ActiveSessionDTO[];
  activeIpCount: number;
  maxDevices?: number;
}

/**
 * 用户端设备会话服务
 * 对接后端 DeviceSessionController 接口
 */
export class UserDeviceSessionService {
  /**
   * 获取当前用户的设备会话概览
   * 约定优先尝试：GET /api/user/sessions
   */
  static async getMySessionOverview(): Promise<MySessionOverview> {
    // 后端接口：GET /api/user/sessions/active -> [{ ip, lastSeenTime, current }]
    const res = await apiClient.get<ApiResponse<any[]>>('/user/sessions/active');
    const raw: any[] = Array.isArray(res.data?.data) ? res.data.data : [];
    const list: ActiveSessionDTO[] = raw.map((it) => ({
      ip: it.ip,
      lastSeenTime: it.lastSeenTime,
      isCurrent: Boolean(typeof it.isCurrent !== 'undefined' ? it.isCurrent : it.current),
    }));
    return {
      activeIps: list,
      activeIpCount: list.length,
    };
  }

  /**
   * 移除指定 IP 的会话（避免移除当前会话）
   * DELETE /api/user/sessions/ip/{ip}
   */
  static async removeByIp(ip: string): Promise<void> {
    // 后端接口：DELETE /api/user/sessions/active/{ip}
    await apiClient.delete<ApiResponse<void>>(`/user/sessions/active/${encodeURIComponent(ip)}`);
  }

  /**
   * 移除除当前设备外的其它会话
   * 优先尝试：DELETE /api/user/sessions/others
   * 兼容：DELETE /api/user/sessions/all?keepCurrent=true 或 DELETE /api/user/sessions/all
   */
  static async removeOthers(): Promise<void> {
    // 后端未提供批量接口，这里逐个移除非当前设备
    const overview = await this.getMySessionOverview();
    const others = (overview.activeIps || []).filter(s => !s.isCurrent);
    for (const s of others) {
      await this.removeByIp(s.ip);
    }
  }
}

export default UserDeviceSessionService;
