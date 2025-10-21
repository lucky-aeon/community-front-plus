import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { OAuth2AuthorizationService } from '@shared/services/api/oauth2-authorization.service';
import { OAuth2ClientInfo } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { ROUTES } from '@shared/routes/routes';

/**
 * OAuth2 授权页面组件
 *
 * 功能：
 * 1. 接收后端重定向的授权参数
 * 2. 检查用户登录状态（未登录则跳转登录）
 * 3. 获取客户端信息并展示
 * 4. 用户同意/拒绝授权
 * 5. 生成授权码并重定向回第三方应用
 */
export const OAuth2AuthorizePage: React.FC = () => {
  const { user, isInitializing } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL 参数
  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const responseType = searchParams.get('response_type');
  const scope = searchParams.get('scope');
  const state = searchParams.get('state');
  const codeChallenge = searchParams.get('code_challenge');
  const codeChallengeMethod = searchParams.get('code_challenge_method');

  // 组件状态
  const [client, setClient] = useState<OAuth2ClientInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authorizing, setAuthorizing] = useState(false);

  // 解析的 scope 列表
  const requestedScopes = scope ? scope.split(' ').filter(s => s) : [];

  // 检查必需参数
  useEffect(() => {
    if (!clientId || !redirectUri || responseType !== 'code') {
      setError('无效的授权请求：缺少必需参数或参数错误');
      setLoading(false);
      return;
    }
  }, [clientId, redirectUri, responseType]);

  // 检查登录状态
  useEffect(() => {
    if (isInitializing) return;

    if (!user) {
      // 未登录，跳转到登录页面，登录后返回此页面
      const currentUrl = window.location.pathname + window.location.search;
      navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(currentUrl)}`);
    }
  }, [user, isInitializing, navigate]);

  // 获取客户端信息
  useEffect(() => {
    if (!clientId || !user) return;

    const fetchClientInfo = async () => {
      try {
        setLoading(true);
        const clientInfo = await OAuth2AuthorizationService.getClientInfo(clientId);
        setClient(clientInfo);
      } catch (err: any) {
        console.error('Failed to fetch client info:', err);
        setError('获取客户端信息失败');
      } finally {
        setLoading(false);
      }
    };

    fetchClientInfo();
  }, [clientId, user]);

  // 处理授权同意
  const handleApprove = async () => {
    if (!clientId || !redirectUri || !client) return;

    try {
      setAuthorizing(true);

      // 调用后端生成授权码（使用请求的所有 scopes）
      const authCode = await OAuth2AuthorizationService.generateAuthorizationCode({
        clientId: clientId,
        redirectUri: redirectUri,
        responseType: 'code',
        scope: requestedScopes.join(' '),
        state: state || undefined,
        codeChallenge: codeChallenge || undefined,
        codeChallengeMethod: codeChallengeMethod || undefined,
        approved: true,
      });

      // 构建重定向 URL
      const redirectUrl = new URL(redirectUri);
      redirectUrl.searchParams.set('code', authCode);
      if (state) {
        redirectUrl.searchParams.set('state', state);
      }

      // 重定向回第三方应用
      window.location.href = redirectUrl.toString();
    } catch (err: any) {
      console.error('Authorization failed:', err);
      setError('授权失败');
      setAuthorizing(false);
    }
  };

  // 处理拒绝授权
  const handleDeny = () => {
    if (!redirectUri) return;

    // 构建错误重定向 URL
    const redirectUrl = new URL(redirectUri);
    redirectUrl.searchParams.set('error', 'access_denied');
    redirectUrl.searchParams.set('error_description', '用户拒绝授权');
    if (state) {
      redirectUrl.searchParams.set('state', state);
    }

    // 重定向回第三方应用
    window.location.href = redirectUrl.toString();
  };

  // 加载中或初始化中
  if (isInitializing || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-sm text-gray-600">正在加载授权信息...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              授权失败
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => navigate(ROUTES.DASHBOARD_HOME)} className="w-full">
              返回首页
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // 未登录（不应该到这里，因为上面有重定向）
  if (!user) {
    return null;
  }

  // 正常授权页面
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <ShieldCheck className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-center text-2xl">授权确认</CardTitle>
          <CardDescription className="text-center">
            <span className="font-semibold">{client?.clientName || clientId}</span> 正在请求访问您的账户
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 客户端信息 */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="text-sm">
              <span className="text-gray-600">应用名称：</span>
              <span className="font-medium ml-2">{client?.clientName}</span>
            </div>
          </div>

          {/* 提示信息 */}
          <Alert>
            <AlertDescription className="text-sm">
              授权后，该应用将能够代表您执行选中的操作。您可以随时在账户设置中撤销此授权。
            </AlertDescription>
          </Alert>
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleDeny}
            disabled={authorizing}
            className="flex-1"
          >
            拒绝
          </Button>
          <Button
            onClick={handleApprove}
            disabled={authorizing}
            className="flex-1"
          >
            {authorizing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                授权中...
              </>
            ) : (
              '授权'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
