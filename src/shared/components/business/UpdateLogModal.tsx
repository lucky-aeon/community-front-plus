import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, AlertCircle, Sparkles, Plus, Bug, Shield, AlertTriangle, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UpdateLogDTO, ChangeType } from '@shared/types';
import { cn } from '@/lib/utils';

interface UpdateLogModalProps {
  updateLog: UpdateLogDTO | null;
  isOpen: boolean;
  onClose: () => void;
}

// 变更类型配置
const changeTypeConfig = {
  FEATURE: {
    label: '新功能',
    icon: Plus,
    color: 'bg-green-100 text-green-800 border-green-200',
    iconColor: 'text-green-600'
  },
  IMPROVEMENT: {
    label: '优化改进',
    icon: Sparkles,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    iconColor: 'text-blue-600'
  },
  BUGFIX: {
    label: '问题修复',
    icon: Bug,
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    iconColor: 'text-orange-600'
  },
  BREAKING: {
    label: '破坏性变更',
    icon: AlertTriangle,
    color: 'bg-red-100 text-red-800 border-red-200',
    iconColor: 'text-red-600'
  },
  SECURITY: {
    label: '安全更新',
    icon: Shield,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    iconColor: 'text-purple-600'
  },
  OTHER: {
    label: '其他',
    icon: FileText,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    iconColor: 'text-gray-600'
  }
};

export const UpdateLogModal: React.FC<UpdateLogModalProps> = ({
  updateLog,
  isOpen,
  onClose
}) => {
  // ESC 键关闭模态框
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !updateLog) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 按类型分组变更详情
  const changeDetails = updateLog.changes || updateLog.changeDetails || [];
  const groupedChanges = changeDetails.reduce((acc, change) => {
    if (!acc[change.type]) {
      acc[change.type] = [];
    }
    acc[change.type].push(change);
    return acc;
  }, {} as Record<ChangeType, typeof changeDetails>);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩层 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 模态框内容 */}
      <div className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* 固定头部 */}
        <div className="sticky top-0 z-10 bg-white border-b border-honey-border p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                {/* 版本号 */}
                <Badge
                  variant="outline"
                  className="text-sm px-3 py-1 bg-honey-50 text-honey-700 border-honey-200 font-mono"
                >
                  v{updateLog.version}
                </Badge>

                {/* 重要更新标识 */}
                {updateLog.isImportant && (
                  <Badge className="text-sm px-3 py-1 bg-red-100 text-red-700 border-red-200">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    重要更新
                  </Badge>
                )}

                {/* 发布时间 */}
                <div className="flex items-center space-x-1 text-sm text-warm-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {updateLog.publishTime
                      ? formatDate(updateLog.publishTime)
                      : formatDate(updateLog.createTime)
                    }
                  </span>
                </div>
              </div>

              {/* 标题 */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                {updateLog.title}
              </h2>

              {/* 描述 */}
              <p className="text-warm-gray-600 leading-relaxed">
                {updateLog.description}
              </p>
            </div>

            {/* 关闭按钮 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full text-warm-gray-400 hover:text-warm-gray-600 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* 滚动内容区域 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {Object.entries(groupedChanges).length > 0 ? (
            <div className="space-y-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">变更详情</h3>

              {Object.entries(groupedChanges).map(([type, changes]) => {
                const config = changeTypeConfig[type as ChangeType];
                const Icon = config.icon;

                return (
                  <div key={type} className="space-y-4">
                    {/* 类型标题 */}
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center",
                        config.color.replace('text-', 'bg-').replace('border-', '').split(' ')[0]
                      )}>
                        <Icon className={cn("h-4 w-4", config.iconColor)} />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">
                        {config.label}
                      </h4>
                      <Badge variant="secondary" size="sm">
                        {changes.length} 项
                      </Badge>
                    </div>

                    {/* 变更列表 */}
                    <div className="space-y-3 ml-11">
                      {changes.map((change, index) => (
                        <div
                          key={change.id || index}
                          className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-colors"
                        >
                          <h5 className="font-semibold text-gray-900 mb-2 leading-snug">
                            {change.title}
                          </h5>
                          <p className="text-sm text-warm-gray-600 leading-relaxed">
                            {change.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无详细变更</h3>
              <p className="text-warm-gray-600">
                该版本更新暂未提供详细的变更信息
              </p>
            </div>
          )}
        </div>

        {/* 底部操作区域 */}
        <div className="sticky bottom-0 bg-white border-t border-honey-border p-6">
          <div className="flex items-center justify-end">
            <Button
              onClick={onClose}
              className={cn(
                "px-6 py-2",
                "bg-gradient-to-r from-honey-500 to-honey-600 hover:from-honey-600 hover:to-honey-700",
                "text-white shadow-md hover:shadow-lg transition-all duration-200"
              )}
            >
              关闭
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};