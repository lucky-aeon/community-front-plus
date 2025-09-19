import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@shared/components/ui/Card';
import { Button } from '@shared/components/ui/Button';
import { Badge } from '@shared/components/ui/Badge';
import { LoadingSpinner } from '@shared/components/ui/LoadingSpinner';
import { DateTimeRangePicker, DateTimeRange } from '@shared/components/ui/DateTimeRangePicker';
import { AdminLogsService } from '@shared/services/api/admin-logs.service';
import { 
  UserActivityLogDTO, 
  ActivityLogQueryRequest,
  ActivityType,
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
  Tag,
  ChevronDown,
  ChevronUp,
  Link,
  Smartphone,
  Computer,
  Zap
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
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  
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
    activityType: '' as ActivityType | '',
    dateTimeRange: { startTime: undefined, endTime: undefined } as DateTimeRange,
    ip: ''
  });
  
  // 搜索筛选状态 - 用于API调用
  const [searchFilters, setSearchFilters] = useState({
    userId: '',
    activityType: '' as ActivityType | '',
    dateTimeRange: { startTime: undefined, endTime: undefined } as DateTimeRange,
    ip: ''
  });

  // 活动类型选项配置
  const activityTypeOptions: SelectOption[] = [
    { value: '', label: '全部活动类型' },
    { value: 'LOGIN_SUCCESS', label: '登录成功' },
    { value: 'LOGIN_FAILED', label: '登录失败' },
    { value: 'LOGOUT', label: '退出登录' },
    { value: 'VIEW_POST', label: '浏览文章' },
    { value: 'CREATE_POST', label: '创建文章' },
    { value: 'UPDATE_POST', label: '更新文章' },
    { value: 'DELETE_POST', label: '删除文章' },
    { value: 'VIEW_COURSE', label: '浏览课程' },
    { value: 'CREATE_COMMENT', label: '创建评论' },
    { value: 'UPDATE_PROFILE', label: '更新个人资料' },
    { value: 'CHANGE_PASSWORD', label: '修改密码' },
    { value: 'UPLOAD_FILE', label: '上传文件' },
    { value: 'OTHER', label: '其他活动' }
  ];

  // 加载日志列表
  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: ActivityLogQueryRequest = {
        pageNum: currentPage,
        pageSize: 20,
        ...(searchFilters.userId && { userId: searchFilters.userId }),
        ...(searchFilters.activityType && { activityType: searchFilters.activityType }),
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
      activityType: '' as ActivityType | '',
      dateTimeRange: { startTime: undefined, endTime: undefined } as DateTimeRange,
      ip: ''
    };
    setSearchInput(resetFilters);
    setSearchFilters(resetFilters);
    setCurrentPage(1);
  };

  // 生成分页按钮
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // 上一页
    pages.push(
      <Button
        key="prev"
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        上一页
      </Button>
    );

    // 页码按钮
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? "primary" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </Button>
      );
    }

    // 下一页
    pages.push(
      <Button
        key="next"
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        下一页
      </Button>
    );

    return pages;
  };

  // 获取活动类型标签样式
  const getActivityTypeBadge = (activityType: ActivityType) => {
    const typeMap: Record<ActivityType, { variant: 'success' | 'warning' | 'danger' | 'secondary', label: string }> = {
      'LOGIN_SUCCESS': { variant: 'success', label: '登录成功' },
      'LOGIN_FAILED': { variant: 'danger', label: '登录失败' },
      'LOGOUT': { variant: 'secondary', label: '退出登录' },
      'VIEW_POST': { variant: 'secondary', label: '浏览文章' },
      'CREATE_POST': { variant: 'success', label: '创建文章' },
      'UPDATE_POST': { variant: 'warning', label: '更新文章' },
      'DELETE_POST': { variant: 'danger', label: '删除文章' },
      'VIEW_COURSE': { variant: 'secondary', label: '浏览课程' },
      'CREATE_COMMENT': { variant: 'success', label: '创建评论' },
      'UPDATE_PROFILE': { variant: 'warning', label: '更新资料' },
      'CHANGE_PASSWORD': { variant: 'warning', label: '修改密码' },
      'UPLOAD_FILE': { variant: 'success', label: '上传文件' },
      'OTHER': { variant: 'secondary', label: '其他活动' }
    };

    const { variant, label } = typeMap[activityType] || { variant: 'secondary', label: '未知' };
    return <Badge variant={variant}>{label}</Badge>;
  };

  // 格式化时间
  const formatDateTime = (dateString: string) => {
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
  };

  // 解析 UserAgent 信息
  const parseUserAgent = (userAgent: string) => {
    if (!userAgent) return null;

    const ua = userAgent.toLowerCase();
    let browser = 'unknown';
    let browserIcon = <Monitor className="h-4 w-4" />;
    let os = '';

    // 检测浏览器 - 使用可用的 Lucide 图标
    if (ua.includes('chrome') && !ua.includes('edg')) {
      browser = 'Chrome';
      browserIcon = <Globe className="h-4 w-4" />; // 使用 Globe 代替 Chrome
    } else if (ua.includes('firefox')) {
      browser = 'Firefox';
      browserIcon = <Monitor className="h-4 w-4" />; // 使用 Monitor 代替 Firefox
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      browser = 'Safari';
      browserIcon = <Computer className="h-4 w-4" />; // 使用 Computer 代替 Safari
    } else if (ua.includes('edge') || ua.includes('edg')) {
      browser = 'Edge';
      browserIcon = <Zap className="h-4 w-4" />; // Zap 图标存在，保持不变
    }

    // 检测操作系统
    if (ua.includes('windows')) {
      os = 'Windows';
    } else if (ua.includes('mac')) {
      os = 'macOS';
    } else if (ua.includes('linux')) {
      os = 'Linux';
    } else if (ua.includes('android')) {
      os = 'Android';
    } else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) {
      os = 'iOS';
    }

    return { browser, browserIcon, os };
  };

  // 显示完整 UserAgent
  const getFullUserAgent = (userAgent: string | undefined) => {
    return userAgent || '';
  };

  // 保存显示配置 - 实时更新
  const updateDisplayConfig = (key: keyof DisplayConfig, value: boolean | number) => {
    const newConfig = { ...displayConfig, [key]: value };
    setDisplayConfig(newConfig);
    localStorage.setItem('logsDisplayConfig', JSON.stringify(newConfig));
  };

  // 获取目标类型图标和样式
  const getTargetTypeDisplay = (targetType: TargetType, targetName?: string) => {
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
  };

  // 解析上下文数据
  const parseContextData = (contextData: string | undefined) => {
    if (!contextData) return null;
    try {
      return JSON.parse(contextData);
    } catch {
      return null;
    }
  };

  // 切换展开状态
  const toggleExpanded = (logId: string) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

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

            {/* 活动类型筛选 */}
            <Select
              label="活动类型"
              options={activityTypeOptions}
              value={searchInput.activityType}
              onChange={(value) => setSearchInput({ ...searchInput, activityType: value as ActivityType | '' })}
            />

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
              variant="primary"
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
      <Card>
        {/* 列表头部 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              日志记录
              {totalCount > 0 && (
                <span className="ml-2 text-sm text-gray-500">
                  共 {totalCount} 条记录
                </span>
              )}
            </h3>
          </div>
        </div>

        {/* 加载状态 */}
        {isLoading && (
          <div className="p-8 text-center">
            <LoadingSpinner size="lg" />
            <p className="text-gray-500 mt-2">加载中...</p>
          </div>
        )}

        {/* 日志列表内容 */}
        {!isLoading && (
          <>
            {logs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>暂无日志记录</p>
                <p className="text-sm mt-1">尝试调整筛选条件或等待新的活动记录</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {logs.map((log) => {
                  const isExpanded = expandedLogs.has(log.id);
                  const contextData = parseContextData(log.contextData);
                  
                  return (
                    <div key={log.id} className="p-6 hover:bg-gray-50">
                      <div className="space-y-3">
                        {/* 主要信息行 */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              {getActivityTypeBadge(log.activityType)}
                              {displayConfig.showTargetInfo && getTargetTypeDisplay(log.targetType, log.targetName)}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatDateTime(log.createTime)}
                            </div>
                          </div>
                          {/* 展开/收起按钮 */}
                          {(contextData || log.failureReason) && (
                            <button
                              onClick={() => toggleExpanded(log.id)}
                              className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
                            >
                              {isExpanded ? (
                                <>
                                  <span className="mr-1">收起</span>
                                  <ChevronUp className="h-4 w-4" />
                                </>
                              ) : (
                                <>
                                  <span className="mr-1">更多</span>
                                  <ChevronDown className="h-4 w-4" />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        
                        {/* 用户信息行 */}
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
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
                        </div>

                        {/* UserAgent 信息行 - 重点显示 */}
                        {displayConfig.showUserAgent && log.userAgent && (
                          <div className="space-y-2">
                            {displayConfig.showBrowserInfo && (
                              <div className="flex items-center space-x-3 text-sm">
                                {(() => {
                                  const parsed = parseUserAgent(log.userAgent);
                                  return parsed ? (
                                    <div className="flex items-center space-x-2 text-gray-600">
                                      <div className="flex items-center space-x-1">
                                        {parsed.browserIcon}
                                        <span className="font-medium">{parsed.browser}</span>
                                      </div>
                                      {parsed.os && (
                                        <>
                                          <span className="text-gray-400">·</span>
                                          <span>{parsed.os}</span>
                                        </>
                                      )}
                                    </div>
                                  ) : null;
                                })()}
                              </div>
                            )}
                            <div className="text-sm">
                              <div 
                                className="p-3 bg-gray-50 rounded-lg border border-gray-200 font-mono text-xs text-gray-700 break-all"
                                title={log.userAgent}
                              >
                                {getFullUserAgent(log.userAgent)}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 请求路径信息行 */}
                        {displayConfig.showRequestPath && log.requestPath && (
                          <div className="text-sm">
                            <div className="flex items-center text-gray-600 mb-1">
                              <Link className="h-4 w-4 mr-1" />
                              <span className="font-medium">请求路径</span>
                            </div>
                            <div className="p-2 bg-blue-50 rounded border border-blue-200 font-mono text-xs text-blue-800">
                              {log.requestPath}
                            </div>
                          </div>
                        )}

                        {/* 设备信息行（简化） */}
                        {displayConfig.showEquipment && (log.browser || log.equipment) && (
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            {log.browser && (
                              <div className="flex items-center">
                                <Monitor className="h-4 w-4 mr-1" />
                                <span>浏览器: {log.browser}</span>
                              </div>
                            )}
                            
                            {log.equipment && (
                              <div className="flex items-center">
                                <Smartphone className="h-4 w-4 mr-1" />
                                <span>设备: {log.equipment}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 活动描述 */}
                        {log.activityTypeDesc && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">描述：</span>
                            {log.activityTypeDesc}
                          </div>
                        )}

                        {/* 展开的详细信息 */}
                        {isExpanded && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                            {/* 上下文数据 */}
                            {contextData && (
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">上下文信息：</span>
                                <div className="mt-1 p-2 bg-white rounded border">
                                  {Object.entries(contextData).map(([key, value]) => (
                                    <div key={key} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                                      <span className="font-medium text-gray-600">{key}:</span>
                                      <span className="text-gray-800">{String(value)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 失败原因 */}
                            {log.failureReason && (
                              <div className="text-sm">
                                <span className="font-medium text-red-600">失败原因：</span>
                                <div className="mt-1 p-2 bg-red-50 rounded border border-red-200 text-red-700">
                                  {log.failureReason}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 分页控件 */}
            {totalPages > 1 && (
              <div className="p-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-700">
                    显示第 {(currentPage - 1) * 20 + 1} - {Math.min(currentPage * 20, totalCount)} 条，
                    共 {totalCount} 条记录
                  </div>
                  <div className="flex space-x-2">
                    {renderPagination()}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};