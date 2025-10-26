/**
 * 阿里云上传相关类型定义
 */

// 上传凭证接口 (对应后端 UploadCredentialsDTO)
export interface UploadCredentials {
  // STS临时凭证
  accessKeyId: string;
  accessKeySecret: string;
  securityToken: string;
  expiration: string;

  // OSS信息
  region: string;
  bucket: string;
  endpoint: string;

  // 上传策略和签名
  policy: string;
  signature: string;
  key: string;

  // 回调参数 (可选)
  callback?: string;

  // 兼容性字段
  uploadUrl?: string;
  fileKey?: string;
  expirationTime?: string;
  maxFileSize?: number;
}

// 上传凭证请求接口
export interface UploadCredentialsRequest {
  originalName: string;  // 原始文件名
  contentType: string;   // 文件MIME类型
}

// 阿里云上传响应接口
export interface AliyunUploadResponse {
  resourceId: string;    // 资源ID (由OSS回调后端生成)
  url: string;          // 访问URL
  filename: string;     // 文件名
  size: number;         // 文件大小
  type: string;         // 文件类型
  key: string;          // OSS文件key
}

// 上传进度回调类型
export type UploadProgressCallback = (progress: number) => void;

// 多文件上传进度回调类型
export type MultiFileUploadProgressCallback = (fileIndex: number, progress: number) => void;

// 资源信息接口
export interface ResourceInfo {
  id: string;           // 资源ID
  userId: string;       // 用户ID
  originalName: string; // 原始文件名
  fileKey: string;      // OSS文件key
  size: number;         // 文件大小
  format: string;       // 文件格式
  resourceType: ResourceType; // 资源类型
  createTime: string;   // 创建时间
  updateTime: string;   // 更新时间
}

// 资源类型枚举
export enum ResourceType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  AUDIO = 'AUDIO',
  OTHER = 'OTHER'
}

// 分页资源列表响应
export interface PagedResourceResponse {
  total: number;
  pageNum: number;
  pageSize: number;
  pages: number;
  records: ResourceInfo[];
}

// 资源查询请求
export interface ResourceQueryRequest {
  pageNum?: number;
  pageSize?: number;
  resourceType?: string;
}

// 上传配置接口
export interface UploadConfig {
  maxSize: number;              // 最大文件大小（字节）
  maxSizeText: string;          // 最大文件大小文本
  supportedTypes: string[];     // 支持的MIME类型
  supportedExtensions: string[]; // 支持的文件扩展名
}

// 上传选项接口
export interface UploadOptions {
  onProgress?: UploadProgressCallback;  // 进度回调
  maxRetries?: number;                  // 最大重试次数
  timeout?: number;                     // 超时时间（毫秒）
  compress?: boolean;                   // 是否压缩图片
  compressOptions?: {                   // 压缩选项
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  };
  // 新增：向上暴露 XHR 实例，用于取消上传
  onCreateXhr?: (xhr: XMLHttpRequest) => void;
}

// 文件验证结果
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

// 支持的图片类型
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/bmp'
] as const;

// 支持的视频类型
export const SUPPORTED_VIDEO_TYPES = [
  'video/mp4',
  'video/avi',
  'video/mov',
  'video/wmv',
  'video/flv',
  'video/webm',
  'video/mkv'
] as const;

// 支持的音频类型
export const SUPPORTED_AUDIO_TYPES = [
  'audio/mp3',
  'audio/wav',
  'audio/flac',
  'audio/aac',
  'audio/ogg',
  'audio/wma'
] as const;

// 支持的文档类型
export const SUPPORTED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'application/rtf'
] as const;

// 所有支持的文件类型
export const ALL_SUPPORTED_TYPES = [
  ...SUPPORTED_IMAGE_TYPES,
  ...SUPPORTED_VIDEO_TYPES,
  ...SUPPORTED_AUDIO_TYPES,
  ...SUPPORTED_DOCUMENT_TYPES
] as const;

// 默认上传配置
export const DEFAULT_UPLOAD_CONFIG: UploadConfig = {
  maxSize: 10 * 1024 * 1024,    // 10MB
  maxSizeText: '10MB',
  supportedTypes: [...SUPPORTED_IMAGE_TYPES],
  supportedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp']
};

// 图片上传配置
export const IMAGE_UPLOAD_CONFIG: UploadConfig = {
  maxSize: 5 * 1024 * 1024,     // 5MB
  maxSizeText: '5MB',
  supportedTypes: [...SUPPORTED_IMAGE_TYPES],
  supportedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp']
};

// 视频上传配置
export const VIDEO_UPLOAD_CONFIG: UploadConfig = {
  maxSize: 100 * 1024 * 1024,   // 100MB
  maxSizeText: '100MB',
  supportedTypes: [...SUPPORTED_VIDEO_TYPES],
  supportedExtensions: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv']
};

// 文档上传配置
export const DOCUMENT_UPLOAD_CONFIG: UploadConfig = {
  maxSize: 20 * 1024 * 1024,    // 20MB
  maxSizeText: '20MB',
  supportedTypes: [...SUPPORTED_DOCUMENT_TYPES],
  supportedExtensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.rtf']
};

// 无限制上传配置（供需要完全放开的场景使用，如 Markdown 聊天内）
export const NO_LIMIT_UPLOAD_CONFIG: UploadConfig = {
  maxSize: Number.POSITIVE_INFINITY as unknown as number, // 视为无限制
  maxSizeText: '不限',
  // 使用通配以放过类型校验；实际由服务端/OSS策略做最终限制
  supportedTypes: ['*/*'] as unknown as string[],
  supportedExtensions: ['*']
};
