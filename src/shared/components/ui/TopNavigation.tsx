import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  BookOpen,
  MessageSquare,
  Plus,
  Menu,
  X,
  Crown,
  LogOut,
  LayoutDashboard,
  Shield,
  Key,
  Bell,
  Newspaper,
  ListChecks
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { MembershipBadge, type MembershipTier } from './MembershipBadge';
import { SearchBar } from './SearchBar';
import { LogoutConfirmDialog } from './LogoutConfirmDialog';
import { cn } from '@shared/utils/cn';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  // DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { ROUTES } from '@shared/routes/routes';
import { RedeemCDKDialog } from '@shared/components/business/RedeemCDKDialog';
import { UserService } from '@shared/services/api';
import type { UserDTO } from '@shared/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useUserMenuCodes } from '@/hooks/useUserMenuCodes';
import { MENU_CODE } from '@shared/constants/menu-codes';
import { NotificationsService } from '@shared/services/api';

interface TopNavigationProps {
  className?: string;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({ className }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // 用户菜单码
  const { isAllowed } = useUserMenuCodes();

  // Navigation items（附带菜单码）
  const navigationItems = [
    {
      id: 'home',
      name: '首页',
      path: '/dashboard/home',
      icon: Home,
      description: '社区动态和推荐内容',
      code: MENU_CODE.DASHBOARD_HOME
    },
    {
      id: 'courses',
      name: '课程',
      path: '/dashboard/courses',
      icon: BookOpen,
      description: '专业技术课程',
      code: MENU_CODE.DASHBOARD_COURSES
    },
    {
      id: 'discussions',
      name: '讨论',
      path: '/dashboard/discussions',
      icon: MessageSquare,
      description: '技术讨论和问答',
      code: MENU_CODE.DASHBOARD_DISCUSSIONS
    },
    {
      id: 'ai-news',
      name: 'AI 日报',
      path: '/dashboard/ai-news',
      icon: Newspaper,
      description: '每日AI资讯精选',
      code: MENU_CODE.DASHBOARD_AI_NEWS
    },
    {
      id: 'interviews',
      name: '题库',
      path: '/dashboard/interviews',
      icon: ListChecks,
      description: '面试题与解答',
      code: MENU_CODE.DASHBOARD_INTERVIEWS
    },
  ];

  // 临时未读数（后续可接入通知中心/接口）
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchRole = async () => {
      if (!user) return;
      try {
        const info: UserDTO = await UserService.getCurrentUser();
        if (!cancelled) {
          setIsAdmin(info?.role === 'ADMIN');
        }
      } catch {
        // 静默失败，不影响其他功能
      }
    };
    fetchRole();
    return () => { cancelled = true; };
  }, [user]);

  // 轮询未读数量，并在通知变化时即时刷新
  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;
    const fetchUnread = async () => {
      try {
        if (!user) return;
        const count = await NotificationsService.getUnreadCount();
        if (!cancelled) setUnreadCount(Math.max(0, count));
      } catch { /* 静默失败 */ }
    };
    fetchUnread();
    timer = window.setInterval(fetchUnread, 60_000);
    const onChanged = () => { void fetchUnread(); };
    window.addEventListener('notifications:changed', onChanged as EventListener);
    return () => {
      cancelled = true;
      if (timer) window.clearInterval(timer);
      window.removeEventListener('notifications:changed', onChanged as EventListener);
    };
  }, [user?.id]);

  const isActiveRoute = (path: string) => {
    if (path === '/dashboard/home') {
      return location.pathname === '/dashboard/home' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const handleCreateContent = () => {
    navigate(ROUTES.USER_BACKEND_ARTICLES_CREATE);
  };

  const handleLogoClick = () => {
    navigate('/dashboard/home');
  };

  const handleLogoutConfirm = () => {
    setIsMobileMenuOpen(false); // 关闭移动端菜单（如果打开的话）
    logout();
  };

  return (
    <>
    <header
      className={cn(
        // 置顶在页面顶部，确保在内容之上
        "sticky top-0 z-40 w-full",
        // 增加不透明背景与毛玻璃，避免滚动时页面内容透出造成视觉重叠
        // 与营销页 Header 保持一致的感觉
        "bg-white/90 supports-[backdrop-filter]:bg-white/75 backdrop-blur border-b border-honey-border shadow-sm",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          {/* Left section: Logo + Brand + Membership */}
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <button
              onClick={handleLogoClick}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <img
                src="/logo.jpg"
                alt="敲鸭社区"
                className="h-10 w-10 rounded-xl"
              />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">
                  敲鸭
                </h1>
              </div>
            </button>

          </div>

          {/* Center section: Desktop Navigation 绝对居中 */}
          <nav className="hidden lg:flex items-center space-x-1 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {navigationItems.map((item) => {
              const disabled = !isAllowed(item.code);
              const isActive = isActiveRoute(item.path);
              if (disabled) {
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "relative px-4 py-2 rounded-xl font-medium text-sm",
                      "text-warm-gray-400 bg-transparent opacity-60 cursor-not-allowed"
                    )}
                    title="暂无菜单权限"
                  >
                    <div className="flex items-center space-x-2">
                      <item.icon className="h-4 w-4 text-warm-gray-400" />
                      <span>{item.name}</span>
                    </div>
                  </div>
                );
              }
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={cn(
                    "relative px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 group",
                    "hover:bg-honey-50 hover:text-honey-600",
                    isActive
                      ? "text-honey-600 bg-honey-100 shadow-sm"
                      : "text-warm-gray-600"
                  )}
                  title={item.description}
                >
                  <div className="flex items-center space-x-2">
                    <item.icon className={cn(
                      "h-4 w-4 transition-colors",
                      isActive ? "text-honey-600" : "text-warm-gray-500 group-hover:text-honey-500"
                    )} />
                    <span>{item.name}</span>
                  </div>
                </NavLink>
              );
            })}
          </nav>

          {/* Right section: Actions + User */}
          <div className="flex items-center space-x-3">
            {/* Create Content Button */}
            <Button
              onClick={handleCreateContent}
              className={cn(
                "hidden sm:flex items-center space-x-2 h-9 px-4",
                "bg-gradient-to-r from-honey-100 to-honey-200 hover:from-honey-200 hover:to-honey-300",
                "text-honey-800 shadow-md hover:shadow-lg transition-all duration-200",
                "border border-honey-200 focus:ring-2 focus:ring-honey-300/20"
              )}
            >
              <Plus className="h-4 w-4" />
              <span className="font-medium">发布</span>
            </Button>

            {/* Notification Bell */}
            {user && (
              <button
                onClick={() => navigate(ROUTES.USER_BACKEND_MESSAGES)}
                className={cn(
                  "relative p-2 rounded-xl transition-colors",
                  "hover:bg-honey-50 focus:outline-none focus:ring-2 focus:ring-honey-500/20"
                )}
                title="消息中心"
              >
                <Bell className="h-5 w-5 text-warm-gray-700" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white rounded-full h-4 min-w-[1rem] px-1 text-[10px] leading-4 text-center shadow">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* User Menu */}
            {user && (
              <div className="relative">
                <DropdownMenu open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "flex items-center space-x-3 p-2 rounded-xl transition-all duration-200",
                        "hover:bg-honey-50 focus:outline-none focus:ring-2 focus:ring-honey-500/20",
                        isUserMenuOpen && "bg-honey-50"
                      )}
                    >
                      <Avatar className="h-8 w-8 ring-2 ring-white shadow-sm">
                        <AvatarImage src={user.avatar || undefined} alt={user.name} />
                        <AvatarFallback>{(user.name || 'U').slice(0, 1).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      {/* 顶部导航不再展示会员徽章，避免与下拉菜单重复 */}
                      <div className="hidden sm:block text-left">
                        <p className="text-sm font-medium text-gray-900 leading-tight">{user.name}</p>
                        <p className="text-xs text-warm-gray-500 leading-tight">{user.email}</p>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72 rounded-2xl shadow-xl border border-honey-border p-0 overflow-hidden">
                    {/* 用户卡片（信息展示） */}
                    <div className="px-4 py-3 bg-white">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar || undefined} alt={user.name} />
                          <AvatarFallback>{(user.name || 'U').slice(0, 1).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
                          <div className="text-xs text-warm-gray-500 truncate">{user.email}</div>
                          <div className="mt-1">
                            <MembershipBadge
                              tier={user.membershipTier as MembershipTier}
                              size="sm"
                              text={user.currentSubscriptionPlanName || undefined}
                              level={user.currentSubscriptionPlanLevel as 1 | 2 | 3 | undefined}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <DropdownMenuSeparator />
                    <div className="py-1">
                      <DropdownMenuItem
                        onClick={() => { if (isAllowed(MENU_CODE.USER_BACKEND)) navigate(ROUTES.USER_BACKEND); }}
                        className={cn("cursor-pointer", !isAllowed(MENU_CODE.USER_BACKEND) && "opacity-60 pointer-events-none")}
                        aria-disabled={!isAllowed(MENU_CODE.USER_BACKEND)}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        <span>后台管理</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => { if (isAllowed(MENU_CODE.MEMBERSHIP)) navigate(ROUTES.MEMBERSHIP); }}
                        className={cn("cursor-pointer", !isAllowed(MENU_CODE.MEMBERSHIP) && "opacity-60 pointer-events-none")}
                        aria-disabled={!isAllowed(MENU_CODE.MEMBERSHIP)}
                      >
                        <Crown className="h-4 w-4" />
                        <span>套餐升级</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => { if (isAllowed(MENU_CODE.REDEEM_CDK)) setIsRedeemOpen(true); }}
                        className={cn("cursor-pointer", !isAllowed(MENU_CODE.REDEEM_CDK) && "opacity-60 pointer-events-none")}
                        aria-disabled={!isAllowed(MENU_CODE.REDEEM_CDK)}
                      >
                        <Key className="h-4 w-4" />
                        <span>CDK 激活</span>
                      </DropdownMenuItem>
                    </div>

                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <div className="py-1">
                          <DropdownMenuItem onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)} className="cursor-pointer text-yellow-700 hover:text-yellow-800">
                            <Shield className="h-4 w-4" />
                            <span>管理员后台</span>
                          </DropdownMenuItem>
                        </div>
                      </>
                    )}

                    <DropdownMenuSeparator />
                    <div className="py-1">
                      <DropdownMenuItem
                        onClick={() => setShowLogoutConfirm(true)}
                        className="cursor-pointer text-red-600 focus:text-red-700"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>退出登录</span>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden h-10 w-10 rounded-full hover:bg-honey-100"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu - 使用 Dialog 抽屉，避免遮罩层层级造成的点击失效 */}
        <Dialog open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <DialogContent hideClose className="p-0 max-w-[320px] left-0 top-0 bottom-0 translate-x-0 translate-y-0 h-screen w-[85vw] sm:w-[360px] rounded-none border-r lg:hidden">
            <div className="h-full flex flex-col bg-white">
              {/* Header */}
              <div className="px-4 py-3 border-b border-honey-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src="/logo.jpg" alt="Logo" className="h-8 w-8 rounded" />
                  <span className="font-bold">敲鸭</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile Search */}
              <div className="px-3 py-3 border-b border-honey-border">
                <SearchBar />
              </div>

              {/* Mobile Navigation */}
              <div className="flex-1 overflow-auto">
                <nav className="py-2 space-y-1">
                  {navigationItems.map((item) => {
                    const disabled = !isAllowed(item.code);
                    const isActive = isActiveRoute(item.path);
                    if (disabled) {
                      return (
                        <div
                          key={item.id}
                          className={cn(
                            "flex items-center space-x-3 px-4 py-3 rounded-xl font-medium",
                            "text-warm-gray-400 opacity-60 cursor-not-allowed"
                          )}
                          title="暂无菜单权限"
                        >
                          <item.icon className="h-5 w-5" />
                          <div>
                            <div className="text-sm font-medium">{item.name}</div>
                            <div className="text-xs text-warm-gray-500">{item.description}</div>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <NavLink
                        key={item.id}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors",
                          isActive
                            ? "text-honey-600 bg-honey-100"
                            : "text-warm-gray-600 hover:text-honey-600 hover:bg-honey-50"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        <div>
                          <div className="text-sm font-medium">{item.name}</div>
                          <div className="text-xs text-warm-gray-500">{item.description}</div>
                        </div>
                      </NavLink>
                    );
                  })}
                </nav>

                {/* Mobile Account Shortcuts */}
                <div className="pt-2 mt-2 border-t border-honey-border">
                  <div className="px-4 py-2 text-xs font-semibold text-warm-gray-500">我的入口</div>
                  <div className="space-y-1 pb-2">
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 text-warm-gray-600 hover:text-honey-600 hover:bg-honey-50 rounded-xl transition-colors"
                      onClick={() => {
                        if (isAllowed(MENU_CODE.USER_BACKEND)) {
                          navigate(ROUTES.USER_BACKEND);
                          setIsMobileMenuOpen(false);
                        }
                      }}
                      disabled={!isAllowed(MENU_CODE.USER_BACKEND)}
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      <span className="text-sm font-medium">后台管理</span>
                    </button>

                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 text-warm-gray-600 hover:text-honey-600 hover:bg-honey-50 rounded-xl transition-colors"
                      onClick={() => {
                        if (isAllowed(MENU_CODE.MEMBERSHIP)) {
                          navigate(ROUTES.MEMBERSHIP);
                          setIsMobileMenuOpen(false);
                        }
                      }}
                      disabled={!isAllowed(MENU_CODE.MEMBERSHIP)}
                    >
                      <Crown className="h-5 w-5" />
                      <span className="text-sm font-medium">套餐升级</span>
                    </button>

                    <button
                      className="w-full flex items-center gap-3 px-4 py-3 text-warm-gray-600 hover:text-honey-600 hover:bg-honey-50 rounded-xl transition-colors"
                      onClick={() => {
                        if (isAllowed(MENU_CODE.REDEEM_CDK)) {
                          setIsMobileMenuOpen(false);
                          setTimeout(() => setIsRedeemOpen(true), 50);
                        }
                      }}
                      disabled={!isAllowed(MENU_CODE.REDEEM_CDK)}
                    >
                      <Key className="h-5 w-5" />
                      <span className="text-sm font-medium">CDK 激活</span>
                    </button>

                    {isAdmin && (
                      <button
                        className="w-full flex items-center gap-3 px-4 py-3 text-yellow-700 hover:bg-yellow-50 rounded-xl transition-colors"
                        onClick={() => {
                          navigate(ROUTES.ADMIN_DASHBOARD);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <Shield className="h-5 w-5" />
                        <span className="text-sm font-medium">管理员后台</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Logout Section */}
              <div className="px-4 py-3 border-t border-honey-border">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:bg-red-50"
                  onClick={() => setShowLogoutConfirm(true)}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  退出登录
                </Button>
              </div>

              {/* Mobile Create Button */}
              <div className="p-4 border-t border-honey-border">
                <Button
                  onClick={() => {
                    handleCreateContent();
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-center space-x-2 h-11",
                    "bg-gradient-to-r from-honey-500 to-honey-600 hover:from-honey-600 hover:to-honey-700",
                    "text-white shadow-lg font-medium"
                  )}
                >
                  <Plus className="h-5 w-5" />
                  <span>发布内容</span>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 用户菜单由 DropdownMenu 管理焦点与关闭逻辑 */}
    </header>
    {/* 全局 Redeem CDK 对话框 */}
    <RedeemCDKDialog open={isRedeemOpen} onOpenChange={setIsRedeemOpen} />

    {/* 退出登录确认对话框 */}
    <LogoutConfirmDialog
      isOpen={showLogoutConfirm}
      onConfirm={handleLogoutConfirm}
      onCancel={() => setShowLogoutConfirm(false)}
    />
    </>
  );
};
