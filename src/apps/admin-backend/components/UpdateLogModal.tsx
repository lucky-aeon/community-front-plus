import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, FileText } from 'lucide-react';
import { PortalModal } from '@shared/components/ui/PortalModal';
import { Button } from '@shared/components/ui/Button';
import { Input } from '@shared/components/ui/Input';
import { Textarea } from '@shared/components/ui/Textarea';
import { Select, SelectOption } from '@shared/components/ui/Select';
import { Badge } from '@shared/components/ui/Badge';
import { Checkbox } from '@shared/components/ui/Checkbox';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { UpdateLogService } from '@shared/services/api';
import type {
  UpdateLogDTO,
  CreateUpdateLogRequest,
  UpdateUpdateLogRequest,
  ChangeDetailDTO,
  ChangeType
} from '@shared/types';

interface UpdateLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: UpdateLogDTO | null;
}

// 变更类型选项配置
const changeTypeOptions: SelectOption[] = [
  { value: 'FEATURE', label: '新功能' },
  { value: 'IMPROVEMENT', label: '优化改进' },
  { value: 'BUGFIX', label: '问题修复' },
  { value: 'BREAKING', label: '破坏性变更' },
  { value: 'SECURITY', label: '安全更新' },
  { value: 'OTHER', label: '其他' }
];

// 获取变更类型标签
const getChangeTypeLabel = (type: ChangeType): string => {
  const option = changeTypeOptions.find(opt => opt.value === type);
  return option?.label || type;
};

// 获取变更类型标签颜色
const getChangeTypeBadgeVariant = (type: ChangeType) => {
  switch (type) {
    case 'FEATURE':
      return 'success';
    case 'IMPROVEMENT':
      return 'info';
    case 'BUGFIX':
      return 'warning';
    case 'BREAKING':
      return 'danger';
    case 'SECURITY':
      return 'danger';
    default:
      return 'secondary';
  }
};

