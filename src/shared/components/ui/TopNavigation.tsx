import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  BookOpen,
  MessageSquare,
  Plus,
  Menu,
  X,
  Settings,
  LogOut,
  User,
  FileText,
  History
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { MembershipBadge } from './MembershipBadge';
import { cn } from '@/lib/utils';

interface TopNavigationProps {
  className?: string;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({ className }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Navigation items
  const navigationItems = [
    {
      id: 'home',
      name: '首页',
      path: '/dashboard/home',
      icon: Home,
      description: '社区动态和推荐内容'
    },
    {
      id: 'courses',
      name: '课程',
      path: '/dashboard/courses',
      icon: BookOpen,
      description: '专业技术课程'
    },
    {
      id: 'discussions',
      name: '讨论',
      path: '/dashboard/discussions',
      icon: MessageSquare,
      description: '技术讨论和问答'
    },
    {
      id: 'changelog',
      name: '更新',
      path: '/dashboard/changelog',
      icon: History,
      description: '产品更新日志'
    }
  ];

  const userMenuItems = [
    {
      id: 'profile',
      name: '个人资料',
      icon: User,
      action: () => navigate('/dashboard/user-backend/profile')
    },
    {
      id: 'my-content',
      name: '我的内容',
      icon: FileText,
      action: () => navigate('/dashboard/user-backend')
    },
    {
      id: 'settings',
      name: '设置',
      icon: Settings,
      action: () => navigate('/dashboard/user-backend/settings')
    },
    {
      id: 'logout',
      name: '退出登录',
      icon: LogOut,
      action: logout,
      className: 'text-red-600 hover:text-red-700 hover:bg-red-50'
    }
  ];

  const isActiveRoute = (path: string) => {
    if (path === '/dashboard/home') {
      return location.pathname === '/dashboard/home' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const handleCreateContent = () => {
    navigate('/dashboard/create-post');
  };

  const handleLogoClick = () => {
    navigate('/dashboard/home');
  };

  return (
    <header className={cn(
      "sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85",
      "border-honey-border shadow-sm",
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section: Logo + Brand + Membership */}
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <button
              onClick={handleLogoClick}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity group"
            >
              <div className="relative">
                <img
                  src="/logo.jpg"
                  alt="敲鸭社区"
                  className="h-10 w-10 rounded-xl shadow-sm group-hover:shadow-md transition-shadow"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-honey-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">
                  敲鸭
                </h1>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const isActive = isActiveRoute(item.path);
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
          </div>

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

            {/* User Menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={cn(
                    "flex items-center space-x-3 p-2 rounded-xl transition-all duration-200",
                    "hover:bg-honey-50 focus:outline-none focus:ring-2 focus:ring-honey-500/20",
                    isUserMenuOpen && "bg-honey-50"
                  )}
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                  />
                  {/* Membership Badge next to avatar */}
                  <div className="hidden sm:block">
                    <MembershipBadge
                      tier={user.membershipTier as any}
                      size="sm"
                    />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900 leading-tight">{user.name}</p>
                    <p className="text-xs text-warm-gray-500 leading-tight">{user.email}</p>
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-honey-border z-50 py-2 animate-fade-in">
                    {userMenuItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          item.action();
                          setIsUserMenuOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors",
                          "hover:bg-honey-50 text-warm-gray-700 hover:text-warm-gray-900",
                          item.className
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}
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

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-honey-border bg-white/95 backdrop-blur">
            <div className="py-4 space-y-2">
              {/* Mobile Search */}
              <div className="px-2 pb-4 border-b border-honey-border md:hidden">
                <SearchBar />
              </div>

              {/* Mobile Navigation */}
              <nav className="space-y-1">
                {navigationItems.map((item) => {
                  const isActive = isActiveRoute(item.path);
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

              {/* Mobile Create Button */}
              <div className="pt-4 border-t border-honey-border">
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
          </div>
        )}
      </div>

      {/* Click outside handlers */}
      {(isMobileMenuOpen || isUserMenuOpen) && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => {
            setIsMobileMenuOpen(false);
            setIsUserMenuOpen(false);
          }}
        />
      )}
    </header>
  );
};