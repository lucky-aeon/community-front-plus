import React, { useState } from 'react';
import { User, Menu, X, LogOut, Crown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { MembershipBadge, type MembershipTier } from '@shared/components/ui/MembershipBadge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface HeaderProps {
  onAuthClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAuthClick }) => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: '课程', href: '#courses' },
    { label: '价格', href: '#pricing' },
    { label: '案例', href: '#testimonials' }
  ];

  const getMembershipBadge = () => {
    if (!user || user.membershipTier === 'guest') return null;
    const format = (v?: string | Date) => {
      if (!v) return '-';
      const d = typeof v === 'string' ? new Date(v) : v;
      const t = d instanceof Date && !isNaN(d.getTime()) ? d : undefined;
      return t ? t.toLocaleString('zh-CN') : String(v);
    };
    const end = user.currentSubscriptionEndTime as string | Date | undefined;
    const endMs = end ? new Date(end as any).getTime() : undefined;
    const daysLeft = typeof endMs === 'number' ? Math.max(0, Math.floor((endMs - Date.now()) / 86400000)) : undefined;
    const isActive = typeof endMs === 'number' ? endMs > Date.now() : false;
    return (
      <Popover>
        <PopoverTrigger asChild>
          <div className="inline-flex">
            <MembershipBadge
              tier={user.membershipTier as MembershipTier}
              size="sm"
              text={user.currentSubscriptionPlanName || undefined}
              level={user.currentSubscriptionPlanLevel as 1 | 2 | 3 | undefined}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Crown className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">{user.currentSubscriptionPlanName || '未订阅套餐'}</span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                {isActive ? '活跃' : '已过期'}
              </span>
            </div>
            <div className="text-xs text-gray-600">生效时间：<span className="font-medium">{format(user.currentSubscriptionStartTime as any)}</span></div>
            <div className="text-xs text-gray-600">到期时间：<span className="font-medium">{format(end as any)}</span></div>
            <div className="text-xs text-gray-600">剩余天数：<span className={`font-medium ${daysLeft !== undefined && daysLeft <= 7 ? 'text-orange-600' : ''}`}>{daysLeft !== undefined ? `${daysLeft} 天` : '-'}</span></div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img src="/logo.jpg" alt="Logo" className="h-8 w-8 rounded" />
            <h1 className="text-2xl font-bold text-yellow-400">
              敲鸭
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || '/avatars/avatar_1.png'} alt={user.name} />
                    <AvatarFallback>{(user.name || 'U').slice(0, 1).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    {getMembershipBadge()}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="hidden sm:flex"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  登出
                </Button>
              </div>
            ) : (
              <Button
                onClick={onAuthClick}
                className="hidden sm:flex bg-gradient-to-r from-honey-500 to-honey-600 hover:from-honey-600 hover:to-honey-700 text-white shadow-md"
              >
                <User className="h-4 w-4 mr-2" />
                登录 / 注册
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium px-2 py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              {!user && (
                <Button
                  onClick={() => {
                    onAuthClick();
                    setIsMenuOpen(false);
                  }}
                  className="mt-4 bg-gradient-to-r from-honey-500 to-honey-600 hover:from-honey-600 hover:to-honey-700 text-white shadow-md"
                >
                  <User className="h-4 w-4 mr-2" />
                  登录 / 注册
                </Button>
              )}
              {user && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="mt-4 justify-start"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  登出
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