export const UpdateLogModal: React.FC<UpdateLogModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editData
}) => {
  // 表单状态
  const [formData, setFormData] = useState({
    version: '',
    title: '',
    description: '',
    isImportant: false
  });

  // 变更详情状态
  const [changeDetails, setChangeDetails] = useState<ChangeDetailDTO[]>([]);

  // UI 状态
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteChangeIndex, setDeleteChangeIndex] = useState<number>(-1);

  // 表单验证错误
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 初始化表单数据
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        // 编辑模式
        setFormData({
          version: editData.version,
          title: editData.title,
          description: editData.description,
          isImportant: editData.isImportant
        });
        setChangeDetails(editData.changeDetails || []);
      } else {
        // 新增模式
        resetForm();
      }
      setErrors({});
    }
  }, [isOpen, editData]);

  // 重置表单
  const resetForm = () => {
    setFormData({
      version: '',
      title: '',
      description: '',
      isImportant: false
    });
    setChangeDetails([]);
    setErrors({});
  };

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.version.trim()) {
      newErrors.version = '版本号不能为空';
    } else if (formData.version.length > 50) {
      newErrors.version = '版本号不能超过50个字符';
    }

    if (!formData.title.trim()) {
      newErrors.title = '更新标题不能为空';
    } else if (formData.title.length > 200) {
      newErrors.title = '更新标题不能超过200个字符';
    }

    if (!formData.description.trim()) {
      newErrors.description = '更新描述不能为空';
    } else if (formData.description.length > 2000) {
      newErrors.description = '更新描述不能超过2000个字符';
    }

    if (changeDetails.length === 0) {
      newErrors.changeDetails = '至少需要添加一个变更详情';
    }

    // 验证变更详情
    changeDetails.forEach((change, index) => {
      if (!change.title.trim()) {
        newErrors[`change_${index}_title`] = '变更标题不能为空';
      } else if (change.title.length > 200) {
        newErrors[`change_${index}_title`] = '变更标题不能超过200个字符';
      }

      if (!change.description.trim()) {
        newErrors[`change_${index}_description`] = '变更描述不能为空';
      } else if (change.description.length > 2000) {
        newErrors[`change_${index}_description`] = '变更描述不能超过2000个字符';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 添加变更详情
  const addChangeDetail = () => {
    const newChange: ChangeDetailDTO = {
      type: 'FEATURE',
      title: '',
      description: ''
    };
    setChangeDetails([...changeDetails, newChange]);
  };

  // 更新变更详情
  const updateChangeDetail = (index: number, field: keyof ChangeDetailDTO, value: string | ChangeType) => {
    const updated = changeDetails.map((change, i) =>
      i === index ? { ...change, [field]: value } : change
    );
    setChangeDetails(updated);

    // 清除相关错误
    const newErrors = { ...errors };
    delete newErrors[`change_${index}_${field}`];
    setErrors(newErrors);
  };

  // 删除变更详情
  const handleDeleteChange = (index: number) => {
    setDeleteChangeIndex(index);
    setShowDeleteConfirm(true);
  };

  // 确认删除变更详情
  const confirmDeleteChange = () => {
    if (deleteChangeIndex >= 0) {
      const updated = changeDetails.filter((_, i) => i !== deleteChangeIndex);
      setChangeDetails(updated);

      // 清除相关错误
      const newErrors = { ...errors };
      delete newErrors[`change_${deleteChangeIndex}_title`];
      delete newErrors[`change_${deleteChangeIndex}_description`];
      setErrors(newErrors);
    }
    setShowDeleteConfirm(false);
    setDeleteChangeIndex(-1);
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const requestData = {
        ...formData,
        changeDetails
      };

      if (editData) {
        // 编辑模式
        await UpdateLogService.updateUpdateLog(editData.id, requestData as UpdateUpdateLogRequest);
      } else {
        // 新增模式
        await UpdateLogService.createUpdateLog(requestData as CreateUpdateLogRequest);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('保存更新日志失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditMode = !!editData;
  const modalTitle = isEditMode ? '编辑更新日志' : '新增更新日志';

  return (
    <>
      <PortalModal isOpen={isOpen} onClose={onClose}>
        <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* 头部 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {modalTitle}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isEditMode ? '修改更新日志信息和变更详情' : '创建新的产品更新日志'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* 内容区域 */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 基本信息 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">基本信息</h3>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="版本号"
                  placeholder="例如：v1.2.3"
                  value={formData.version}
                  onChange={(e) => {
                    setFormData({ ...formData, version: e.target.value });
                    const newErrors = { ...errors };
                    delete newErrors.version;
                    setErrors(newErrors);
                  }}
                  error={errors.version}
                  required
                />

                <Checkbox
                  checked={formData.isImportant}
                  onChange={(checked) => setFormData({ ...formData, isImportant: checked })}
                  label="重要更新"
                  variant="warning"
                  size="md"
                />
              </div>

              <Input
                label="更新标题"
                placeholder="请输入更新标题"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  const newErrors = { ...errors };
                  delete newErrors.title;
                  setErrors(newErrors);
                }}
                error={errors.title}
                required
              />

              <Textarea
                label="更新描述"
                placeholder="请输入更新的总体描述"
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  const newErrors = { ...errors };
                  delete newErrors.description;
                  setErrors(newErrors);
                }}
                error={errors.description}
                rows={3}
                required
              />
            </div>

            {/* 变更详情 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">变更详情</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addChangeDetail}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>添加变更</span>
                </Button>
              </div>

              {errors.changeDetails && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  {errors.changeDetails}
                </div>
              )}

              <div className="space-y-4">
                {changeDetails.map((change, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant={getChangeTypeBadgeVariant(change.type)}>
                          {getChangeTypeLabel(change.type)}
                        </Badge>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          变更 #{index + 1}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteChange(index)}
                        className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <Select
                        label="变更类型"
                        value={change.type}
                        onChange={(value) => updateChangeDetail(index, 'type', value as ChangeType)}
                        options={changeTypeOptions}
                        required
                      />

                      <div className="col-span-2">
                        <Input
                          label="变更标题"
                          placeholder="请输入变更标题"
                          value={change.title}
                          onChange={(e) => updateChangeDetail(index, 'title', e.target.value)}
                          error={errors[`change_${index}_title`]}
                          required
                        />
                      </div>
                    </div>

                    <Textarea
                      label="变更描述"
                      placeholder="请详细描述此项变更"
                      value={change.description}
                      onChange={(e) => updateChangeDetail(index, 'description', e.target.value)}
                      error={errors[`change_${index}_description`]}
                      rows={2}
                      required
                    />
                  </div>
                ))}

                {changeDetails.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>还没有添加任何变更详情</p>
                    <p className="text-sm">点击"添加变更"按钮开始添加</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? '保存中...' : (isEditMode ? '保存修改' : '创建更新日志')}</span>
            </Button>
          </div>
        </div>
      </PortalModal>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="删除变更详情"
        message="确定要删除这个变更详情吗？此操作不可撤销。"
        confirmText="删除"
        cancelText="取消"
        onConfirm={confirmDeleteChange}
        onCancel={() => setShowDeleteConfirm(false)}
        variant="danger"
      />
    </>
  );
};