// 系统配置相关类型（系统设置模块专用）

export interface GithubOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[]; // 例：['read:user','user:email']
  authorizeBaseUri: string; // 默认 https://github.com/login/oauth/authorize
  tokenUri: string;         // 默认 https://github.com/login/oauth/access_token
  userApi: string;          // 默认 https://api.github.com/user
  emailApi: string;         // 默认 https://api.github.com/user/emails
  requireVerifiedEmailForMerge: boolean; // 邮箱合并策略
  fetchEmailFromApi: boolean;            // 是否从Email API拉取邮箱
  updateUserProfileIfEmpty: boolean;     // 是否在用户资料为空时用GitHub覆盖
}

