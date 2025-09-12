import React, { useState } from 'react';
import { Camera, Save, Eye, EyeOff, Smartphone, MapPin, Calendar } from 'lucide-react';
import { Card } from '@shared/components/ui/Card';
import { Button } from '@shared/components/ui/Button';
import { useAuth } from '../../../context/AuthContext';

export const ProfileSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: '一个热爱学习的前端开发者，喜欢分享技术心得',
    location: '上海',
    website: 'https://github.com/username',
    twitter: '@username',
    birthday: '1990-01-01',
    phone: '138****1234',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // 保存用户信息的逻辑
    console.log('Save profile:', formData);
  };

  const handlePasswordChange = () => {
    // 修改密码的逻辑
    console.log('Change password');
  };

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">个人信息</h1>
        <p className="text-gray-600 mt-1">管理你的个人资料和账户设置</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧主要信息 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 基本信息 */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h2>
            <div className="space-y-4">
              {/* 头像设置 */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <button className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 shadow-lg hover:bg-blue-700 transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">头像</h3>
                  <p className="text-sm text-gray-500">点击图标更换头像</p>
                </div>
              </div>

              {/* 用户名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  用户名
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* 邮箱 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  邮箱
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* 个人简介 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  个人简介
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="介绍一下自己..."
                />
              </div>

              {/* 位置 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  所在地
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="城市或地区"
                  />
                </div>
              </div>

              {/* 网站 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  个人网站
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://your-website.com"
                />
              </div>

              <Button onClick={handleSave} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                保存更改
              </Button>
            </div>
          </Card>

          {/* 密码设置 */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">密码设置</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  当前密码
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  新密码
                </label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  确认新密码
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <Button onClick={handlePasswordChange} variant="outline" className="w-full sm:w-auto">
                修改密码
              </Button>
            </div>
          </Card>
        </div>

        {/* 右侧信息 */}
        <div className="space-y-6">
          {/* 账户状态 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">账户状态</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">会员等级</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user?.membershipTier === 'vip' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' : user?.membershipTier === 'premium' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                  {user?.membershipTier?.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">注册时间</span>
                <span className="text-sm text-gray-900">2024-01-01</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">最后登录</span>
                <span className="text-sm text-gray-900">今天 14:30</span>
              </div>
            </div>
          </Card>

          {/* 统计信息 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">数据统计</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">发布文章</span>
                <span className="text-sm font-medium text-gray-900">12 篇</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">获得点赞</span>
                <span className="text-sm font-medium text-gray-900">246 个</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">关注者</span>
                <span className="text-sm font-medium text-gray-900">89 人</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">学习时长</span>
                <span className="text-sm font-medium text-gray-900">128 小时</span>
              </div>
            </div>
          </Card>

          {/* 安全提示 */}
          <Card className="p-6 border-orange-200 bg-orange-50">
            <div className="flex items-start space-x-3">
              <Smartphone className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-orange-800">安全提示</h4>
                <p className="text-sm text-orange-700 mt-1">
                  建议开启两步验证以提高账户安全性
                </p>
                <Button variant="outline" size="sm" className="mt-2 border-orange-300 text-orange-700 hover:bg-orange-100">
                  立即设置
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};