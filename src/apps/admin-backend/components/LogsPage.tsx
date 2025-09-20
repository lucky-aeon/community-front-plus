import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@shared/components/ui/Card';
import { Button } from '@shared/components/ui/Button';
import { Badge } from '@shared/components/ui/Badge';
import { DateTimeRangePicker, DateTimeRange } from '@shared/components/ui/DateTimeRangePicker';
import { ExpandableList, createExpandableItems, ExpandableListItem } from '@shared/components/ui/ExpandableList';
import { Pagination } from '@shared/components/ui/Pagination';
import { AdminLogsService } from '@shared/services/api/admin-logs.service';
import {
  UserActivityLogDTO,
  ActivityLogQueryRequest,
  ActivityType,
  ActivityCategory,
  TargetType
} from '@shared/types';
import { Select, SelectOption } from '@shared/components/ui/Select';
import { Input } from '@shared/components/ui/Input';
import {
  Search,
  User,
  Globe,
  Monitor,
  Filter,
  Eye,
  Clock,
  FileText,
  BookOpen,
  MessageSquare,
  Tag
} from 'lucide-react';

// 显示配置接口
interface DisplayConfig {
  showUserAgent: boolean;
  showRequestPath: boolean;
  showBrowserInfo: boolean;
  showEquipment: boolean;
  showTargetInfo: boolean;
}

// 默认配置 - 全部选中
const defaultDisplayConfig: DisplayConfig = {
  showUserAgent: true,
  showRequestPath: true,
  showBrowserInfo: true,
  showEquipment: true,
  showTargetInfo: true,
};

