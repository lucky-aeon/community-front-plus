import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@shared/components/ui/Card';
import { Button } from '@shared/components/ui/Button';
import { Badge } from '@shared/components/ui/Badge';
import { LoadingSpinner } from '@shared/components/ui/LoadingSpinner';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { DataTable, DataTableColumn } from '@shared/components/ui/DataTable';
import { Pagination } from '@shared/components/ui/Pagination';
import { TableActions, TableAction } from '@shared/components/ui/TableActions';
import { AdminUserService } from '@shared/services/api/admin-user.service';
import { AdminUserDTO, AdminUserQueryRequest } from '@shared/types';
import { Select, SelectOption } from '@shared/components/ui/Select';
import { Input } from '@shared/components/ui/Input';
import { InlineEditNumber } from '@shared/components/ui/InlineEditNumber';
import { Search, User, Mail, Shield, ShieldOff } from 'lucide-react';

export const UsersPage: React.FC = () => {
  // 状态管理
  const [users, setUsers] = useState<AdminUserDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isToggling, setIsToggling] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    userId?: string;
    userStatus?: string;
    userName?: string;
  }>({ isOpen: false });
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // 搜索输入状态 - 用于输入控制
  const [searchInput, setSearchInput] = useState({
    email: '',
    name: '',
    status: '' as 'ACTIVE' | 'INACTIVE' | ''
  });
  
  // 搜索筛选状态 - 用于API调用
  const [searchFilters, setSearchFilters] = useState({
    email: '',
    name: '',
    status: '' as 'ACTIVE' | 'INACTIVE' | ''
  });

  // 状态选项配置
  const statusOptions: SelectOption[] = [
    { value: '', label: '全部状态' },
    { value: 'ACTIVE', label: '正常' },
    { value: 'INACTIVE', label: '禁用' }
  ];

  // 加载用户列表
  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: AdminUserQueryRequest = {
        pageNum: currentPage,
        pageSize: 20,
        ...(searchFilters.email && { email: searchFilters.email }),
        ...(searchFilters.name && { name: searchFilters.name }),
        ...(searchFilters.status && { status: searchFilters.status })
      };

      const response = await AdminUserService.getUsers(params);
      setUsers(response.records);
      setTotalPages(response.pages);
      setTotalCount(response.total);
    } catch (error) {
      console.error('加载用户列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchFilters]);

  // 初始化加载
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // 处理搜索
  const handleSearch = () => {
    setSearchFilters({ ...searchInput });
    setCurrentPage(1);
  };

  // 重置搜索
  const handleReset = () => {
    const resetFilters = {
      email: '',
      name: '',
      status: '' as 'ACTIVE' | 'INACTIVE' | ''
    };
    setSearchInput(resetFilters);
    setSearchFilters(resetFilters);
    setCurrentPage(1);
  };

  // 处理设备数量更新
  const handleUpdateDeviceCount = async (userId: string, newDeviceCount: number) => {
    try {
      const updatedUser = await AdminUserService.updateUserDeviceCount(userId, newDeviceCount);
      
      // 更新本地状态
      setUsers(prev => prev.map(user => 
        user.id === userId ? updatedUser : user
      ));
      
      // 成功提示由响应拦截器统一处理
    } catch (error) {
      console.error('更新设备数量失败:', error);
      throw error; // 重新抛出错误，让组件处理
    }
  };

  // 处理回车键搜索
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 打开确认对话框
  const openConfirmDialog = (userId: string, userStatus: string, userName: string) => {
    setConfirmDialog({
      isOpen: true,
      userId,
      userStatus,
      userName
    });
  };

  // 关闭确认对话框
  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false });
  };

  // 切换用户状态
  const handleToggleStatus = async () => {
    if (!confirmDialog.userId || !confirmDialog.userStatus) return;
    
    const userId = confirmDialog.userId;

    setIsToggling(userId);
    try {
      const updatedUser = await AdminUserService.toggleUserStatus(userId);
      
      // 更新本地状态
      setUsers(prev => prev.map(user => 
        user.id === userId ? updatedUser : user
      ));
    } catch (error) {
      console.error('切换用户状态失败:', error);
    } finally {
      setIsToggling(null);
      closeConfirmDialog();
    }
  };

  // 格式化时间显示
  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 定义表格列
  const columns: DataTableColumn<AdminUserDTO>[] = [
    {
      key: 'userInfo',
      title: '用户信息',
      render: (_, user) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {user.avatar ? (
              <img
                className="h-10 w-10 rounded-full"
                src={user.avatar}
                alt={user.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop`;
                }}
              />
            ) : (
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs" title={user.email}>
              {user.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      title: '个人简介',
      render: (_, user) => (
        <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate" title={user.description || '暂无描述'}>
          {user.description || '-'}
        </div>
      ),
    },
    {
      key: 'status',
      title: '状态',
      render: (_, user) => {
        const isActive = user.status === 'ACTIVE';
        return (
          <Badge
            variant={isActive ? 'success' : 'secondary'}
            size="sm"
          >
            <div className="flex items-center space-x-1">
              {isActive ? (
                <Shield className="h-3 w-3" />
              ) : (
                <ShieldOff className="h-3 w-3" />
              )}
              <span>{isActive ? '正常' : '禁用'}</span>
            </div>
          </Badge>
        );
      },
    },
    {
      key: 'emailNotification',
      title: '邮箱通知',
      render: (_, user) => (
        <Badge
          variant={user.emailNotificationEnabled ? 'success' : 'secondary'}
          size="sm"
        >
          {user.emailNotificationEnabled ? '已开启' : '已关闭'}
        </Badge>
      ),
    },
    {
      key: 'maxDevices',
      title: '最大设备数',
      render: (_, user) => (
        <InlineEditNumber
          value={user.maxConcurrentDevices}
          onSave={(newValue) => handleUpdateDeviceCount(user.id, newValue)}
          min={1}
          max={99}
          className="text-sm"
        />
      ),
    },
    {
      key: 'createTime',
      title: '注册时间',
      render: (_, user) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatDateTime(user.createTime)}
        </span>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      render: (_, user) => {
        const isActive = user.status === 'ACTIVE';
        const actions: TableAction[] = [
          {
            key: 'toggle',
            type: 'custom',
            label: isActive ? '禁用' : '启用',
            icon: isToggling === user.id ? (
              <LoadingSpinner size="sm" />
            ) : isActive ? (
              <ShieldOff className="h-3.5 w-3.5" />
            ) : (
              <Shield className="h-3.5 w-3.5" />
            ),
            variant: isActive ? 'danger' : 'primary',
            disabled: isToggling === user.id,
            onClick: () => openConfirmDialog(user.id, user.status, user.name),
            className: "min-w-20",
          },
        ];
        return <TableActions actions={actions} />;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">用户管理</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">管理系统中的所有注册用户</p>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                type="email"
                placeholder="请输入邮箱地址"
                value={searchInput.email}
                onChange={(e) => setSearchInput(prev => ({ ...prev, email: e.target.value }))}
                onKeyPress={handleKeyPress}
                icon={<Mail className="h-4 w-4" />}
                label="邮箱搜索"
              />
            </div>
            
            <div>
              <Input
                type="text"
                placeholder="请输入用户昵称"
                value={searchInput.name}
                onChange={(e) => setSearchInput(prev => ({ ...prev, name: e.target.value }))}
                onKeyPress={handleKeyPress}
                icon={<User className="h-4 w-4" />}
                label="昵称搜索"
              />
            </div>
            
            <div>
              <Select
                value={searchInput.status}
                onChange={(value) => setSearchInput(prev => ({ ...prev, status: value as 'ACTIVE' | 'INACTIVE' | '' }))}
                options={statusOptions}
                placeholder="选择状态"
                label="用户状态"
                size="md"
              />
            </div>
            
            <div className="flex items-end">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="flex items-center space-x-2"
                >
                  <Search className="h-4 w-4" />
                  <span>搜索</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={isLoading}
                >
                  重置
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 用户列表 */}
      <DataTable
        columns={columns}
        data={users}
        loading={isLoading}
        rowKey="id"
        emptyText="暂无用户数据"
        emptyIcon={<User className="w-12 h-12 text-gray-400 dark:text-gray-500" />}
        pagination={
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            onChange={setCurrentPage}
            mode="simple"
          />
        }
      />

      {/* 确认对话框 */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={`${confirmDialog.userStatus === 'ACTIVE' ? '禁用' : '启用'}用户`}
        message={`确定要${confirmDialog.userStatus === 'ACTIVE' ? '禁用' : '启用'}用户 "${confirmDialog.userName}" 吗？${confirmDialog.userStatus === 'ACTIVE' ? '\n\n禁用后该用户将无法正常使用系统功能。' : '\n\n启用后该用户可以正常使用系统功能。'}`}
        confirmText={confirmDialog.userStatus === 'ACTIVE' ? '禁用' : '启用'}
        cancelText="取消"
        onConfirm={handleToggleStatus}
        onCancel={closeConfirmDialog}
        variant={confirmDialog.userStatus === 'ACTIVE' ? 'warning' : 'info'}
      />
    </div>
  );
};