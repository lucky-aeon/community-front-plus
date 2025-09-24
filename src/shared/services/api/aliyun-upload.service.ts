import { apiClient, ApiResponse } from './config';
import {
  UploadCredentials,
  UploadCredentialsRequest,
  AliyunUploadResponse,
  UploadOptions,
  FileValidationResult,
  UploadConfig,
  IMAGE_UPLOAD_CONFIG
} from '@shared/types/upload.types';

/**
 * 阿里云OSS上传服务
 * 实现获取凭证、直传OSS、进度监控等功能
 */
export class AliyunUploadService {

  /**
   * 获取上传凭证
   * @param originalName 原始文件名
   * @param contentType 文件MIME类型
   */
  static async getUploadCredentials(
    originalName: string,
    contentType: string
  ): Promise<UploadCredentials> {
    const requestData: UploadCredentialsRequest = {
      originalName,
      contentType
    };

    const response = await apiClient.post<ApiResponse<UploadCredentials>>(
      '/user/resource/upload-credentials',
      requestData
    );

    return response.data.data;
  }

  /**
   * 直接上传文件到阿里云OSS
   * @param file 要上传的文件
   * @param credentials 上传凭证
   * @param options 上传选项
   */
  static async uploadToOSS(
    file: File,
    credentials: UploadCredentials,
    options: UploadOptions = {}
  ): Promise<AliyunUploadResponse> {
    try {
      // 构建FormData - 按照阿里云OSS标准顺序和字段名
      const formData = new FormData();

      // 按照阿里云OSS PostObject标准顺序添加字段
      // 先校验/重算签名，避免后端签名与返回的 policy/AK 不匹配
      const finalSignature = await AliyunUploadService.ensureValidSignature(credentials);

      formData.append('OSSAccessKeyId', credentials.accessKeyId);
      formData.append('policy', credentials.policy);
      // 阿里云表单字段名要求小写 signature
      formData.append('signature', finalSignature);
      formData.append('key', credentials.key);

      // 如果有回调参数
      if (credentials.callback) {
        formData.append('callback', credentials.callback);
      }

      // STS安全令牌
      formData.append('x-oss-security-token', credentials.securityToken);

      // 推荐指定成功返回码，避免无回调时 204 语义不清
      formData.append('success_action_status', '200');

      // 文件必须最后添加
      formData.append('file', file);

      // 创建XMLHttpRequest以支持上传进度/取消
      const xhr = new XMLHttpRequest();
      // 暴露给上层用于取消
      try { options.onCreateXhr?.(xhr); } catch {}

      return new Promise<AliyunUploadResponse>((resolve, reject) => {
        // 上传进度监听
        if (options.onProgress) {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded * 100) / event.total);
              options.onProgress!(progress);
            }
          });
        }

        // 上传完成
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              // OSS回调会返回资源信息
              const response = JSON.parse(xhr.responseText) as unknown;

              // 兼容多种回调结构，优先提取资源ID
              const resourceId = ((): string => {
                // 常见：{ resourceId: '...', ... } 或 { id: '...' }
                const respObj = response as Record<string, unknown>;
                if (typeof respObj?.resourceId === 'string') return respObj.resourceId as string;
                if (typeof respObj?.id === 'string') return respObj.id as string;
                // 你的后端：{ Status: 'OK', resource: { id: '...' , ... } }
                if (response && typeof response === 'object') {
                  const rr = response as Record<string, unknown>;
                  const r = (rr.resource ?? rr.data) as Record<string, unknown> | undefined;
                  if (r && typeof r.id === 'string') return r.id as string;
                  if (r && typeof r.resourceId === 'string') return r.resourceId as string;
                }
                return '';
              })();

              // 构建正确的OSS URL格式：https://{bucket}.{endpoint}/{key}
              const ossBaseUrl = credentials.endpoint.startsWith('http')
                ? credentials.endpoint
                : `https://${credentials.bucket}.${credentials.endpoint}`;

              const respObj = response as Record<string, unknown>;
              resolve({
                resourceId,
                url: (respObj.url as string) || `${ossBaseUrl}/${credentials.key}`,
                filename: (respObj.filename as string) || file.name,
                size: (respObj.size as number) || file.size,
                type: (respObj.type as string) || file.type,
                key: credentials.key
              });
            } catch (parseError) {
              // 如果没有回调或解析失败，使用默认响应
              // 构建正确的OSS URL格式：https://{bucket}.{endpoint}/{key}
              const ossBaseUrl = credentials.endpoint.startsWith('http')
                ? credentials.endpoint
                : `https://${credentials.bucket}.${credentials.endpoint}`;

              resolve({
                resourceId: '', // 需要后续获取
                url: `${ossBaseUrl}/${credentials.key}`,
                filename: file.name,
                size: file.size,
                type: file.type,
                key: credentials.key
              });
            }
          } else {
            reject(new Error(`上传失败: HTTP ${xhr.status}`));
          }
        });

        // 上传取消
        xhr.addEventListener('abort', () => {
          reject(new Error('上传已取消'));
        });

        // 上传错误
        xhr.addEventListener('error', () => {
          reject(new Error('网络错误，上传失败'));
        });

        // 上传超时
        xhr.addEventListener('timeout', () => {
          reject(new Error('上传超时，请重试'));
        });

        // 配置请求
        // 构建正确的OSS上传URL：https://{bucket}.{endpoint}/
        const ossUploadUrl = credentials.endpoint.startsWith('http')
          ? credentials.endpoint
          : `https://${credentials.bucket}.${credentials.endpoint}`;

        xhr.open('POST', ossUploadUrl);
        xhr.timeout = options.timeout || 60000; // 默认60秒超时

        // 发送请求
        xhr.send(formData);
      });

    } catch (error) {
      console.error('上传到OSS失败:', error);
      throw error;
    }
  }

  /**
   * 校验/重算签名，返回最终可用的 signature
   * - 计算规则：Base64(HMAC-SHA1(policyBase64, accessKeySecret))
   * - 如果无法在浏览器计算（极端环境），则回退使用后端返回的 signature
   */
  private static async ensureValidSignature(credentials: UploadCredentials): Promise<string> {
    const provided = credentials.signature;
    const secret = credentials.accessKeySecret;
    const policyBase64 = credentials.policy;

    // 没有临时密钥时无法校验，直接返回后端提供的签名
    if (!secret || !policyBase64) return provided;

    try {
      const computed = await this.hmacSha1Base64(policyBase64, secret);
      if (computed !== provided) {
        console.warn('[OSS] 后端签名与前端重算不一致，已自动使用前端重算值');
        return computed;
      }
      return provided;
    } catch (e) {
      // 计算失败则回退使用后端签名
      console.warn('[OSS] 浏览器无法计算签名，回退使用后端提供的 signature');
      return provided;
    }
  }

  /**
   * 使用 WebCrypto 计算 HMAC-SHA1 并返回 Base64 字符串
   */
  private static async hmacSha1Base64(message: string, secret: string): Promise<string> {
    const enc = new TextEncoder();
    const keyData = enc.encode(secret);
    const data = enc.encode(message);

    // 优先使用 Web Crypto
    const subtle = (globalThis.crypto && globalThis.crypto.subtle) ? globalThis.crypto.subtle : null;
    if (!subtle) throw new Error('WebCrypto not available');

    const key = await subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: { name: 'SHA-1' } },
      false,
      ['sign']
    );
    const signature = await subtle.sign('HMAC', key, data);
    return AliyunUploadService.arrayBufferToBase64(signature);
  }

  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    // btoa 期望 binary string
    return btoa(binary);
  }

  /**
   * 完整的文件上传流程（获取凭证 + 上传文件）
   * @param file 要上传的文件
   * @param options 上传选项
   */
  static async uploadFile(
    file: File,
    options: UploadOptions = {},
    config: UploadConfig = IMAGE_UPLOAD_CONFIG
  ): Promise<AliyunUploadResponse> {
    try {
      // 1. 验证文件
      const validation = this.validateFile(file, config);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // 2. 可选的图片压缩
      let fileToUpload = file;
      if (options.compress && this.isImageFile(file)) {
        try {
          fileToUpload = await this.compressImage(file, options.compressOptions);
        } catch (compressError) {
          console.warn('图片压缩失败，使用原文件:', compressError);
        }
      }

      // 3. 获取上传凭证
      const credentials = await this.getUploadCredentials(
        fileToUpload.name,
        fileToUpload.type
      );

      // 4. 上传到OSS
      const result = await this.uploadToOSS(fileToUpload, credentials, options);

      return result;

    } catch (error) {
      console.error('文件上传失败:', error);
      throw error;
    }
  }

  /**
   * 验证文件
   * @param file 文件对象
   * @param config 上传配置
   */
  static validateFile(file: File, config: UploadConfig): FileValidationResult {
    // 检查文件大小
    if (file.size > config.maxSize) {
      return {
        valid: false,
        error: `文件大小不能超过 ${config.maxSizeText}`
      };
    }

    // 检查文件类型
    if (!config.supportedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `不支持的文件类型，请选择 ${config.supportedExtensions.join(', ')} 格式的文件`
      };
    }

    return { valid: true };
  }

  /**
   * 判断是否为图片文件
   */
  static isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  /**
   * 压缩图片
   * @param file 图片文件
   * @param options 压缩选项
   */
  static async compressImage(
    file: File,
    options: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
    } = {}
  ): Promise<File> {
    const {
      maxWidth = 1200,
      maxHeight = 1200,
      quality = 0.8
    } = options;

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

  /**
   * 批量上传文件
   * @param files 文件数组
   * @param options 上传选项
   */
  static async uploadFiles(
    files: File[],
    options: UploadOptions & {
      onFileProgress?: (fileIndex: number, progress: number) => void;
    } = {}
  ): Promise<AliyunUploadResponse[]> {
    const results: AliyunUploadResponse[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const result = await this.uploadFile(file, {
          ...options,
          onProgress: (progress) => {
            options.onFileProgress?.(i, progress);
          }
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
      throw new Error('无法加载文件');
    }
  }

  /**
   * 生成文件预览URL
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
}
