import { apiClient, ApiResponse } from './config';
import type { PageResponse } from '@shared/types';
import type { AdminSocialAccountDTO, AdminSocialAccountQueryRequest } from '@shared/types/oauth';

export class AdminSocialAccountsService {
  static async page(params: AdminSocialAccountQueryRequest): Promise<PageResponse<AdminSocialAccountDTO>> {
    const resp = await apiClient.get<ApiResponse<PageResponse<AdminSocialAccountDTO>>>('/admin/auth/social-accounts', { params });
    return resp.data.data;
  }

  static async get(id: string): Promise<AdminSocialAccountDTO> {
    const resp = await apiClient.get<ApiResponse<AdminSocialAccountDTO>>(`/admin/auth/social-accounts/${encodeURIComponent(id)}`);
    return resp.data.data;
  }

  static async unbind(id: string): Promise<void> {
    await apiClient.post<ApiResponse<void>>(`/admin/auth/social-accounts/${encodeURIComponent(id)}/unbind`);
  }
}

