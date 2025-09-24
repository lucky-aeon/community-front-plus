import React, { useState, useEffect } from 'react';
import { Save, Eye, EyeOff, Bell, BellOff } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserService } from '@shared/services/api';
import { ResourceAccessService } from '@shared/services/api/resource-access.service';
import { UserDTO } from '@shared/types';
import { useAuth } from '@/context/AuthContext';
import { showToast } from '@shared/utils/toast';
import { AvatarUpload } from '@shared/components/common/AvatarUpload';

export const ProfileSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [currentUserData, setCurrentUserData] = useState<UserDTO | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatar || ''); // 新增头像状态
  const [avatarResourceId, setAvatarResourceId] = useState<string>('');   // 新增：待保存的头像资源ID

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // 加载用户数据
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await UserService.getCurrentUser();
        setCurrentUserData(userData);
        setFormData(prev => ({
          ...prev,
          name: userData.name,
          email: userData.email,
          bio: userData.description || ''
        }));
        // 同步头像URL
        setAvatarUrl(userData.avatar || '');
      } catch (error) {
        console.error('加载用户数据失败:', error);
      }
    };

    loadUserData();
  }, []);

  // 头像上传成功处理
  const handleAvatarUploadSuccess = async (avatarAccessUrl: string) => {
    try {
      // 立即更新本地状态
      setAvatarUrl(avatarAccessUrl);

      // 如果用户服务支持单独更新头像，可以调用
      // await UserService.updateAvatar(avatarAccessUrl);

      showToast.success('头像上传成功');
    } catch (error) {
      console.error('更新头像失败:', error);
      showToast.error('头像上传成功，但更新失败，请刷新页面');
    }
  };

  // 头像上传错误处理
  const handleAvatarUploadError = (error: string) => {
    console.error('头像上传失败:', error);
    showToast.error(`头像上传失败: ${error}`);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!formData.bio.trim()) {
      showToast.error('请输入个人简介');
      return;
    }

    if (formData.bio.length > 500) {
      showToast.error('个人简介不能超过500个字符');
      return;
    }

    setIsLoading(true);
    try {
      const payload: { description?: string; avatar?: string } = { description: formData.bio };
      if (avatarResourceId) payload.avatar = avatarResourceId;

      const updatedUser = await UserService.updateProfile(payload);
      
      setCurrentUserData(updatedUser);
      // 如果后端返回了新的头像URL，优先使用；否则继续使用本地预览
      if (updatedUser?.avatar) {
        setAvatarUrl(updatedUser.avatar);
      }
      // 清空待保存的资源ID
      setAvatarResourceId('');
      // 成功消息由拦截器处理
    } catch (error) {
      console.error('更新个人信息失败:', error);
      // 错误消息由拦截器处理
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!formData.currentPassword) {
      showToast.error('请输入当前密码');
      return;
    }

    if (!formData.newPassword) {
      showToast.error('请输入新密码');
      return;
    }

    if (formData.newPassword.length < 6 || formData.newPassword.length > 20) {
      showToast.error('新密码长度必须为6-20位');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showToast.error('两次输入的密码不一致');
      return;
    }

    setPasswordLoading(true);
    try {
      await UserService.changePassword({
        oldPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      // 清空密码输入框
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      // 成功消息由拦截器处理
    } catch (error) {
      console.error('修改密码失败:', error);
      // 错误消息由拦截器处理
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleToggleEmailNotification = async () => {
    try {
      const updatedUser = await UserService.toggleEmailNotification();
      setCurrentUserData(updatedUser);
      // 成功消息由拦截器处理
    } catch (error) {
      console.error('切换邮箱通知设置失败:', error);
      // 错误消息由拦截器处理
    }
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
              <div className="flex items-center space-x-6">
                <div>
                  <AvatarUpload
                    value={avatarUrl}
                    onChange={handleAvatarUploadSuccess}
                    onError={handleAvatarUploadError}
                    onUploadSuccess={(resourceId) => {
                      setAvatarResourceId(resourceId || '');
                      if (resourceId) {
                        try {
                          const accessUrl = ResourceAccessService.getResourceAccessUrl(resourceId);
                          setAvatarUrl(accessUrl);
                        } catch { /* 忽略资源解析失败 */ }
                      }
                    }}
                    size="xl"
                    userName={currentUserData?.name || user?.name || '用户'}
                    maxSize={5 * 1024 * 1024} // 5MB
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">头像</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    点击头像或相机图标上传新头像
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    支持 JPG、PNG、GIF 等格式，文件大小不超过 5MB
                  </p>
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
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  title="邮箱地址不可修改"
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
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="介绍一下自己..."
                />
                <div className="mt-1 flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    最大500个字符
                  </span>
                  <span className={`text-xs ${
                    formData.bio.length > 500 ? 'text-red-500' : 
                    formData.bio.length > 400 ? 'text-orange-500' : 'text-gray-500'
                  }`}>
                    {formData.bio.length}/500
                  </span>
                </div>
              </div>

              <Button onClick={handleSave} disabled={isLoading} variant="outline" className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? '保存中...' : '保存更改'}
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

              <Button onClick={handlePasswordChange} disabled={passwordLoading} variant="outline" className="w-full sm:w-auto">
                {passwordLoading ? '修改中...' : '修改密码'}
              </Button>
            </div>
          </Card>
        </div>

        {/* 右侧信息 */}
        <div className="space-y-6">
          {/* 邮箱通知设置 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">通知设置</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  {currentUserData?.emailNotificationEnabled ? (
                    <Bell className="h-4 w-4 text-green-600" />
                  ) : (
                    <BellOff className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-600">邮箱通知</span>
                </div>
                <Button
                  onClick={handleToggleEmailNotification}
                  variant={currentUserData?.emailNotificationEnabled ? "primary" : "outline"}
                  size="sm"
                >
                  {currentUserData?.emailNotificationEnabled ? '已开启' : '已关闭'}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                {currentUserData?.emailNotificationEnabled 
                  ? '您将收到系统相关的邮箱通知' 
                  : '您将不会收到邮箱通知'}
              </p>
            </div>
          </Card>

          {/* 账户状态 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">账户状态</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">邮箱状态</span>
                <span className="text-sm text-gray-900">
                  {currentUserData?.email || '未设置'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">注册时间</span>
                <span className="text-sm text-gray-900">
                  {currentUserData?.createTime ? new Date(currentUserData.createTime).toLocaleDateString('zh-CN') : '2024-01-01'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">最后登录</span>
                <span className="text-sm text-gray-900">
                  {currentUserData?.updateTime ? new Date(currentUserData.updateTime).toLocaleDateString('zh-CN') : '今天 14:30'}
                </span>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};
