import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Settings, BookOpen, MessageSquare, Crown, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@shared/utils/cn';

interface Notification {
  id: string;
  type: 'course_update' | 'new_post' | 'membership' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  isPremium?: boolean;
}

interface NotificationCenterProps {
  className?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'course_update',
      title: '课程更新',
      message: 'React 高级课程新增第5章内容',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30分钟前
      isRead: false,
      actionUrl: '/courses/1',
      isPremium: true
    },
    {
      id: '2',
      type: 'new_post',
      title: '新文章发布',
      message: '《TypeScript 最佳实践指南》已发布',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2小时前
      isRead: false,
      actionUrl: '/discussions/2'
    },
    {
      id: '3',
      type: 'membership',
      title: '会员特权',
      message: '您的VIP会员将在7天后到期',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1天前
      isRead: true,
      actionUrl: '/dashboard/membership'
    },
    {
      id: '4',
      type: 'system',
      title: '系统通知',
      message: '平台将在今晚进行维护升级',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3天前
      isRead: true
    }
  ]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(n => n.id !== notificationId)
    );
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    return `${days}天前`;
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'course_update': return BookOpen;
      case 'new_post': return MessageSquare;
      case 'membership': return Crown;
      case 'system': return Settings;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'course_update': return 'text-blue-500 bg-blue-50';
      case 'new_post': return 'text-green-500 bg-green-50';
      case 'membership': return 'text-premium-500 bg-premium-50';
      case 'system': return 'text-gray-500 bg-gray-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative h-10 w-10 rounded-full transition-all duration-200",
          "hover:bg-honey-100 focus:ring-2 focus:ring-honey-primary/20",
          isOpen && "bg-honey-100"
        )}
      >
        <Bell className="h-5 w-5 text-warm-gray-600" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs font-bold animate-bounce-gentle"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-2xl shadow-xl border border-honey-border z-50 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">通知</h3>
                <p className="text-sm text-warm-gray-500">
                  {unreadCount > 0 ? `${unreadCount} 条未读` : '全部已读'}
                </p>
              </div>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-honey-primary hover:text-honey-primary-hover"
                >
                  全部标记已读
                </Button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-warm-gray-300 mx-auto mb-4" />
                <p className="text-warm-gray-500 mb-2">暂无通知</p>
                <p className="text-sm text-warm-gray-400">有新消息时会在这里显示</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);
                const iconColorClass = getNotificationColor(notification.type);

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "px-6 py-4 border-b border-gray-50 hover:bg-honey-50 transition-colors cursor-pointer group",
                      !notification.isRead && "bg-blue-50/30"
                    )}
                    onClick={() => {
                      markAsRead(notification.id);
                      if (notification.actionUrl) {
                        // Navigate to action URL
                        window.location.href = notification.actionUrl;
                      }
                    }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={cn("p-2 rounded-full", iconColorClass)}>
                        <IconComponent className="h-4 w-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={cn(
                                "text-sm font-medium truncate",
                                notification.isRead ? "text-warm-gray-700" : "text-gray-900"
                              )}>
                                {notification.title}
                              </h4>
                              {notification.isPremium && (
                                <Crown className="h-3 w-3 text-premium-500 flex-shrink-0" />
                              )}
                              {!notification.isRead && (
                                <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className={cn(
                              "text-sm leading-relaxed",
                              notification.isRead ? "text-warm-gray-500" : "text-warm-gray-700"
                            )}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-warm-gray-400 mt-1">
                              {formatTimestamp(notification.timestamp)}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="h-8 w-8 p-0"
                                title="标记已读"
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                              title="删除"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center text-warm-gray-600 hover:text-honey-primary"
              >
                查看全部通知
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
