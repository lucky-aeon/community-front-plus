import { apiClient, type ApiResponse } from './config';

export interface MobileReleaseDTO {
  platform: 'android';
  versionName: string;
  versionCode: number;
  minSupportedVersionCode: number;
  apkUrl: string;
  apkSha256?: string | null;
  fileSize?: number | null;
  forceUpdate: boolean;
  releaseNotes: string[];
  publishedAt?: string | null;
  source?: string | null;
  releaseUrl?: string | null;
  tagName?: string | null;
}

export class MobileReleaseService {
  static async getLatestAndroidRelease(): Promise<MobileReleaseDTO> {
    const resp = await apiClient.get<ApiResponse<MobileReleaseDTO>>('/public/mobile/releases/android/latest', {
      headers: {
        'X-Skip-Auth-Logout': 'true',
        'X-Skip-Error-Toast': 'true',
      },
    });
    return resp.data.data;
  }
}