export const LogsPage: React.FC = () => {
  // 状态管理
  const [logs, setLogs] = useState<UserActivityLogDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // 显示配置状态
  const [displayConfig, setDisplayConfig] = useState<DisplayConfig>(() => {
    const saved = localStorage.getItem('logsDisplayConfig');
    return saved ? JSON.parse(saved) : defaultDisplayConfig;
  });
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // 搜索输入状态 - 用于输入控制
  const [searchInput, setSearchInput] = useState({
    userId: '',
    queryMode: 'type' as 'type' | 'category', // 查询模式：type=具体类型, category=分类
    activityType: '' as ActivityType | '',
    activityCategory: '' as ActivityCategory | '',
    dateTimeRange: { startTime: undefined, endTime: undefined } as DateTimeRange,
    ip: ''
  });

  // 搜索筛选状态 - 用于API调用
  const [searchFilters, setSearchFilters] = useState({
    userId: '',
    queryMode: 'type' as 'type' | 'category',
    activityType: '' as ActivityType | '',
    activityCategory: '' as ActivityCategory | '',
    dateTimeRange: { startTime: undefined, endTime: undefined } as DateTimeRange,
    ip: ''
  });

  // 活动类型选项配置（完整版）
  const activityTypeOptions: SelectOption[] = [
    { value: '', label: '全部活动类型' },
    // 认证相关
    { value: 'LOGIN_SUCCESS', label: '登录成功' },
    { value: 'LOGIN_FAILED', label: '登录失败' },
    { value: 'REGISTER_SUCCESS', label: '注册成功' },
    { value: 'REGISTER_FAILED', label: '注册失败' },
    { value: 'LOGOUT', label: '用户登出' },
    { value: 'CHANGE_PASSWORD', label: '修改密码' },
    { value: 'RESET_PASSWORD', label: '重置密码' },
    // 内容浏览
    { value: 'VIEW_POST', label: '查看文章' },
    { value: 'VIEW_COURSE', label: '查看课程' },
    { value: 'VIEW_USER_PROFILE', label: '查看用户资料' },
    { value: 'SEARCH_CONTENT', label: '搜索内容' },
    // 内容创作
    { value: 'CREATE_POST', label: '发表文章' },
    { value: 'UPDATE_POST', label: '编辑文章' },
    { value: 'DELETE_POST', label: '删除文章' },
    { value: 'CREATE_COURSE', label: '创建课程' },
    { value: 'UPDATE_COURSE', label: '编辑课程' },
    { value: 'DELETE_COURSE', label: '删除课程' },
    // 社交互动
    { value: 'LIKE_POST', label: '点赞文章' },
    { value: 'UNLIKE_POST', label: '取消点赞文章' },
    { value: 'COMMENT_POST', label: '评论文章' },
    { value: 'DELETE_COMMENT', label: '删除评论' },
    { value: 'FOLLOW_USER', label: '关注用户' },
    { value: 'UNFOLLOW_USER', label: '取消关注用户' },
    { value: 'SHARE_POST', label: '分享文章' },
    // 学习行为
    { value: 'ENROLL_COURSE', label: '注册课程' },
    { value: 'COMPLETE_CHAPTER', label: '完成章节' },
    { value: 'START_LEARNING', label: '开始学习' },
    // 管理操作
    { value: 'ADMIN_LOGIN', label: '管理员登录' },
    { value: 'ADMIN_UPDATE_USER', label: '管理员更新用户' },
    { value: 'ADMIN_DELETE_POST', label: '管理员删除文章' },
    { value: 'ADMIN_UPDATE_COURSE', label: '管理员更新课程' }
  ];

  // 活动分类选项配置
  const activityCategoryOptions: SelectOption[] = [
    { value: '', label: '全部分类' },
    { value: 'AUTHENTICATION', label: '认证相关' },
    { value: 'BROWSING', label: '内容浏览' },
    { value: 'CONTENT_CREATION', label: '内容创作' },
    { value: 'SOCIAL_INTERACTION', label: '社交互动' },
    { value: 'LEARNING', label: '学习行为' },
    { value: 'ADMINISTRATION', label: '管理操作' },
    { value: 'OTHER', label: '其他' }
  ];

  // 加载日志列表
  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: ActivityLogQueryRequest = {
        pageNum: currentPage,
        pageSize: 20,
        ...(searchFilters.userId && { userId: searchFilters.userId }),
        // 根据查询模式选择使用activityType或activityCategory（互斥）
        ...(searchFilters.queryMode === 'type' && searchFilters.activityType && { activityType: searchFilters.activityType }),
        ...(searchFilters.queryMode === 'category' && searchFilters.activityCategory && { activityCategory: searchFilters.activityCategory }),
        ...(searchFilters.dateTimeRange.startTime && { startTime: searchFilters.dateTimeRange.startTime }),
        ...(searchFilters.dateTimeRange.endTime && { endTime: searchFilters.dateTimeRange.endTime }),
        ...(searchFilters.ip && { ip: searchFilters.ip })
      };

      const response = await AdminLogsService.getUserActivityLogs(params);
      setLogs(response.records);
      setTotalPages(response.pages);
      setTotalCount(response.total);
    } catch (error) {
      console.error('加载日志列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchFilters]);

  // 初始化加载
  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // 处理搜索
  const handleSearch = () => {
    setSearchFilters({ ...searchInput });
    setCurrentPage(1);
  };

  // 重置搜索
  const handleReset = () => {
    const resetFilters = {
      userId: '',
      queryMode: 'type' as 'type' | 'category',
      activityType: '' as ActivityType | '',
      activityCategory: '' as ActivityCategory | '',
      dateTimeRange: { startTime: undefined, endTime: undefined } as DateTimeRange,
      ip: ''
    };
    setSearchInput(resetFilters);
    setSearchFilters(resetFilters);
    setCurrentPage(1);
  };


  // 查询模式切换处理器
  const handleQueryModeChange = (mode: 'type' | 'category') => {
    setSearchInput({
      ...searchInput,
      queryMode: mode,
      // 切换模式时清空另一种模式的选择
      activityType: mode === 'category' ? '' : searchInput.activityType,
      activityCategory: mode === 'type' ? '' : searchInput.activityCategory
    });
  };

  // 获取活动类型标签样式
  const getActivityTypeBadge = useCallback((activityType: ActivityType) => {
    const typeMap: Record<ActivityType, { variant: 'success' | 'warning' | 'danger' | 'secondary', label: string }> = {
      // 认证相关
      'LOGIN_SUCCESS': { variant: 'success', label: '登录成功' },
      'LOGIN_FAILED': { variant: 'danger', label: '登录失败' },
      'REGISTER_SUCCESS': { variant: 'success', label: '注册成功' },
      'REGISTER_FAILED': { variant: 'danger', label: '注册失败' },
      'LOGOUT': { variant: 'secondary', label: '用户登出' },
      'CHANGE_PASSWORD': { variant: 'warning', label: '修改密码' },
      'RESET_PASSWORD': { variant: 'warning', label: '重置密码' },
      // 内容浏览
      'VIEW_POST': { variant: 'secondary', label: '查看文章' },
      'VIEW_COURSE': { variant: 'secondary', label: '查看课程' },
      'VIEW_USER_PROFILE': { variant: 'secondary', label: '查看用户资料' },
      'SEARCH_CONTENT': { variant: 'secondary', label: '搜索内容' },
      // 内容创作
      'CREATE_POST': { variant: 'success', label: '发表文章' },
      'UPDATE_POST': { variant: 'warning', label: '编辑文章' },
      'DELETE_POST': { variant: 'danger', label: '删除文章' },
      'CREATE_COURSE': { variant: 'success', label: '创建课程' },
      'UPDATE_COURSE': { variant: 'warning', label: '编辑课程' },
      'DELETE_COURSE': { variant: 'danger', label: '删除课程' },
      // 社交互动
      'LIKE_POST': { variant: 'success', label: '点赞文章' },
      'UNLIKE_POST': { variant: 'secondary', label: '取消点赞文章' },
      'COMMENT_POST': { variant: 'success', label: '评论文章' },
      'DELETE_COMMENT': { variant: 'danger', label: '删除评论' },
      'FOLLOW_USER': { variant: 'success', label: '关注用户' },
      'UNFOLLOW_USER': { variant: 'secondary', label: '取消关注用户' },
      'SHARE_POST': { variant: 'success', label: '分享文章' },
      // 学习行为
      'ENROLL_COURSE': { variant: 'success', label: '注册课程' },
      'COMPLETE_CHAPTER': { variant: 'success', label: '完成章节' },
      'START_LEARNING': { variant: 'success', label: '开始学习' },
      // 管理操作
      'ADMIN_LOGIN': { variant: 'warning', label: '管理员登录' },
      'ADMIN_UPDATE_USER': { variant: 'warning', label: '管理员更新用户' },
      'ADMIN_DELETE_POST': { variant: 'danger', label: '管理员删除文章' },
      'ADMIN_UPDATE_COURSE': { variant: 'warning', label: '管理员更新课程' }
    };

    const { variant, label } = typeMap[activityType] || { variant: 'secondary', label: '未知' };
    return <Badge variant={variant}>{label}</Badge>;
  }, []);

  // 格式化时间
  const formatDateTime = useCallback((dateString: string) => {
    // 如果已经是格式化的字符串，直接返回
    if (dateString.includes('-') && dateString.includes(':')) {
      return dateString;
    }
    // 否则按照之前的逻辑格式化
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, []);


  // 显示完整 UserAgent
  const getFullUserAgent = useCallback((userAgent: string | undefined) => {
    return userAgent || '';
  }, []);

  // 保存显示配置 - 实时更新
  const updateDisplayConfig = (key: keyof DisplayConfig, value: boolean | number) => {
    const newConfig = { ...displayConfig, [key]: value };
    setDisplayConfig(newConfig);
    localStorage.setItem('logsDisplayConfig', JSON.stringify(newConfig));
  };

  // 获取目标类型图标和样式
  const getTargetTypeDisplay = useCallback((targetType: TargetType, targetName?: string) => {
    if (!targetType) return null;

    const typeMap: Record<NonNullable<TargetType>, { icon: React.ReactNode; label: string; color: string }> = {
      'POST': { icon: <FileText className="h-4 w-4" />, label: '文章', color: 'text-blue-600' },
      'COURSE': { icon: <BookOpen className="h-4 w-4" />, label: '课程', color: 'text-green-600' },
      'USER': { icon: <User className="h-4 w-4" />, label: '用户', color: 'text-purple-600' },
      'COMMENT': { icon: <MessageSquare className="h-4 w-4" />, label: '评论', color: 'text-orange-600' },
      'CATEGORY': { icon: <Tag className="h-4 w-4" />, label: '分类', color: 'text-pink-600' }
    };

    const config = typeMap[targetType];
    
    // 截断长目标名称
    const truncateTargetName = (name: string, maxLength: number = 20) => {
      return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
    };

    return (
      <div className={`flex items-center space-x-1 text-sm ${config.color}`}>
        {config.icon}
        <span>{config.label}</span>
        {targetName && (
          <>
            <span className="text-gray-400">·</span>
            <span 
              className="font-medium text-gray-700" 
              title={targetName}
            >
              {truncateTargetName(targetName)}
            </span>
          </>
        )}
      </div>
    );
  }, []);

  // 解析上下文数据
  const parseContextData = useCallback((contextData: string | undefined) => {
    if (!contextData) return null;
    try {
      return JSON.parse(contextData);
    } catch {
      return null;
    }
  }, []);

  // 创建日志列表项
  const createLogItems = useCallback((): ExpandableListItem<UserActivityLogDTO>[] => {
    return createExpandableItems(
      logs,
      (log) => (
        <div className="space-y-3">
          {/* 主要信息行 */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {getActivityTypeBadge(log.activityType)}
              {displayConfig.showTargetInfo && getTargetTypeDisplay(log.targetType, log.targetName)}
            </div>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Clock className="h-4 w-4 mr-1" />
              {formatDateTime(log.createTime)}
            </div>
          </div>
          {/* 用户信息行 */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              <span className="font-medium">{log.nickname}</span>
            </div>
            {log.ip && (
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-1" />
                <span>{log.ip}</span>
              </div>
            )}
            {log.userAgent && displayConfig.showUserAgent && (
              <div className="flex items-center">
                <Monitor className="h-4 w-4 mr-1" />
                <span className="truncate max-w-xs" title={log.userAgent}>
                  {getFullUserAgent(log.userAgent)}
                </span>
              </div>
            )}
          </div>
          {/* 失败原因 */}
          {log.failureReason && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-2 rounded">
              <span className="font-medium">失败原因:</span> {log.failureReason}
            </div>
          )}
        </div>
      ),
      (log) => {
        const contextData = parseContextData(log.contextData);
        if (!contextData && !log.failureReason) return null;
        return (
          <div className="space-y-3">
            {/* 上下文数据 */}
            {contextData && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">操作详情</h4>
                <div className="bg-gray-100 dark:bg-gray-700 rounded p-3">
                  <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap overflow-auto max-h-64">
                    {JSON.stringify(contextData, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        );
      },
      (log) => log.id,
      {
        expandable: (log) => {
          const contextData = parseContextData(log.contextData);
          return !!(contextData || log.failureReason);
        },
      }
    );
  }, [logs, displayConfig, getActivityTypeBadge, getTargetTypeDisplay, formatDateTime, getFullUserAgent, parseContextData]);


  // 简洁的字段配置组件
  const SimpleFieldConfig = () => {
    const fieldOptions = [
      { key: 'showUserAgent', label: '用户代理' },
      { key: 'showRequestPath', label: '请求路径' },
      { key: 'showBrowserInfo', label: '浏览器解析' },
      { key: 'showEquipment', label: '设备信息' },
      { key: 'showTargetInfo', label: '目标信息' }
    ];

    return (
      <Card>
        <div className="p-4">
          {/* 字段开关行 */}
          <div className="flex items-center flex-wrap gap-x-6 gap-y-2">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">显示字段:</span>
            {fieldOptions.map((field) => (
              <label key={field.key} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={displayConfig[field.key as keyof DisplayConfig] as boolean}
                  onChange={(e) => updateDisplayConfig(field.key as keyof DisplayConfig, e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 whitespace-nowrap">{field.label}</span>
              </label>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDisplayConfig(defaultDisplayConfig);
                localStorage.setItem('logsDisplayConfig', JSON.stringify(defaultDisplayConfig));
              }}
            >
              重置
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">用户活动日志</h1>
          <p className="text-gray-600 mt-1">查看和管理用户活动记录</p>
        </div>
      </div>

      {/* 搜索筛选区域 */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">筛选条件</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 用户ID搜索 */}
            <Input
              label="用户ID"
              placeholder="输入用户ID"
              value={searchInput.userId}
              onChange={(e) => setSearchInput({ ...searchInput, userId: e.target.value })}
              icon={<User className="h-5 w-5" />}
            />

            {/* 查询模式切换器 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                查询模式
              </label>
              <div className="flex space-x-2">
                <Button
                  variant={searchInput.queryMode === 'type' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleQueryModeChange('type')}
                  className="flex-1"
                >
                  按具体类型
                </Button>
                <Button
                  variant={searchInput.queryMode === 'category' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleQueryModeChange('category')}
                  className="flex-1"
                >
                  按分类查询
                </Button>
              </div>
            </div>

            {/* 活动类型筛选 - 仅在具体类型模式下显示 */}
            {searchInput.queryMode === 'type' && (
              <Select
                label="活动类型"
                options={activityTypeOptions}
                value={searchInput.activityType}
                onChange={(value) => setSearchInput({ ...searchInput, activityType: value as ActivityType | '' })}
              />
            )}

            {/* 活动分类筛选 - 仅在分类模式下显示 */}
            {searchInput.queryMode === 'category' && (
              <Select
                label="活动分类"
                options={activityCategoryOptions}
                value={searchInput.activityCategory}
                onChange={(value) => setSearchInput({ ...searchInput, activityCategory: value as ActivityCategory | '' })}
              />
            )}

            {/* 时间范围选择器 */}
            <div className="lg:col-span-2">
              <DateTimeRangePicker
                label="时间范围"
                placeholder="选择时间范围"
                value={searchInput.dateTimeRange}
                onChange={(range) => setSearchInput({ ...searchInput, dateTimeRange: range })}
              />
            </div>

            {/* IP地址搜索 */}
            <Input
              label="IP地址"
              placeholder="输入IP地址"
              value={searchInput.ip}
              onChange={(e) => setSearchInput({ ...searchInput, ip: e.target.value })}
              icon={<Globe className="h-5 w-5" />}
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={handleReset}
            >
              重置
            </Button>
            <Button
              variant="outline"
              onClick={handleSearch}
              disabled={isLoading}
            >
              <Search className="h-4 w-4 mr-2" />
              搜索
            </Button>
          </div>
        </div>
      </Card>

      {/* 字段配置面板 */}
      <SimpleFieldConfig />

      {/* 日志列表 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            日志记录
            {totalCount > 0 && (
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                共 {totalCount} 条记录
              </span>
            )}
          </h3>
        </div>

        <ExpandableList
          items={createLogItems()}
          loading={isLoading}
          emptyText="暂无日志记录"
          emptyDescription="尝试调整筛选条件或等待新的活动记录"
          emptyIcon={<Eye className="w-12 h-12 text-gray-400 dark:text-gray-500" />}
          pagination={
            totalPages > 1 ? (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                onChange={setCurrentPage}
                mode="complex"
                showQuickJumper={true}
              />
            ) : undefined
          }
        />
      </div>
    </div>
  );
};