import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { showToast } from '@shared/utils/toast';
import { AuthService } from '@shared/services/api/auth.service';
import { ROUTES } from '@shared/routes/routes';
import { Checkbox } from '@/components/ui/checkbox';
import { TermsModal, PrivacyModal } from '@shared/components/common/LegalModals';
// GitHub 登录入口已隐藏，如需恢复可重新引入服务

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const isLogin = mode === 'login';
  const isRegister = mode === 'register';
  const isForgot = mode === 'forgot';
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    code: '',
  });
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [cooldown, setCooldown] = useState(0); // seconds left

  const { login, registerOnly, sendRegisterCode, sendPasswordResetCode, resetPassword, isLoading } = useAuth();
  const [agree, setAgree] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setFormData(prev => ({
      email: prev.email,
      password: '',
      confirmPassword: '',
      code: '',
    }));
    setCooldown(0);
    setShowPassword(false);
    setShowConfirmPassword(false);
    if (nextMode !== 'register') {
      setAgree(false);
    }
  };

  useEffect(() => {
    if (isOpen && emailInputRef.current) {
      setTimeout(() => {
        emailInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 清理错误由 toast 提示，无需本地 error state

    try {
      // 基础邮箱校验（禁用原生校验后由我们负责提示）
      const email = formData.email.trim();
      const emailValid = /\S+@\S+\.[\S]+/.test(email);
      if (!email) {
        showToast.error('请填写邮箱');
        return;
      }
      if (!emailValid) {
        showToast.error('请输入有效的邮箱地址');
        return;
      }

      if (isLogin) {
        if (!formData.password) {
          showToast.error('请输入密码');
          return;
        }
        await login(email, formData.password);
        // 仅当确认已登录成功（token 与 user 已写入）时才导航
        if (!AuthService.isLoggedIn()) return;
        // 若 URL 中包含 redirect（例如 OAuth 授权流程），优先安全跳转该地址
        try {
          const params = new URLSearchParams(window.location.search);
          const raw = params.get('redirect');
          if (raw) {
            let decoded = raw;
            try { decoded = decodeURIComponent(raw); } catch (_) {}
            const url = new URL(decoded, window.location.origin);
            if (url.origin === window.location.origin) {
              window.location.assign(url.pathname + url.search + url.hash);
              return; // 结束后续导航逻辑
            }
          }
        } catch (_) {
          // 忽略解析错误，继续按默认导航
        }
        const stored = AuthService.getStoredUser();
        const level = (stored as any)?.currentSubscriptionLevel;
        if (Number(level) === 1) {
          navigate(ROUTES.DASHBOARD_COURSES, { replace: true });
        } else {
          navigate(ROUTES.DASHBOARD_HOME, { replace: true });
        }
      } else if (isRegister) {
        if (!agree) {
          showToast.error('请先阅读并同意《服务条款》和《隐私政策》');
          return;
        }
        if (!formData.code) {
          showToast.error('请输入邮箱验证码');
          return;
        }
        if (!formData.password) {
          showToast.error('请设置登录密码');
          return;
        }
        if (formData.password.length < 6 || formData.password.length > 20) {
          showToast.error('密码长度需为 6-20 位');
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          showToast.error('两次输入的密码不一致');
          return;
        }
        await registerOnly(email, formData.code, formData.password);
        // 切换到登录表单并回填邮箱，不关闭弹窗
        switchMode('login');
        return; // 保持弹窗打开，等待用户登录
      } else {
        if (!formData.code) {
          showToast.error('请输入邮箱验证码');
          return;
        }
        if (!formData.password) {
          showToast.error('请设置新密码');
          return;
        }
        if (formData.password.length < 6 || formData.password.length > 20) {
          showToast.error('新密码长度需为 6-20 位');
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          showToast.error('两次输入的新密码不一致');
          return;
        }
        await resetPassword(email, formData.code, formData.password);
        switchMode('login');
        return;
      }
      onClose();
      setFormData({ email: '', password: '', confirmPassword: '', code: '' });
      setCooldown(0);
    } catch (error) {
      // 错误消息已经通过 axios 拦截器和 toast 显示了，不需要在组件中重复显示
      console.error('Authentication error:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // 发送验证码：调用后端接口并启动 5 分钟冷却
  const handleSendCode = async () => {
    const email = formData.email?.trim();
    if (!email) {
      showToast.error('请先填写邮箱');
      return;
    }
    const emailValid = /\S+@\S+\.[\S]+/.test(email);
    if (!emailValid) {
      showToast.error('请输入有效的邮箱地址');
      return;
    }
    if (cooldown > 0 || (!isRegister && !isForgot)) return;

    try {
      if (isRegister) {
        await sendRegisterCode(email);
      } else if (isForgot) {
        await sendPasswordResetCode(email);
      }
      // 启动 5 分钟倒计时
      setCooldown(300);
    } catch (e) {
      // 失败提示由 axios 拦截器统一处理，这里无需重复提示
      console.error('发送验证码失败', e);
    }
  };

  // 倒计时效果
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className="max-w-md max-h-[85vh] overflow-y-auto"
        // 禁止按下 ESC 或点击遮罩层时自动关闭，避免失败场景误关
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{isLogin ? '欢迎回来' : isRegister ? '创建账户' : '重置密码'}</DialogTitle>
          <DialogDescription>
            {isLogin
              ? '登录以访问您的专属课程'
              : isRegister
                ? '加入我们的社区，开始您的学习之旅'
                : '请输入验证码并设置新密码以找回账户'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 mt-2">
          {/* 邮箱 */}
          <div className="space-y-2">
            <Label htmlFor="auth-email">邮箱</Label>
            <div className="relative">
              <Input
                id="auth-email"
                ref={emailInputRef}
                type="email"
                name="email"
                placeholder="邮箱地址"
                value={formData.email}
                onChange={handleChange}
                required
                className="pl-12 pr-28"
                autoComplete="email"
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              {/* 发送验证码按钮（注册/找回密码且邮箱合法时显示） */}
              {(() => { const emailValid = /\S+@\S+\.\S+/.test(formData.email); return ((isRegister || isForgot) && emailValid) ? (
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isLoading || cooldown > 0}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-honey-700 hover:text-honey-800 focus:underline disabled:text-warm-gray-400 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {cooldown > 0 ? `重新发送(${cooldown}s)` : '发送验证码'}
                </button>
              ) : null })()}
            </div>
          </div>

          {/* 密码（登录态） */}
          {isLogin && (
            <div className="space-y-2 relative">
              <Label htmlFor="auth-password">密码</Label>
              <div className="relative">
                <Input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="密码"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="pl-12 pr-12"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  aria-label={showPassword ? '隐藏密码' : '显示密码'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 验证码输入（注册/找回密码） */}
          {(isRegister || isForgot) && (
            <div className="space-y-2">
              <Label htmlFor="auth-code">邮箱验证码</Label>
              <Input
                id="auth-code"
                type="text"
                name="code"
                placeholder="请输入收到的验证码"
                value={formData.code}
                onChange={handleChange}
                required
              />
            </div>
          )}

          {/* 设置密码（注册/找回密码） */}
          {(isRegister || isForgot) && (
            <>
              <div className="space-y-2 relative">
                <Label htmlFor="auth-set-password">{isRegister ? '设置密码' : '新密码'}</Label>
                <div className="relative">
                  <Input
                    id="auth-set-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder={isRegister ? '设置登录密码（6-20位）' : '请输入新密码（6-20位）'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pl-12 pr-12"
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    aria-label={showPassword ? '隐藏密码' : '显示密码'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="auth-confirm-password">{isRegister ? '确认密码' : '确认新密码'}</Label>
                <div className="relative">
                  <Input
                    id="auth-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder={isRegister ? '再次输入登录密码' : '再次输入新密码'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="pl-12 pr-12"
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    aria-label={showConfirmPassword ? '隐藏密码' : '显示密码'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* 条款勾选（注册态） */}
          {isRegister && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <Checkbox
                id="agree-terms"
                checked={agree}
                onCheckedChange={(v) => setAgree(Boolean(v))}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 data-[state=checked]:bg-honey-500 data-[state=checked]:border-honey-500 data-[state=checked]:text-white"
              />
              <label htmlFor="agree-terms" className="select-none">
                我已阅读并同意
                <button type="button" onClick={() => setTermsOpen(true)} className="text-honey-600 hover:underline mx-1">《服务条款》</button>
                和
                <button type="button" onClick={() => setPrivacyOpen(true)} className="text-honey-600 hover:underline mx-1">《隐私政策》</button>
              </label>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-honey-500 to-honey-600 hover:from-honey-600 hover:to-honey-700 text-white shadow-lg"
            size="lg"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLogin ? '登录' : isRegister ? '创建账户' : '重置密码'}
          </Button>
        </form>

        {/* 登录态的条款提示 */}
        {isLogin && (
          <div className="mt-3 text-center text-xs text-gray-500">
            登录即表示你已阅读并同意
            <button type="button" onClick={() => setTermsOpen(true)} className="text-honey-600 hover:underline mx-1">《服务条款》</button>
            和
            <button type="button" onClick={() => setPrivacyOpen(true)} className="text-honey-600 hover:underline mx-1">《隐私政策》</button>
          </div>
        )}

        <div className="mt-4 text-center text-sm text-gray-600 space-y-2">
          {isLogin && (
            <>
              <p>
                还没有账户？
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="ml-1 text-honey-600 hover:text-honey-700 font-semibold"
                >
                  立即注册
                </button>
              </p>
              <button
                type="button"
                onClick={() => switchMode('forgot')}
                className="text-honey-600 hover:text-honey-700 font-semibold"
              >
                忘记密码？
              </button>
            </>
          )}
          {isRegister && (
            <p>
              已经有账户了？
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="ml-1 text-honey-600 hover:text-honey-700 font-semibold"
              >
                立即登录
              </button>
            </p>
          )}
          {isForgot && (
            <p>
              想起密码了？
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="ml-1 text-honey-600 hover:text-honey-700 font-semibold"
              >
                返回登录
              </button>
            </p>
          )}
        </div>

        {/* 第三方登录入口已下线 */}
      </DialogContent>
      {/* 条款/隐私弹窗 */}
      <TermsModal open={termsOpen} onOpenChange={setTermsOpen} />
      <PrivacyModal open={privacyOpen} onOpenChange={setPrivacyOpen} />
    </Dialog>
  );
};
