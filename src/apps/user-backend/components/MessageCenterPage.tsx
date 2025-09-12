import React, { useState } from 'react';
import { Bell, MessageCircle, Heart, User, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { Card } from '@shared/components/ui/Card';
import { Button } from '@shared/components/ui/Button';
import { Badge } from '@shared/components/ui/Badge';

export const MessageCenterPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');

  // 模拟消息数据
  const messages = [
    {
      id: '1',
      type: 'comment',
      title: '新评论通知',
      content: '用户"小明"在你的文章《React Hooks 实践》下发表了评论',
      sender: '小明',
      time: '2 分钟前',
      read: false,
      avatar: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      id: '2',
      type: 'like',
      title: '点赞通知',
      content: '你的文章《TypeScript 实战》获得了 5 个新点赞',
      sender: '系统通知',
      time: '1 小时前',
      read: false,
      avatar: null
    },
    {
      id: '3',
      type: 'system',
      title: '文章审核通过',
      content: '你的文章《前端性能优化指南》已通过审核并发布',
      sender: '系统通知',
      time: '3 小时前',
      read: true,
      avatar: null
    },
    {
      id: '4',
      type: 'follow',
      title: '新关注者',
      content: '用户"李华"开始关注你',
      sender: '李华',
      time: '1 天前',
      read: true,
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      id: '5',
      type: 'reply',
      title: '回复通知',
      content: '用户"张三"回复了你的评论',
      sender: '张三',
      time: '2 天前',
      read: true,
      avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    }
  ];

  const tabs = [
    { id: 'all', name: '全部', count: 12 },
    { id: 'unread', name: '未读', count: 3 },
    { id: 'comment', name: '评论', count: 5 },
    { id: 'like', name: '点赞', count: 8 },
    { id: 'system', name: '系统', count: 4 }
  ];

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'comment':
      case 'reply':
        return <MessageCircle className="h-5 w-5 text-blue-600" />;
      case 'like':
        return <Heart className="h-5 w-5 text-red-600" />;
      case 'follow':
        return <User className="h-5 w-5 text-green-600" />;
      case 'system':
        return <Bell className="h-5 w-5 text-orange-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const markAsRead = (messageId: string) => {
    // 标记为已读的逻辑
    console.log('Mark as read:', messageId);
  };

  const deleteMessage = (messageId: string) => {
    // 删除消息的逻辑
    console.log('Delete message:', messageId);
  };

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">消息中心</h1>
          <p className="text-gray-600 mt-1">管理你的所有通知和消息</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            全部标记已读
          </Button>
          <Button variant="outline" size="sm">
            清空已读
          </Button>
        </div>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">24</div>
              <div className="text-sm text-gray-600">总消息数</div>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">3</span>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">3</div>
              <div className="text-sm text-gray-600">未读消息</div>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <MessageCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">15</div>
              <div className="text-sm text-gray-600">互动消息</div>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <Bell className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">9</div>
              <div className="text-sm text-gray-600">系统通知</div>
            </div>
          </div>
        </Card>
      </div>

      {/* 消息分类标签 */}
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
              {tab.count > 0 && (
                <Badge variant="secondary" size="sm">{tab.count}</Badge>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* 消息列表 */}
      <div className="space-y-3">
        {messages.map((message) => (
          <Card key={message.id} className={`p-4 transition-all hover:shadow-md ${!message.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''}`}>
            <div className="flex items-start space-x-4">
              {/* 消息图标或头像 */}
              <div className="flex-shrink-0">
                {message.avatar ? (
                  <img
                    src={message.avatar}
                    alt={message.sender}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    {getMessageIcon(message.type)}
                  </div>
                )}
              </div>

              {/* 消息内容 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`text-sm font-medium ${!message.read ? 'text-gray-900' : 'text-gray-700'}`}>
                    {message.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {!message.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                    <span className="text-xs text-gray-500">{message.time}</span>
                  </div>
                </div>
                <p className={`text-sm ${!message.read ? 'text-gray-800' : 'text-gray-600'} mb-2`}>
                  {message.content}
                </p>
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-gray-500">来自: {message.sender}</span>
                  <div className="flex items-center space-x-2">
                    {!message.read && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => markAsRead(message.id)}
                        className="text-xs h-6 px-2"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        标记已读
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteMessage(message.id)}
                      className="text-xs h-6 px-2 text-red-600 hover:text-red-700"
                    >
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

      {/* 加载更多 */}
      <div className="text-center">
        <Button variant="outline">加载更多消息</Button>
      </div>
    </div>
  );
};