import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Folder,
  MessageSquare,
  Bell,
  Users,
  // Settings,
  User,
  Shield,
  Smartphone,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Star,
  BookOpen,
  Bookmark,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { MembershipBadge, type MembershipTier } from '@shared/components/ui/MembershipBadge';
import { UserService } from '@shared/services/api';
import type { UserDTO } from '@shared/types';
import { ConfirmDialog } from '@shared/components/common/ConfirmDialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useUserMenuCodes } from '@/hooks/useUserMenuCodes';
import { getMenuCodeByNavId } from '@shared/constants/menu-codes';
import { NotificationsService } from '@shared/services/api';

interface UserBackendLayoutProps {
  children: React.ReactNode;
}

export const UserBackendLayout: React.FC<UserBackendLayoutProps> = ({
  children
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const { isAllowed } = useUserMenuCodes();

  const handleBackToFrontend = () => {
    navigate('/dashboard');
  };

  const handleGoToAdmin = () => {
    navigate('/dashboard/admin');
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
  };

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
        // 静默失败
      }
    };
    fetchRole();
    return () => { cancelled = true; };
  }, [user?.id]);

  // 轮询未读数量，用于导航栏小红点
  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    const fetchUnread = async () => {
      try {
        if (!user) return;
        const count = await NotificationsService.getUnreadCount();
        if (!cancelled) setUnreadCount(Math.max(0, count));
      } catch {
        // 静默失败
      }
    };

    // 首次加载 + 轮询
    fetchUnread();
    timer = window.setInterval(fetchUnread, 60_000);

    // 监听通知变更事件（标记已读/清空等后立即刷新）
    const onChanged = () => { void fetchUnread(); };
    window.addEventListener('notifications:changed', onChanged as EventListener);

    return () => {
      cancelled = true;
      if (timer) window.clearInterval(timer);
      window.removeEventListener('notifications:changed', onChanged as EventListener);
    };
  }, [user?.id]);

  const navigationSections = [
    {
      title: '总览',
      items: [
        { id: 'overview', name: '看板', icon: LayoutDashboard, path: '/dashboard/user-backend/overview' },
      ]
    },
    {
      title: '内容管理',
      items: [
        { id: 'articles', name: '我的文章', icon: FileText, path: '/dashboard/user-backend/articles' },
        { id: 'interviews_user', name: '我的题库', icon: BookOpen, path: '/dashboard/user-backend/interviews' },
        { id: 'comments', name: '我的评论', icon: MessageSquare, path: '/dashboard/user-backend/comments' },
        { id: 'favorites', name: '我的收藏', icon: Bookmark, path: '/dashboard/user-backend/favorites' },
        { id: 'testimonial', name: '我的评价', icon: Star, path: '/dashboard/user-backend/testimonial' },
        { id: 'resources', name: '资源管理', icon: Folder, path: '/dashboard/user-backend/resources' },
        { id: 'learning', name: '我的学习', icon: BookOpen, path: '/dashboard/user-backend/learning' }
      ]
    },
    {
      title: '互动管理',
      items: [
        { id: 'messages', name: '消息中心', icon: Bell, path: '/dashboard/user-backend/messages' },
        { id: 'follows', name: '关注管理', icon: Users, path: '/dashboard/user-backend/follows' }
      ]
    },
    {
      title: '账户设置',
      items: [
        { id: 'profile', name: '个人信息', icon: User, path: '/dashboard/user-backend/profile' },
        { id: 'devices', name: '设备管理', icon: Smartphone, path: '/dashboard/user-backend/devices' },
        { id: 'authorizations', name: '授权管理', icon: Shield, path: '/dashboard/user-backend/authorizations' }
      ]
    }
  ];

  // 删除未使用的颜色函数

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 w-64
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBackToFrontend}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="返回前台"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">用户中心</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* 消息铃铛 */}
            <button
              onClick={() => navigate('/dashboard/user-backend/messages')}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="消息中心"
            >
              <Bell className="h-5 w-5 text-gray-700" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 bg-red-500 text-white rounded-full h-4 min-w-[1rem] px-1 text-[10px] leading-4 text-center"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            {/* 抽屉关闭（仅移动端显示） */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* User info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user?.avatar || '/avatars/avatar_1.png'} alt={user?.name || ''} />
              <AvatarFallback>{(user?.name || 'U').slice(0, 1).toUpperCase()}</AvatarFallback>
            </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                <div className="flex items-center mt-1">
                    <MembershipBadge
                      tier={(user?.membershipTier || 'basic') as MembershipTier}
                      size="sm"
                      text={user?.currentSubscriptionPlanName || undefined}
                      level={user?.currentSubscriptionPlanLevel as 1 | 2 | 3 | undefined}
                    />
                </div>
                {user?.tags && user.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {user.tags.slice(0, 5).map((t, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0.5">{t}</Badge>
                    ))}
                    {user.tags.length > 5 && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">+{user.tags.length - 5}</Badge>
                    )}
                  </div>
                )}
              </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 flex-1 flex flex-col">
          <div className="flex-1">
            {navigationSections.map((section) => (
              <div key={section.title} className="mb-8">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {section.title}
                </h3>
                {section.items.map((item) => {
                  const code = getMenuCodeByNavId(item.id) || '';
                  const disabled = code ? !isAllowed(code) : false;
                  if (disabled) {
                    return (
                      <div
                        key={item.id}
                        className={`
                          w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg mb-1 opacity-60 cursor-not-allowed
                          text-gray-400
                        `}
                        title="暂无菜单权限"
                      >
                        <div className="flex items-center">
                          <item.icon className="h-5 w-5 mr-3" />
                          <span>{item.name}</span>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      onClick={() => setIsSidebarOpen(false)}
                      className={({ isActive }) => `
                        w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 mb-1
                        ${isActive
                          ? 'bg-yellow-50 text-yellow-800 border-l-4 border-yellow-400'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }
                      `}
                    >
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center">
                            <item.icon className="h-5 w-5 mr-3" />
                            <span>{item.name}</span>
                          </div>
                          {isActive && (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>
          
          {/* 退出登录按钮 */}
          <div className="pb-6">
            <div className="border-t border-gray-200 pt-4 space-y-2">
              {/* 管理员后台入口 */}
              {isAdmin && (
                <button
                  onClick={handleGoToAdmin}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                >
                  <Shield className="h-5 w-5 mr-3" />
                  <span>管理员后台</span>
                </button>
              )}
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <LogOut className="h-5 w-5 mr-3" />
                <span>退出登录</span>
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">用户中心</h2>
            <button
              onClick={() => navigate('/dashboard/user-backend/messages')}
              className="relative p-2 rounded-lg hover:bg-gray-100"
              title="消息中心"
            >
              <Bell className="h-5 w-5 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white rounded-full h-4 min-w-[1rem] px-1 text-[10px] leading-4 text-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>

      {/* 退出登录确认对话框 */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="退出登录"
        message="确定要退出当前账户吗？退出后需要重新登录才能访问。"
        confirmText="退出登录"
        cancelText="取消"
        variant="danger"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
};
