# OAuth2 授权页面前端开发指南

## ✅ 已完成的工作

我已经为你创建了完整的前端 OAuth2 授权页面实现，包括：

### 1. 组件文件
📁 `/src/shared/components/business/OAuth2AuthorizePage.tsx`
- ✅ 完整的 OAuth2 授权页面UI组件
- ✅ 自动检测登录状态，未登录自动跳转登录页
- ✅ 展示客户端信息和请求的权限范围
- ✅ 支持用户同意/拒绝授权
- ✅ 调用后端API生成授权码
- ✅ 自动重定向回第三方应用

### 2. API Service
📁 `/src/shared/services/api/oauth2-authorization.service.ts`
- ✅ `generateAuthorizationCode()` - 生成授权码
- ✅ `getClientInfo()` - 获取客户端信息
- ✅ `checkConsent()` - 检查用户授权状态（可选）

### 3. 路由配置
- ✅ 更新了 `routes.ts` 添加 `OAUTH2_AUTHORIZE` 路由常量
- ✅ 更新了 `App.tsx` 添加路由映射 `/oauth2/authorize`

## 🎨 页面功能特性

### 自动登录检测
```typescript
// 未登录用户会自动跳转到登录页，登录后返回授权页面
if (!user) {
  const currentUrl = window.location.pathname + window.location.search;
  navigate(`/login?redirect=${encodeURIComponent(currentUrl)}`);
}
```

### 客户端信息展示
- 应用名称
- 客户端 ID
- 重定向地址
- 创建时间

### 权限范围选择
- 用户可以选择授予哪些权限
- 显示每个权限的详细说明
- 支持以下权限范围：
  - `openid` - 用户身份标识
  - `profile` - 基本资料
  - `email` - 邮箱地址
  - `read` - 读取数据
  - `write` - 写入数据

### 授权流程
1. **参数验证** - 验证 client_id、redirect_uri、response_type
2. **登录检查** - 未登录自动跳转登录
3. **获取客户端信息** - 展示应用详情
4. **用户授权** - 同意/拒绝授权
5. **生成授权码** - 调用后端 POST /authorize
6. **重定向** - 自动跳转回第三方应用

## 📝 使用说明

### 前端不需要额外开发
我已经完成了所有前端代码，你只需要：

1. **确认文件已创建**
   ```bash
   ls -la src/shared/components/business/OAuth2AuthorizePage.tsx
   ls -la src/shared/services/api/oauth2-authorization.service.ts
   ```

2. **启动前端项目**
   ```bash
   cd qiaoya-community-frontend
   npm run dev
   ```

3. **测试授权页面**
   访问：http://localhost:5173/oauth2/authorize?client_id=test&redirect_uri=http://example.com&response_type=code&scope=openid+profile

## 🧪 完整测试流程

### 步骤1：创建 OAuth2 客户端（管理后台）

访问管理后台创建一个测试客户端：

**请求：**
```bash
POST http://localhost:8520/api/admin/oauth2/clients
Authorization: Bearer {your_admin_token}
Content-Type: application/json

{
  "clientId": "test-app",
  "clientName": "测试应用",
  "redirectUris": ["http://localhost:3000/callback"],
  "grantTypes": ["authorization_code", "refresh_token"],
  "scopes": ["openid", "profile", "email"],
  "clientAuthenticationMethods": ["client_secret_post"],
  "accessTokenValiditySeconds": 3600,
  "refreshTokenValiditySeconds": 2592000,
  "requireProofKey": false,
  "requireAuthorizationConsent": true
}
```

**响应：**
```json
{
  "code": 200,
  "message": "创建成功，客户端密钥仅此一次返回，请妥善保管",
  "data": {
    "client": { ... },
    "clientSecret": "abc123..."  // 记住这个密钥！
  }
}
```

### 步骤2：模拟第三方应用发起授权

在浏览器中访问（或创建一个简单的HTML页面）：

