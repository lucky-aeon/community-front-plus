import { apiClient, type ApiResponse } from './config';
import type { CreatorAboutPageDTO } from '@shared/types';

export class CreatorAboutService {
  private static readonly BASE_PATH = '/public/site';

  static async getAboutPage(): Promise<CreatorAboutPageDTO> {
    const response = await apiClient.get<ApiResponse<CreatorAboutPageDTO>>(`${this.BASE_PATH}/about`, {
      headers: {
        'X-Skip-Auth-Logout': 'true',
        'X-Skip-Error-Toast': 'true',
      },
    });
    return response.data.data;
  }
}
