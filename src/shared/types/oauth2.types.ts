/**
 * OAuth2 客户端相关类型定义
 */

/**
 * OAuth2 客户端状态
 */
export type OAuth2ClientStatus = 'ACTIVE' | 'SUSPENDED' | 'REVOKED';

/**
 * OAuth2 授权请求参数（驼峰命名）
 */
export interface OAuth2AuthorizeRequest {
  clientId: string;
  redirectUri: string;
  responseType: string;
  scope?: string;
  state?: string;
  codeChallenge?: string;
  codeChallengeMethod?: string;
  approved?: boolean;
}

/**
 * OAuth2 客户端信息响应（授权页面展示用）
 */
export interface OAuth2ClientInfo {
  id: string;
  clientId: string;
  clientName: string;
  redirectUris: string[];
  scopes: string[];
  requireAuthorizationConsent: boolean;
  createTime: string;
}

/**
 * OAuth2 客户端 DTO
 */
export interface OAuth2ClientDTO {
  /** 主键ID */
  id: string;
  /** 客户端ID */
  clientId: string;
  /** 客户端名称 */
  clientName: string;
  /** 重定向URI列表 */
  redirectUris: string[];
  /** 授权类型列表 */
  grantTypes: string[];
  /** 允许的Scope列表 */
  scopes: string[];
  /** 客户端认证方式列表 */
  clientAuthenticationMethods: string[];
  /** Access Token有效期（秒） */
  accessTokenValiditySeconds: number;
  /** Refresh Token有效期（秒） */
  refreshTokenValiditySeconds: number;
  /** 是否强制要求PKCE */
  requireProofKey: boolean;
  /** 是否需要用户授权同意 */
  requireAuthorizationConsent: boolean;
  /** 客户端状态 */
  status: OAuth2ClientStatus;
  /** 创建人用户ID */
  createdBy: string;
  /** 创建时间 */
  createTime: string;
  /** 更新时间 */
  updateTime: string;
}

/**
 * 创建 OAuth2 客户端请求
 */
export interface CreateOAuth2ClientRequest {
  /** 客户端ID（对外暴露，必须唯一） */
  clientId: string;
  /** 客户端名称 */
  clientName: string;
  /** 重定向URI列表 */
  redirectUris: string[];
  /** 授权类型列表 */
  grantTypes: string[];
  /** 允许的Scope列表 */
  scopes: string[];
  /** 客户端认证方式列表 */
  clientAuthenticationMethods: string[];
  /** Access Token有效期（秒） */
  accessTokenValiditySeconds: number;
  /** Refresh Token有效期（秒） */
  refreshTokenValiditySeconds: number;
  /** 是否强制要求PKCE */
  requireProofKey: boolean;
  /** 是否需要用户授权同意 */
  requireAuthorizationConsent: boolean;
}

/**
 * 更新 OAuth2 客户端请求（继承创建请求）
 */
export type UpdateOAuth2ClientRequest = CreateOAuth2ClientRequest;

/**
 * OAuth2 客户端查询请求
 */
export interface OAuth2ClientQueryRequest {
  /** 页码 */
  pageNum: number;
  /** 每页大小 */
  pageSize: number;
  /** 客户端名称（模糊查询） */
  clientName?: string;
  /** 客户端状态 */
  status?: OAuth2ClientStatus;
}

/**
 * 创建客户端响应（包含密钥）
 */
export interface CreateOAuth2ClientResponse {
  /** 客户端信息 */
  client: OAuth2ClientDTO;
  /** 客户端密钥（仅此一次返回） */
  clientSecret: string;
}

/**
 * 重新生成密钥响应
 */
export interface RegenerateSecretResponse {
  /** 客户端ID */
  clientId: string;
  /** 新密钥（仅此一次返回） */
  clientSecret: string;
}

/**
 * 常用的授权类型
 */
export const GRANT_TYPES = [
  {
    value: 'authorization_code',
    label: 'Authorization Code',
    description: '标准授权码模式，适用于服务端应用，安全性最高'
  },
  {
    value: 'refresh_token',
    label: 'Refresh Token',
    description: '用于刷新访问令牌，延长用户会话有效期'
  },
  {
    value: 'client_credentials',
    label: 'Client Credentials',
    description: '客户端凭证模式，适用于服务间调用，无用户参与'
  },
] as const;

/**
 * 常用的客户端认证方式
 */
export const CLIENT_AUTH_METHODS = [
  {
    value: 'client_secret_basic',
    label: 'Client Secret Basic',
    description: '使用 HTTP Basic 认证传递客户端凭证（推荐）'
  },
  {
    value: 'client_secret_post',
    label: 'Client Secret Post',
    description: '在请求体中传递客户端凭证'
  },
  {
    value: 'none',
    label: 'None (Public Client)',
    description: '公开客户端，无需密钥（如移动应用、SPA，需配合 PKCE）'
  },
] as const;

/**
 * 常用的 Scope
 */
export const SCOPES = [
  {
    value: 'openid',
    label: 'OpenID',
    description: 'OpenID Connect 标准，获取用户身份信息'
  },
  {
    value: 'profile',
    label: 'Profile',
    description: '访问用户基本资料（昵称、头像等）'
  },
  {
    value: 'email',
    label: 'Email',
    description: '访问用户邮箱地址'
  },
  {
    value: 'read',
    label: 'Read',
    description: '只读权限，可查看资源'
  },
  {
    value: 'write',
    label: 'Write',
    description: '写入权限，可创建和修改资源'
  },
] as const;

/**
 * 状态标签映射
 */
export const OAuth2ClientStatusMap: Record<OAuth2ClientStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  ACTIVE: { label: '激活', variant: 'default' },
  SUSPENDED: { label: '暂停', variant: 'secondary' },
  REVOKED: { label: '撤销', variant: 'destructive' },
};

/**
 * 用户授权信息 DTO
 * 用于展示用户已授权的第三方应用列表
 */
export interface UserAuthorizationDTO {
  /** 授权ID */
  id: string;
  /** 客户端ID */
  clientId: string;
  /** 客户端名称 */
  clientName: string;
  /** 客户端Logo URL */
  clientLogoUrl?: string;
  /** 客户端描述 */
  clientDescription?: string;
  /** 授权的权限范围 */
  scopes: string;
  /** Access Token 签发时间 */
  accessTokenIssuedAt: string;
  /** Access Token 过期时间 */
  accessTokenExpiresAt: string;
  /** Access Token 是否有效 */
  accessTokenValid: boolean;
  /** Refresh Token 过期时间 */
  refreshTokenExpiresAt?: string;
  /** 授权时间（创建时间） */
  createTime: string;
}

/**
 * 获取用户授权列表请求
 */
export interface GetUserAuthorizationsRequest {
  pageNum: number;
  pageSize: number;
}
