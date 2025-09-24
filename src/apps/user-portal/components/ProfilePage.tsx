import React, { useState } from 'react';
import { User, Mail, Calendar, Crown, Edit, Save, X, CreditCard, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MembershipBadge } from '@shared/components/ui/MembershipBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { membershipPlans } from '@shared/constants/mockData';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const currentPlan = membershipPlans.find(plan => plan.tier === user?.membershipTier);
  const displayPlanName = user?.currentSubscriptionPlanName || currentPlan?.name;
  const isPlanActive = (() => {
    if (!user?.membershipExpiry) return false;
    const d = typeof user.membershipExpiry === 'string' ? new Date(user.membershipExpiry) : user.membershipExpiry;
    return !isNaN(d.getTime()) && d.getTime() > Date.now();
  })();

  const getMembershipColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'premium': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'vip': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-orange-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSave = () => {
    // Here you would typically update the user profile
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      name: user?.name || '',
      email: user?.email || ''
    });
    setIsEditing(false);
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '无';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '无效日期';
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(dateObj);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">个人中心</h1>
        <p className="text-gray-600">管理您的个人信息和会员套餐</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">个人信息</h2>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>编辑</span>
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>保存</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    className="flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>取消</span>
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-6 mb-6">
              <div className="relative">
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="h-20 w-20 rounded-full object-cover"
                />
                <div className="absolute -bottom-1 -right-1">
                  <MembershipBadge
                    tier={(user?.membershipTier || 'basic') as any}
                    size="sm"
                    text={displayPlanName || undefined}
                    level={user?.currentSubscriptionPlanLevel as 1 | 2 | 3 | undefined}
                  />
                </div>
              </div>
              <div className="flex-1">
                {!isEditing ? (
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{user?.name}</h3>
                    <p className="text-gray-600">{user?.email}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Input
                      label="姓名"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                      label="邮箱"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <User className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">用户ID</p>
                  <p className="font-medium text-gray-900">{user?.id}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <Mail className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">邮箱状态</p>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-gray-900">已验证</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <Calendar className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">注册时间</p>
                  <p className="font-medium text-gray-900">2024年12月15日</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <Crown className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">会员等级</p>
                  <MembershipBadge
                    tier={(user?.membershipTier || 'basic') as any}
                    size="sm"
                    text={displayPlanName || undefined}
                    level={user?.currentSubscriptionPlanLevel as 1 | 2 | 3 | undefined}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Learning Stats */}
        </div>

        {/* Membership Information */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">会员套餐</h2>
              <CreditCard className="h-5 w-5 text-gray-600" />
            </div>

            {displayPlanName ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-xl border-2 ${getMembershipColor((user?.membershipTier || 'guest'))}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold">{displayPlanName}</h3>
                    {user?.membershipTier === 'vip' && <Crown className="h-5 w-5" />}
                  </div>
                  {currentPlan?.price !== undefined && (
                    <p className="text-2xl font-bold">¥{currentPlan.price}<span className="text-sm font-normal">/月</span></p>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">套餐状态</span>
                    {isPlanActive ? (
                      <Badge variant="success">活跃</Badge>
                    ) : (
                      <Badge variant="secondary">已过期</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">生效时间</span>
                    <span className="font-medium">{formatDate(user?.currentSubscriptionStartTime)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">到期时间</span>
                    <span className="font-medium">{formatDate(user?.membershipExpiry)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">自动续费</span>
                    <Badge variant="success">已开启</Badge>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">套餐权益</h4>
                  <ul className="space-y-2">
                    {(currentPlan?.features || []).slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex space-x-3">
                  <Button variant="outline" size="sm" className="flex-1">
                    管理套餐
                  </Button>
                  <Button size="sm" className="flex-1">
                    升级套餐
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="bg-gray-100 rounded-full p-3 w-16 h-16 mx-auto mb-4">
                  <Crown className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无会员套餐</h3>
                <p className="text-gray-600 mb-4">升级会员解锁更多课程和功能</p>
                <Button className="w-full">选择套餐</Button>
              </div>
            )}
          </Card>

        </div>
      </div>
    </div>
  );
};