```html
<!DOCTYPE html>
<html>
<head>
  <title>第三方应用 - OAuth2 测试</title>
</head>
<body>
  <h1>第三方应用</h1>
  <button onclick="startOAuth()">使用敲鸭社区账号登录</button>

  <div id="result"></div>

  <script>
    // 1. 发起授权
    function startOAuth() {
      const params = new URLSearchParams({
        client_id: 'test-app',
        redirect_uri: 'http://localhost:3000/callback',
        response_type: 'code',
        scope: 'openid profile email',
        state: generateRandomState()
      });

      window.location.href = `http://localhost:8520/api/public/oauth2/authorize?${params}`;
    }

    // 2. 处理回调
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code) {
      document.getElementById('result').innerHTML = `
        <h2>授权成功！</h2>
        <p>授权码: ${code}</p>
        <p>State: ${state}</p>
        <button onclick="exchangeToken('${code}')">换取 Access Token</button>
      `;
    }

    // 3. 换取 Token
    async function exchangeToken(code) {
      const response = await fetch('http://localhost:8520/api/public/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: 'test-app',
          client_secret: 'your_client_secret',  // 使用步骤1获得的密钥
          code: code,
          redirect_uri: 'http://localhost:3000/callback'
        })
      });

      const data = await response.json();
      document.getElementById('result').innerHTML += `
        <h2>Token 获取成功！</h2>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      `;
    }

    function generateRandomState() {
      return Math.random().toString(36).substring(2, 15);
    }
  </script>
</body>
</html>
```

### 步骤3：授权流程演示

1. **点击"使用敲鸭社区账号登录"按钮**
   - 浏览器跳转到 `http://localhost:8520/api/public/oauth2/authorize?...`

2. **后端检测登录状态**
   - 未登录 → 302 重定向到前端授权页面 `http://localhost:5173/oauth2/authorize?...`

3. **前端授权页面**
   - 检测未登录 → 跳转到登录页 `/login?redirect=/oauth2/authorize?...`
   - 用户登录后 → 自动返回授权页面

4. **授权同意页面**
   - 显示客户端信息："测试应用"
   - 显示权限范围：openid, profile, email
   - 用户点击"授权"按钮

5. **生成授权码**
   - 前端调用 `POST /api/public/oauth2/authorize`
   - 后端返回授权码：`{ "code": 200, "data": "auth_code_xyz" }`

6. **重定向回第三方应用**
   - 前端自动跳转：`http://localhost:3000/callback?code=auth_code_xyz&state=...`

7. **第三方应用换取 Token**
   - 使用授权码调用 `POST /api/public/oauth2/token`
   - 获得 Access Token 和 Refresh Token

## 🔧 配置说明

### 后端配置

`application.yml`:
```yaml
oauth2:
  frontend:
    authorize-url: ${OAUTH2_FRONTEND_AUTHORIZE_URL:http://localhost:5173/oauth2/authorize}
```

**生产环境：**
```bash
OAUTH2_FRONTEND_AUTHORIZE_URL=https://yourdomain.com/oauth2/authorize
```

### 前端环境变量

确保 API 地址正确配置（应该已经配置好了）：
```typescript
// src/shared/services/api/config.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8520';
```

## ⚠️ 注意事项

### 1. CORS 配置
确保后端允许前端域名的 CORS 请求：
```java
// Spring Boot 配置
@CrossOrigin(origins = "http://localhost:5173")
```

### 2. 登录重定向
登录页面需要支持 `redirect` 参数，登录成功后跳转回授权页面：
```typescript
// LoginPage.tsx 中应该已经实现
const redirect = searchParams.get('redirect');
if (redirect) {
  navigate(redirect);
}
```

### 3. 客户端重定向 URI 白名单
在创建 OAuth2 客户端时，必须准确配置 `redirectUris`，否则授权会失败。

### 4. 安全建议
- 生产环境使用 HTTPS
- State 参数用于防止 CSRF 攻击
- 授权码仅使用一次
- 定期轮转客户端密钥

## 📚 相关文档

- [OAuth2授权服务器实现总结.md](../../qiaoya-community-backend/docs/OAuth2授权服务器实现总结.md)
- [OAuth2授权服务器实现文档.md](../../qiaoya-community-backend/docs/OAuth2授权服务器实现文档.md)

## ✨ 下一步

前端开发已经全部完成！你可以：

1. **启动前后端项目进行测试**
   ```bash
   # 后端
   cd qiaoya-community-backend
   mvn spring-boot:run

   # 前端
   cd qiaoya-community-frontend
   npm run dev
   ```

2. **创建测试客户端** - 通过管理后台

3. **测试完整授权流程** - 使用上面的 HTML 测试页面

4. **根据需要调整 UI** - OAuth2AuthorizePage.tsx 组件

所有代码已经编写完成并编译通过，可以直接使用！🎉
