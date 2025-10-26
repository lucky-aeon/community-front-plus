import { AliyunUploadService } from './aliyun-upload.service';
import { ResourceAccessService } from './resource-access.service';
import {
  AliyunUploadResponse,
  UploadProgressCallback,
  UploadOptions,
  UploadConfig,
  IMAGE_UPLOAD_CONFIG,
  VIDEO_UPLOAD_CONFIG,
  SUPPORTED_IMAGE_TYPES
} from '@shared/types/upload.types';

// 文件上传响应接口（保持向下兼容）
export interface UploadResponse {
  url: string;          // 上传后的文件访问URL
  filename: string;     // 文件名
  size: number;         // 文件大小（字节）
  type: string;         // 文件类型
  uploadId?: string;    // 资源ID（用于访问）
  resourceId?: string;  // 资源ID（新增字段）
}

// 导出进度回调类型（保持兼容）
export type { UploadProgressCallback };

// 导出支持的图片类型（保持兼容）
export { SUPPORTED_IMAGE_TYPES };

// 默认配置（保持兼容但使用新的配置）
export const UPLOAD_CONFIG = {
  maxSize: IMAGE_UPLOAD_CONFIG.maxSize,
  maxSizeText: IMAGE_UPLOAD_CONFIG.maxSizeText,
  supportedTypes: IMAGE_UPLOAD_CONFIG.supportedTypes,
  supportedExtensions: IMAGE_UPLOAD_CONFIG.supportedExtensions
};

// 文件上传服务类
export class UploadService {

  /**
   * 验证文件类型和大小（保持向下兼容）
   */
  static validateFile(file: File, config = UPLOAD_CONFIG): string | null {
    const validation = AliyunUploadService.validateFile(file, config as UploadConfig);
    return validation.valid ? null : validation.error || '文件验证失败';
  }

  /**
   * 转换阿里云上传响应为兼容格式
   */
  private static convertAliyunResponse(aliyunResponse: AliyunUploadResponse): UploadResponse {
    return {
      url: aliyunResponse.resourceId
        ? ResourceAccessService.getResourceAccessUrl(aliyunResponse.resourceId)
        : aliyunResponse.url,
      filename: aliyunResponse.filename,
      size: aliyunResponse.size,
      type: aliyunResponse.type,
      uploadId: aliyunResponse.resourceId,
      resourceId: aliyunResponse.resourceId
    };
  }

  /**
   * 上传单个图片文件
   */
  static async uploadImage(
    file: File,
    options?: { onProgress?: UploadProgressCallback }
  ): Promise<UploadResponse> {
    try {
      const uploadOptions: UploadOptions = {
        onProgress: options?.onProgress,
        compress: true, // 默认开启图片压缩
        compressOptions: {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.8
        }
      };

      const aliyunResponse = await AliyunUploadService.uploadFile(file, uploadOptions);
      return this.convertAliyunResponse(aliyunResponse);

    } catch (error) {
      console.error('图片上传失败:', error);

      // 保持原有的错误处理格式
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('上传失败，请稍后重试');
      }
    }
  }

  /**
   * 上传多个图片文件
   */
  static async uploadImages(
    files: File[],
    onProgress?: (fileIndex: number, progress: number) => void
  ): Promise<UploadResponse[]> {
    try {
      const uploadOptions: UploadOptions & {
        onFileProgress?: (fileIndex: number, progress: number) => void;
      } = {
        onFileProgress: onProgress,
        compress: true,
        compressOptions: {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.8
        }
      };

      const aliyunResponses = await AliyunUploadService.uploadFiles(files, uploadOptions);
      return aliyunResponses.map(response => this.convertAliyunResponse(response));

    } catch (error) {
      console.error('批量图片上传失败:', error);
      throw error;
    }
  }

  /**
   * 上传单个视频文件
   */
  static async uploadVideo(
    file: File,
    options?: { onProgress?: UploadProgressCallback }
  ): Promise<UploadResponse> {
    try {
      const uploadOptions: UploadOptions = {
        onProgress: options?.onProgress,
        compress: false,
      };

      const aliyunResponse = await AliyunUploadService.uploadFile(
        file,
        uploadOptions,
        VIDEO_UPLOAD_CONFIG as UploadConfig
      );
      return this.convertAliyunResponse(aliyunResponse);

    } catch (error) {
      console.error('视频上传失败:', error);

      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('上传失败，请稍后重试');
      }
    }
  }

  /**
   * 从URL生成File对象（用于编辑时回显）
   */
  static async urlToFile(url: string, filename: string): Promise<File> {
    return AliyunUploadService.urlToFile(url, filename);
  }

  /**
   * 生成图片预览URL
   */
  static createPreviewURL(file: File): string {
    return AliyunUploadService.createPreviewURL(file);
  }

  /**
   * 释放预览URL
   */
  static revokePreviewURL(url: string): void {
    AliyunUploadService.revokePreviewURL(url);
  }

  /**
   * 压缩图片（可选功能）
   */
  static async compressImage(
    file: File,
    maxWidth: number = 1200,
    maxHeight: number = 1200,
    quality: number = 0.8
  ): Promise<File> {
    return AliyunUploadService.compressImage(file, {
      maxWidth,
      maxHeight,
      quality
    });
  }

  // === 新增功能（基于阿里云服务） ===

  /**
   * 上传单个文件（支持任意类型）
   */
  static async uploadFile(
    file: File,
    options?: UploadOptions,
    config?: UploadConfig
  ): Promise<UploadResponse> {
    try {
      const aliyunResponse = await AliyunUploadService.uploadFile(file, options, config as UploadConfig | undefined);
      return this.convertAliyunResponse(aliyunResponse);
    } catch (error) {
      console.error('文件上传失败:', error);
      throw error;
    }
  }

  /**
   * 检查文件类型
   */
  static isImageFile(file: File): boolean {
    return AliyunUploadService.isImageFile(file);
  }

  /**
   * 获取资源访问URL
   */
  static getResourceAccessUrl(resourceId: string): string {
    return ResourceAccessService.getResourceAccessUrl(resourceId);
  }

  /**
   * 下载资源文件
   */
  static downloadResource(resourceId: string, filename?: string): void {
    ResourceAccessService.downloadResource(resourceId, filename);
  }
}
