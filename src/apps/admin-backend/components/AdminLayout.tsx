import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Activity,
  Users, 
  Shield, 
  FileText, 
  MessageSquare, 
  Tag,
  BookOpen,
  Settings, 
  FileCheck,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleBackToFrontend = () => {
    navigate('/dashboard');
  };

  const navigationSections = [
    {
      title: '数据看板',
      items: [
        { id: 'overview', name: '总览', icon: BarChart3, path: '/dashboard/admin/overview' },
        { id: 'monitor', name: '实时监控', icon: Activity, path: '/dashboard/admin/monitor' }
      ]
    },
    {
      title: '用户管理',
      items: [
        { id: 'users', name: '用户列表', icon: Users, path: '/dashboard/admin/users' },
        { id: 'permissions', name: '权限管理', icon: Shield, path: '/dashboard/admin/permissions' }
      ]
    },
    {
      title: '内容管理',
      items: [
        { id: 'posts', name: '文章管理', icon: FileText, path: '/dashboard/admin/posts' },
        { id: 'comments', name: '评论管理', icon: MessageSquare, path: '/dashboard/admin/comments' },
        { id: 'categories', name: '分类管理', icon: Tag, path: '/dashboard/admin/categories' },
        { id: 'courses', name: '课程管理', icon: BookOpen, path: '/dashboard/admin/courses' }
      ]
    },
    {
      title: '系统管理',
      items: [
        { id: 'settings', name: '系统配置', icon: Settings, path: '/dashboard/admin/settings' },
        { id: 'logs', name: '操作日志', icon: FileCheck, path: '/dashboard/admin/logs' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}>
        {/* Header */}
        <div className={`flex items-center h-16 border-b border-gray-200 ${
          isCollapsed 
            ? 'justify-center px-2' 
            : 'justify-between px-6'
        }`}>
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBackToFrontend}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="返回前台"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-2">
                <img src="/logo.jpg" alt="Logo" className="h-8 w-8 rounded" />
                <h1 className="text-lg font-bold text-yellow-400">
                  管理后台
                </h1>
              </div>
            </div>
          )}
          {isCollapsed && (
            <img src="/logo.jpg" alt="Logo" className="h-8 w-8 rounded flex-shrink-0 object-contain" />
          )}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className={`lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 ${isCollapsed ? 'hidden' : ''}`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Collapse button for desktop */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1 shadow-md hover:shadow-lg transition-shadow"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4 text-gray-600" /> : <ChevronLeft className="h-4 w-4 text-gray-600" />}
        </button>

        {/* User info */}
        <div className={`p-6 border-b border-gray-200 ${isCollapsed ? 'px-2' : ''}`}>
          <div className="flex items-center space-x-3">
            <img
              src={user?.avatar}
              alt={user?.name}
              className={`rounded-full object-cover ${isCollapsed ? 'h-8 w-8 mx-auto' : 'h-12 w-12'}`}
            />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                <div className="flex items-center mt-1">
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-600 text-white">
                    管理员
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* 返回前台按钮 */}
          {!isCollapsed && (
            <div className="mt-4">
              <button
                onClick={handleBackToFrontend}
                className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回前台
              </button>
            </div>
          )}
          
          {isCollapsed && (
            <div className="mt-2">
              <button
                onClick={handleBackToFrontend}
                className="w-full flex items-center justify-center p-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                title="返回前台"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={`mt-6 flex-1 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {navigationSections.map((section, sectionIndex) => (
            <div key={section.title} className="mb-8">
              {!isCollapsed && (
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {section.title}
                </h3>
              )}
              {section.items.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) => `
                    w-full flex items-center justify-between text-sm font-medium rounded-lg transition-all duration-200 mb-1
                    ${isCollapsed ? 'px-2 py-3' : 'px-3 py-3'}
                    ${isActive
                      ? 'bg-yellow-50 text-yellow-800 border-l-4 border-yellow-400'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border-l-4 border-transparent'
                    }
                  `}
                  title={isCollapsed ? item.name : undefined}
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center">
                        <item.icon className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'}`} />
                        {!isCollapsed && (
                          <span>{item.name}</span>
                        )}
                      </div>
                      {!isCollapsed && isActive && (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
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
            <h2 className="text-lg font-semibold text-gray-900">管理后台</h2>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};