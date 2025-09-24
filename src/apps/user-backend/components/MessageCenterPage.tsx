import React, { useEffect, useState } from 'react';
import { Bell, MessageCircle, Heart, User, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@shared/components/common/ConfirmDialog';
import { NotificationsService } from '@shared/services/api';
import type { NotificationType, NotificationQueryRequest, UserNotificationDTO, PageResponse } from '@shared/types';
import { showToast } from '@shared/utils/toast';

export const MessageCenterPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'comment' | 'like' | 'system'>('all');
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize] = useState(10);
  const [pageData, setPageData] = useState<PageResponse<UserNotificationDTO>>({
    records: [],
    total: 0,
    size: pageSize,
    current: 1,
    orders: [],
    optimizeCountSql: true,
    searchCount: true,
    optimizeJoinOfCountSql: true,
    pages: 0,
  });
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const tabs = [
    { id: 'all', name: '全部', count: pageData.total },
    { id: 'unread', name: '未读', count: unreadCount },
    { id: 'comment', name: '评论', count: undefined },
    { id: 'like', name: '点赞', count: undefined },
    { id: 'system', name: '系统', count: undefined }
  ] as const;

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'COMMENT':
      case 'REPLY':
        return <MessageCircle className="h-5 w-5 text-blue-600" />;
      case 'LIKE':
        return <Heart className="h-5 w-5 text-red-600" />;
      case 'FOLLOW':
        return <User className="h-5 w-5 text-green-600" />;
      case 'SYSTEM':
        return <Bell className="h-5 w-5 text-orange-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const mapTabToQuery = (): { type?: NotificationType; read?: boolean } => {
    switch (activeTab) {
      case 'unread':
        return { read: false };
      case 'comment':
        return { type: 'COMMENT' };
      case 'like':
        return { type: 'LIKE' };
      case 'system':
        return { type: 'SYSTEM' };
      default:
        return {};
    }
  };

  const fetchList = async (reset = true) => {
    setLoading(true);
    try {
      const params: NotificationQueryRequest = { pageNum, pageSize, ...mapTabToQuery() };
      const data = await NotificationsService.getNotifications(params);
      setPageData(prev => ({
        ...data,
        records: reset ? data.records : [...prev.records, ...data.records],
      }));
      try { setUnreadCount(await NotificationsService.getUnreadCount()); } catch {}
    } catch (e) {
      showToast.error('加载消息失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPageNum(1); }, [activeTab]);
  useEffect(() => { fetchList(true); }, [pageNum, activeTab]);

  const markAsRead = async (messageId: string) => {
    try {
      await NotificationsService.markAsRead(messageId);
      setPageData(prev => ({
        ...prev,
        records: prev.records.map(r => r.id === messageId ? { ...r, read: true } : r)
      }));
      try { setUnreadCount(await NotificationsService.getUnreadCount()); } catch { void 0; }
    } catch {
      showToast.error('标记已读失败');
    }
  };

  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id?: string }>({ open: false });
  const deleteMessage = async (messageId: string) => {
    try {
      await NotificationsService.delete(messageId);
      setPageData(prev => ({
        ...prev,
        records: prev.records.filter(r => r.id !== messageId),
        total: Math.max(0, prev.total - 1)
      }));
      try { setUnreadCount(await NotificationsService.getUnreadCount()); } catch { void 0; }
    } catch {
      showToast.error('删除失败');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">消息中心</h1>
          <p className="text-gray-600 mt-1">管理你的所有通知和消息</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                await NotificationsService.markAllAsRead();
                showToast.success('已全部标记为已读');
                fetchList();
              } catch {
                showToast.error('操作失败');
              }
            }}
          >
            全部标记已读
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                await NotificationsService.clearRead();
                showToast.success('已清空已读消息');
                fetchList();
              } catch {
                showToast.error('清空失败');
              }
            }}
          >
            清空已读
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{pageData.total}</div>
              <div className="text-sm text-gray-600">总消息数</div>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{Math.max(0, pageData.total - unreadCount)}</div>
              <div className="text-sm text-gray-600">已读消息</div>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{unreadCount}</div>
              <div className="text-sm text-gray-600">未读消息</div>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <Bell className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">-</div>
              <div className="text-sm text-gray-600">系统通知</div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                ${activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }
              `}
            >
              <span>{tab.name}</span>
              {typeof tab.count === 'number' && tab.count > 0 && (
                <Badge variant="secondary" size="sm">{tab.count}</Badge>
              )}
            </button>
          ))}
        </div>
      </Card>

      <div className="space-y-3">
        {pageData.records.map((message) => (
          <Card key={message.id} className={`p-4 transition-all hover:shadow-md ${!message.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''}`}>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {message.senderAvatar ? (
                  <img
                    src={message.senderAvatar}
                    alt={message.senderName || '系统'}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    {getMessageIcon(message.type)}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`text-sm font-medium ${!message.read ? 'text-gray-900' : 'text-gray-700'}`}>
                    {message.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {!message.read && (<div className="w-2 h-2 bg-blue-600 rounded-full"></div>)}
                    <span className="text-xs text-gray-500">{new Date(message.createTime).toLocaleString()}</span>
                  </div>
                </div>
                <p className={`text-sm ${!message.read ? 'text-gray-800' : 'text-gray-600'} mb-2`}>{message.content}</p>
                <div className="flex items-center space-x-3">
                  {message.senderName && (
                    <span className="text-xs text-gray-500">来自: {message.senderName}</span>
                  )}
                  <div className="flex items-center space-x-2">
                    {!message.read && (
                      <Button variant="ghost" size="sm" onClick={() => markAsRead(message.id)} className="text-xs h-6 px-2">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        标记已读
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm({ open: true, id: message.id })} className="text-xs h-6 px-2 text-red-600 hover:text-red-700">
                      <Trash2 className="h-3 w-3 mr-1" />
                      删除
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button
          variant="outline"
          disabled={loading || pageData.current >= pageData.pages}
          onClick={() => setPageNum(p => Math.min(pageData.pages || p + 1, p + 1))}
        >
          {pageData.current >= pageData.pages ? '没有更多了' : (loading ? '加载中...' : '加载更多消息')}
        </Button>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.open}
        title="确认删除"
        message="删除后不可恢复，确定要删除该消息吗？"
        confirmText="删除"
        cancelText="取消"
        variant="danger"
        onConfirm={() => {
          if (deleteConfirm.id) deleteMessage(deleteConfirm.id);
          setDeleteConfirm({ open: false, id: undefined });
        }}
        onCancel={() => setDeleteConfirm({ open: false, id: undefined })}
      />
    </div>
  );
};
