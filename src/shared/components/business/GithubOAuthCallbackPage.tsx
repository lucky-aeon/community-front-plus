import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GithubOAuthService } from '@shared/services/api/oauth-github.service';
import { AuthService } from '@shared/services/api/auth.service';
import { showToast } from '@shared/utils/toast';

export const GithubOAuthCallbackPage: React.FC = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(true);

  const query = useMemo(() => new URLSearchParams(search), [search]);

  useEffect(() => {
    const run = async () => {
      const code = query.get('code') || '';
      const state = query.get('state') || '';
      const mode = query.get('mode') || '';
      const isBinding = AuthService.isLoggedIn() || mode === 'bind';

      if (!code || !state) {
        showToast.error('GitHub 回调参数缺失');
        navigate('/', { replace: true });
        return;
      }

      try {
        if (isBinding) {
          await GithubOAuthService.bindGithub(code, state);
          showToast.success('GitHub 账号绑定成功');
          navigate('/dashboard', { replace: true });
        } else {
          const auth = await GithubOAuthService.publicCallback(code, state);
          const user = await AuthService.processOAuthLogin(auth);
          showToast.success('GitHub 登录成功');
          const level = (user as any)?.currentSubscriptionLevel;
          if (Number(level) === 1) {
            navigate('/dashboard/courses', { replace: true });
          } else {
            navigate('/dashboard/home', { replace: true });
          }
        }
      } catch (e) {
        // 错误提示已由拦截器兜底，但这里再给一层保障
        showToast.error('GitHub 授权处理失败，请重试');
        navigate('/', { replace: true });
      } finally {
        setProcessing(false);
      }
    };
    run();
  }, [query, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-lg font-medium">{processing ? '正在处理 GitHub 授权...' : '即将跳转...'}</div>
        <div className="text-sm text-muted-foreground mt-2">请稍候</div>
      </div>
    </div>
  );
};

export default GithubOAuthCallbackPage;
