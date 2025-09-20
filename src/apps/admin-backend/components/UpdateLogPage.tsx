import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, Search, Globe, AlertCircle } from 'lucide-react';
import { Card } from '@shared/components/ui/Card';
import { Button } from '@shared/components/ui/Button';
import { Badge } from '@shared/components/ui/Badge';
import { Input } from '@shared/components/ui/Input';
import { Select, SelectOption } from '@shared/components/ui/Select';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { DataTable, DataTableColumn } from '@shared/components/ui/DataTable';
import { Pagination } from '@shared/components/ui/Pagination';
import { TableActions, TableAction } from '@shared/components/ui/TableActions';
import { UpdateLogService } from '@shared/services/api';
import { UpdateLogModal } from './UpdateLogModal';
import type {
  UpdateLogDTO,
  AdminUpdateLogQueryRequest,
  UpdateLogStatus,
  ChangeType
} from '@shared/types';

export const UpdateLogPage: React.FC = () => {
  // 状态管理
  const [updateLogs, setUpdateLogs] = useState<UpdateLogDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isToggling, setIsToggling] = useState<string | null>(null);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  // 弹窗状态
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<UpdateLogDTO | null>(null);

  // 确认对话框状态
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'delete' | 'toggle';
    updateLogId?: string;
    updateLogTitle?: string;
    currentStatus?: UpdateLogStatus;
  }>({ isOpen: false, type: 'delete' });

  // 搜索筛选状态
  const [searchInput, setSearchInput] = useState({
    version: '',
    title: '',
    status: '' as UpdateLogStatus | ''
  });

  const [searchFilters, setSearchFilters] = useState({
    version: '',
    title: '',
    status: '' as UpdateLogStatus | ''
  });

  // 状态选项配置
  const statusOptions: SelectOption[] = [
    { value: '', label: '全部状态' },
    { value: 'DRAFT', label: '草稿' },
    { value: 'PUBLISHED', label: '已发布' }
  ];

  // 加载更新日志列表
  const loadUpdateLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: AdminUpdateLogQueryRequest = {
        pageNum: currentPage,
        pageSize,
        ...(searchFilters.version && { version: searchFilters.version }),
        ...(searchFilters.title && { title: searchFilters.title }),
        ...(searchFilters.status && { status: searchFilters.status })
      };

      const response = await UpdateLogService.getUpdateLogs(params);
      setUpdateLogs(response.records);
      setTotalPages(response.pages);
      setTotalCount(response.total);
    } catch (error) {
      console.error('加载更新日志列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchFilters, pageSize]);

  // 初始化加载
  useEffect(() => {
    loadUpdateLogs();
  }, [loadUpdateLogs]);

  // 处理搜索
  const handleSearch = () => {
    setSearchFilters({ ...searchInput });
    setCurrentPage(1);
  };

  // 重置搜索
  const handleReset = () => {
    const resetFilters = {
      version: '',
      title: '',
      status: '' as UpdateLogStatus | ''
    };
    setSearchInput(resetFilters);
    setSearchFilters(resetFilters);
    setCurrentPage(1);
  };

  // 处理回车键搜索
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 打开新增弹窗
  const handleCreate = () => {
    setEditData(null);
    setShowModal(true);
  };

  // 打开编辑弹窗
  const handleEdit = (updateLog: UpdateLogDTO) => {
    setEditData(updateLog);
    setShowModal(true);
  };

  // 关闭弹窗
  const handleCloseModal = () => {
    setShowModal(false);
    setEditData(null);
  };

  // 弹窗成功回调
  const handleModalSuccess = () => {
    loadUpdateLogs();
  };

  // 打开删除确认对话框
  const openDeleteDialog = (updateLog: UpdateLogDTO) => {
    setConfirmDialog({
      isOpen: true,
      type: 'delete',
      updateLogId: updateLog.id,
      updateLogTitle: updateLog.title
    });
  };

  // 打开状态切换确认对话框
  const openToggleDialog = (updateLog: UpdateLogDTO) => {
    setConfirmDialog({
      isOpen: true,
      type: 'toggle',
      updateLogId: updateLog.id,
      updateLogTitle: updateLog.title,
      currentStatus: updateLog.status
    });
  };

  // 关闭确认对话框
  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, type: 'delete' });
  };

  // 删除更新日志
  const handleDelete = async () => {
    if (!confirmDialog.updateLogId) return;

    try {
      await UpdateLogService.deleteUpdateLog(confirmDialog.updateLogId);
      loadUpdateLogs();
    } catch (error) {
      console.error('删除更新日志失败:', error);
    } finally {
      closeConfirmDialog();
    }
  };

  // 切换状态
  const handleToggleStatus = async () => {
    if (!confirmDialog.updateLogId) return;

    const updateLogId = confirmDialog.updateLogId;
    setIsToggling(updateLogId);

    try {
      const updatedLog = await UpdateLogService.toggleUpdateLogStatus(updateLogId);

      // 更新本地状态
      setUpdateLogs(prev => prev.map(log =>
        log.id === updateLogId ? updatedLog : log
      ));
    } catch (error) {
      console.error('切换状态失败:', error);
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

  // 获取变更类型统计信息
  const getChangeTypesSummary = (changeDetails: ChangeDetailDTO[]): string => {
    if (!changeDetails || changeDetails.length === 0) {
      return '无变更详情';
    }

    const typeMap: Record<ChangeType, string> = {
      FEATURE: '新功能',
      IMPROVEMENT: '优化',
      BUGFIX: '修复',
      BREAKING: '破坏性',
      SECURITY: '安全',
      OTHER: '其他'
    };

    const typeCounts = changeDetails.reduce((acc, change) => {
      const type = change.type as ChangeType;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<ChangeType, number>);

    return Object.entries(typeCounts)
      .map(([type, count]) => `${typeMap[type as ChangeType]}(${count})`)
      .join('、');
  };

  // 定义表格列
  const columns: DataTableColumn<UpdateLogDTO>[] = [
    {
      key: 'version',
      title: '版本',
      render: (_, updateLog) => (
        <div className="flex items-center space-x-2">
          <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
            {updateLog.version}
          </span>
          {updateLog.isImportant && (
            <Badge variant="warning" size="sm">
              <AlertCircle className="h-3 w-3 mr-1" />
              重要
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'title',
      title: '标题',
      render: (_, updateLog) => (
        <div className="max-w-xs">
          <div className="font-medium text-gray-900 dark:text-white truncate" title={updateLog.title}>
            {updateLog.title}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 truncate" title={updateLog.description}>
            {updateLog.description}
          </div>
        </div>
      ),
    },
    {
      key: 'changeDetails',
      title: '变更内容',
      render: (_, updateLog) => (
        <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
          {getChangeTypesSummary(updateLog.changeDetails)}
        </div>
      ),
    },
    {
      key: 'status',
      title: '状态',
      render: (_, updateLog) => (
        <Badge
          variant={updateLog.status === 'PUBLISHED' ? 'success' : 'secondary'}
          size="sm"
        >
          <div className="flex items-center space-x-1">
            {updateLog.status === 'PUBLISHED' ? (
              <Globe className="h-3 w-3" />
            ) : (
              <FileText className="h-3 w-3" />
            )}
            <span>{updateLog.status === 'PUBLISHED' ? '已发布' : '草稿'}</span>
          </div>
        </Badge>
      ),
    },
    {
      key: 'publishTime',
      title: '发布时间',
      render: (_, updateLog) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {updateLog.publishTime ? formatDateTime(updateLog.publishTime) : '-'}
        </span>
      ),
    },
    {
      key: 'createTime',
      title: '创建时间',
      render: (_, updateLog) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {formatDateTime(updateLog.createTime)}
        </span>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      render: (_, updateLog) => {
        const actions: TableAction[] = [
          {
            key: 'edit',
            type: 'edit',
            onClick: () => handleEdit(updateLog),
          },
          {
            key: 'toggle',
            type: 'custom',
            label: updateLog.status === 'PUBLISHED' ? '设为草稿' : '发布',
            icon: updateLog.status === 'PUBLISHED' ? (
              <FileText className="h-3.5 w-3.5" />
            ) : (
              <Globe className="h-3.5 w-3.5" />
            ),
            variant: updateLog.status === 'PUBLISHED' ? 'secondary' : 'success',
            disabled: isToggling === updateLog.id,
            onClick: () => openToggleDialog(updateLog),
          },
          {
            key: 'delete',
            type: 'delete',
            onClick: () => openDeleteDialog(updateLog),
          },
        ];
        return <TableActions actions={actions} />;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">更新日志管理</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">管理产品版本更新日志和发布公告</p>
        </div>
        <Button
          variant="primary"
          onClick={handleCreate}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>新增更新日志</span>
        </Button>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              type="text"
              placeholder="请输入版本号"
              value={searchInput.version}
              onChange={(e) => setSearchInput(prev => ({ ...prev, version: e.target.value }))}
              onKeyPress={handleKeyPress}
              icon={<Search className="h-4 w-4" />}
              label="版本号搜索"
            />

            <Input
              type="text"
              placeholder="请输入更新标题"
              value={searchInput.title}
              onChange={(e) => setSearchInput(prev => ({ ...prev, title: e.target.value }))}
              onKeyPress={handleKeyPress}
              icon={<FileText className="h-4 w-4" />}
              label="标题搜索"
            />

            <Select
              value={searchInput.status}
              onChange={(value) => setSearchInput(prev => ({ ...prev, status: value as UpdateLogStatus | '' }))}
              options={statusOptions}
              placeholder="选择状态"
              label="状态筛选"
              size="md"
            />

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

      {/* 更新日志列表 */}
      <DataTable
        columns={columns}
        data={updateLogs}
        loading={isLoading}
        rowKey="id"
        emptyText="暂无更新日志数据"
        emptyIcon={<FileText className="w-12 h-12 text-gray-400 dark:text-gray-500" />}
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

      {/* 新增/编辑弹窗 */}
      <UpdateLogModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        editData={editData}
      />

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen && confirmDialog.type === 'delete'}
        title="删除更新日志"
        message={`确定要删除更新日志 "${confirmDialog.updateLogTitle}" 吗？此操作不可撤销。`}
        confirmText="删除"
        cancelText="取消"
        onConfirm={handleDelete}
        onCancel={closeConfirmDialog}
        variant="danger"
      />

      {/* 状态切换确认对话框 */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen && confirmDialog.type === 'toggle'}
        title={`${confirmDialog.currentStatus === 'PUBLISHED' ? '设为草稿' : '发布更新日志'}`}
        message={`确定要${confirmDialog.currentStatus === 'PUBLISHED' ? '将此更新日志设为草稿' : '发布此更新日志'}吗？${confirmDialog.currentStatus === 'PUBLISHED' ? '\n\n设为草稿后，用户将无法在前台看到此更新。' : '\n\n发布后，用户可以在前台看到此更新。'}`}
        confirmText={confirmDialog.currentStatus === 'PUBLISHED' ? '设为草稿' : '发布'}
        cancelText="取消"
        onConfirm={handleToggleStatus}
        onCancel={closeConfirmDialog}
        variant={confirmDialog.currentStatus === 'PUBLISHED' ? 'warning' : 'info'}
      />
    </div>
  );
};