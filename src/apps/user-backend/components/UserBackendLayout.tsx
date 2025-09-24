import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText,
  Folder,
  MessageSquare,
  Heart,
  Bell,
  Users,
  BarChart3,
  // Settings,
  User,
  Shield,
  Smartphone,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Star
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { MembershipBadge, type MembershipTier } from '@shared/components/ui/MembershipBadge';
import { UserService } from '@shared/services/api';
import type { UserDTO } from '@shared/types';
import { ConfirmDialog } from '@shared/components/common/ConfirmDialog';

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

  const navigationSections = [
    {
      title: '内容管理',
      items: [
        { id: 'articles', name: '我的文章', icon: FileText, path: '/dashboard/user-backend/articles' },
        { id: 'comments', name: '我的评论', icon: MessageSquare, path: '/dashboard/user-backend/comments' },
        { id: 'testimonial', name: '我的评价', icon: Star, path: '/dashboard/user-backend/testimonial' },
        { id: 'resources', name: '资源管理', icon: Folder, path: '/dashboard/user-backend/resources' },
        { id: 'favorites', name: '我的收藏', icon: Heart, path: '/dashboard/user-backend/favorites' }
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
      title: '数据统计',
      items: [
        { id: 'analytics', name: '内容数据', icon: BarChart3, path: '/dashboard/user-backend/analytics' }
      ]
    },
    {
      title: '账户设置',
      items: [
        { id: 'profile', name: '个人信息', icon: User, path: '/dashboard/user-backend/profile' },
        { id: 'devices', name: '设备管理', icon: Smartphone, path: '/dashboard/user-backend/devices' }
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
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="h-12 w-12 rounded-full object-cover"
            />
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
                {section.items.map((item) => (
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
                ))}
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
            <div className="w-10"></div>
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
