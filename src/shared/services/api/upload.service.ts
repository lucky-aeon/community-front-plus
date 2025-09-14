import { apiClient, ApiResponse } from './config';

// 文件上传响应接口
export interface UploadResponse {
  url: string;          // 上传后的文件URL
  filename: string;     // 文件名
  size: number;         // 文件大小（字节）
  type: string;         // 文件类型
  uploadId?: string;    // 上传ID（如果需要）
}

// 上传进度回调类型
export type UploadProgressCallback = (progress: number) => void;

// 支持的图片类型
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/gif',
  'image/webp',
  'image/svg+xml'
];

// 默认配置
export const UPLOAD_CONFIG = {
  maxSize: 5 * 1024 * 1024,      // 5MB
  maxSizeText: '5MB',
  supportedTypes: SUPPORTED_IMAGE_TYPES,
  supportedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
};

// 文件上传服务类
export class UploadService {

  /**
   * 验证文件类型和大小
   */
  static validateFile(file: File, config = UPLOAD_CONFIG): string | null {
    // 检查文件大小
    if (file.size > config.maxSize) {
      return `文件大小不能超过 ${config.maxSizeText}`;
    }

    // 检查文件类型
    if (!config.supportedTypes.includes(file.type)) {
      return `不支持的文件类型，请选择 ${config.supportedExtensions.join(', ')} 格式的文件`;
    }

    return null;
  }

  /**
   * 上传单个图片文件
   */
  static async uploadImage(
    file: File, 
    onProgress?: UploadProgressCallback
  ): Promise<UploadResponse> {
    // 验证文件
    const validationError = this.validateFile(file);
    if (validationError) {
      throw new Error(validationError);
    }

    // 创建FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'image'); // 标识上传类型

    try {
      const response = await apiClient.post<ApiResponse<UploadResponse>>(
        '/upload/image', 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          // 上传进度回调
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onProgress(progress);
            }
          },
          timeout: 60000, // 60秒超时
        }
      );

      return response.data.data;
    } catch (error: unknown) {
      console.error('图片上传失败:', error);
      
      // 类型守卫，检查error是否是AxiosError类型
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { message?: string } }; code?: string };
        
        if (axiosError.response?.status === 413) {
          throw new Error('文件过大，请选择更小的文件');
        } else if (axiosError.response?.status === 415) {
          throw new Error('不支持的文件格式');
        } else if (axiosError.code === 'ECONNABORTED') {
          throw new Error('上传超时，请检查网络连接');
        } else {
          throw new Error(axiosError.response?.data?.message || '上传失败，请稍后重试');
        }
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
    const results: UploadResponse[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const result = await this.uploadImage(file, (progress) => {
          onProgress?.(i, progress);
        });
        results.push(result);
      } catch (error) {
        console.error(`文件 ${file.name} 上传失败:`, error);
        throw error;
      }
    }

    return results;
  }

  /**
   * 从URL生成File对象（用于编辑时回显）
   */
  static async urlToFile(url: string, filename: string): Promise<File> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new File([blob], filename, { type: blob.type });
    } catch (error) {
      console.error('URL转File失败:', error);
      throw new Error('无法加载图片文件');
    }
  }

  /**
   * 生成图片预览URL
   */
  static createPreviewURL(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * 释放预览URL
   */
  static revokePreviewURL(url: string): void {
    URL.revokeObjectURL(url);
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
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // 计算新尺寸
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // 绘制压缩后的图片
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            reject(new Error('图片压缩失败'));
          }
        }, file.type, quality);
      };

      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = URL.createObjectURL(file);
    });
  }
}