// API服务导出文件
export { AuthService } from './auth.service';
export { PostsService } from './posts.service';  
export { UserService } from './user.service';
export { UploadService } from './upload.service';
export { CommentsService } from './comments.service';
export { apiClient, type ApiResponse } from './config';

// 导出类型定义
export type {
  LoginRequest,
  RegisterRequest,
  BackendUser,
  LoginResponse,
} from './auth.service';

export type {
  UpdateProfileRequest,
  ChangePasswordRequest,
  UserDTO,
} from '../../types';