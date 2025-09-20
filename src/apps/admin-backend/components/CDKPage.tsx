import React, { useState, useCallback, useEffect } from 'react';
import {
  Plus,
  Copy,
  Trash2,
  Key,
  Calendar,
  ChevronRight,
  ChevronLeft,
  User,
  Package,
  BookOpen,
  Filter
} from 'lucide-react';
import { Card } from '@shared/components/ui/Card';
import { Button } from '@shared/components/ui/Button';
import { Badge } from '@shared/components/ui/Badge';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { LoadingSpinner } from '@shared/components/ui/LoadingSpinner';
import { Select } from '@shared/components/ui/Select';
import { CDKService } from '@shared/services/api';
import {
  CDKDTO,
  CDKQueryRequest,
  CDKType,
  CDKStatus,
  PageResponse
} from '@shared/types';
import { CreateCDKModal } from './CreateCDKModal';
import toast from 'react-hot-toast';

export const CDKPage: React.FC = () => {
  // 状态管理
  const [cdks, setCdks] = useState<CDKDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deletingCDK, setDeletingCDK] = useState<CDKDTO | null>(null);

  // 筛选状态
  const [filters, setFilters] = useState<CDKQueryRequest>({
    pageNum: 1,
    pageSize: 20
  });

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // 加载CDK列表
  const loadCDKs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: CDKQueryRequest = {
        ...filters,
        pageNum: currentPage,
        pageSize: 20
      };

      const response: PageResponse<CDKDTO> = await CDKService.getPagedCDKs(params);

      setCdks(response.records || []);
      setTotalPages(response.pages || 1);
      setTotalCount(response.total || 0);
    } catch (error) {
      console.error('加载CDK列表失败:', error);
      setCdks([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage]);

  // 删除CDK
  const handleDelete = useCallback(async () => {
    if (!deletingCDK) return;

    try {
      await CDKService.deleteCDK(deletingCDK.id);
      setDeletingCDK(null);
      loadCDKs();
    } catch (error) {
      console.error('删除CDK失败:', error);
    }
  }, [deletingCDK, loadCDKs]);

  // 复制CDK
  const handleCopy = useCallback((code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      toast.success('兑换码已复制到剪贴板');
    }).catch(() => {
      toast.error('复制失败，请手动复制');
    });
  }, []);

  // 创建CDK成功回调
  const handleCreateSuccess = useCallback(() => {
    setIsCreateModalOpen(false);
    loadCDKs();
  }, [loadCDKs]);

  // 处理筛选变化
  const handleFilterChange = useCallback((key: keyof CDKQueryRequest, value: string | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  // 重置筛选
  const handleResetFilters = useCallback(() => {
    setFilters({ pageNum: 1, pageSize: 20 });
    setCurrentPage(1);
  }, []);

  // 格式化日期显示
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  // 获取CDK类型显示文本
  const getCDKTypeText = (type: CDKType) => {
    return type === 'SUBSCRIPTION_PLAN' ? '套餐' : '课程';
  };

  // 获取CDK类型图标
  const getCDKTypeIcon = (type: CDKType) => {
    return type === 'SUBSCRIPTION_PLAN' ? Package : BookOpen;
  };

  // 获取状态变体
  const getStatusVariant = (status: CDKStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'USED':
        return 'secondary';
      case 'DISABLED':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // 获取状态文本
  const getStatusText = (status: CDKStatus) => {
    switch (status) {
      case 'ACTIVE':
        return '可用';
      case 'USED':
        return '已使用';
      case 'DISABLED':
        return '已禁用';
      default:
        return '未知';
    }
  };

  // 分页控件
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        {startPage > 1 && (
          <>
            <Button variant="secondary" size="sm" onClick={() => setCurrentPage(1)}>1</Button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}
        {pages}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2">...</span>}
            <Button variant="secondary" size="sm" onClick={() => setCurrentPage(totalPages)}>
              {totalPages}
            </Button>
          </>
        )}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  // 筛选选项
  const cdkTypeOptions = [
    { value: '', label: '全部类型' },
    { value: 'SUBSCRIPTION_PLAN', label: '套餐' },
    { value: 'COURSE', label: '课程' }
  ];

  const statusOptions = [
    { value: '', label: '全部状态' },
    { value: 'ACTIVE', label: '可用' },
    { value: 'USED', label: '已使用' },
    { value: 'DISABLED', label: '已禁用' }
  ];

  // 初始加载
  useEffect(() => {
    loadCDKs();
  }, [loadCDKs]);

  return (
    <div className="p-6">
      {/* 页面标题和操作按钮 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Key className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CDK管理</h1>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          生成CDK
        </Button>
      </div>

      {/* 筛选栏 */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">筛选条件:</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">类型:</span>
              <Select
                value={filters.cdkType || ''}
                onChange={(value) => handleFilterChange('cdkType', value || undefined)}
                options={cdkTypeOptions}
                className="w-32"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">状态:</span>
              <Select
                value={filters.status || ''}
                onChange={(value) => handleFilterChange('status', value || undefined)}
                options={statusOptions}
                className="w-32"
              />
            </div>

            <Button variant="secondary" size="sm" onClick={handleResetFilters}>
              重置
            </Button>
          </div>
        </div>
      </Card>

      {/* 数据表格 */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      兑换码
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      类型
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      绑定目标
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      使用信息
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      创建时间
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {cdks.map((cdk) => {
                    const TypeIcon = getCDKTypeIcon(cdk.cdkType);
                    return (
                      <tr key={cdk.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4">
                          <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
                            {cdk.code}
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <TypeIcon className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {getCDKTypeText(cdk.cdkType)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {cdk.targetName}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={getStatusVariant(cdk.status)}>
                            {getStatusText(cdk.status)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          {cdk.status === 'USED' && cdk.usedTime ? (
                            <div className="text-sm">
                              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                <User className="w-3 h-3" />
                                <span>用户ID: {cdk.usedByUserId}</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-500">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(cdk.usedTime)}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(cdk.createTime)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleCopy(cdk.code)}
                              title="复制兑换码"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            {cdk.status !== 'USED' && (
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => setDeletingCDK(cdk)}
                                title="删除CDK"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 空状态 */}
            {cdks.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  没有找到CDK
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  暂无CDK数据，可以生成新的兑换码
                </p>
              </div>
            )}

            {/* 分页和统计信息 */}
            {cdks.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    共 {totalCount} 条记录，第 {currentPage} 页，共 {totalPages} 页
                  </div>
                  {renderPagination()}
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* 生成CDK模态框 */}
      <CreateCDKModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={!!deletingCDK}
        title="确认删除"
        message={`确定要删除兑换码"${deletingCDK?.code}"吗？此操作不可撤销。`}
        onConfirm={handleDelete}
        onCancel={() => setDeletingCDK(null)}
        variant="danger"
      />
    </div>
  );
};