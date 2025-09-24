import React, { useState } from 'react';
import { Calendar, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VersionBadge } from './VersionBadge';
import { ChangeTypeIcon, getChangeTypeLabel } from './ChangeTypeIcon';
import { ChangelogEntry, type ChangeType } from '@shared/types';
import { cn } from '@shared/utils/cn';

interface ChangelogCardProps {
  changelog: ChangelogEntry;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  className?: string;
}

export const ChangelogCard: React.FC<ChangelogCardProps> = ({
  changelog,
  isExpanded = false,
  onToggleExpand,
  className
}) => {
  const [localExpanded, setLocalExpanded] = useState(isExpanded);

  const handleToggleExpand = () => {
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setLocalExpanded(!localExpanded);
    }
  };

  const expanded = onToggleExpand ? isExpanded : localExpanded;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // 按类型分组变更
  const changesByType = changelog.changes.reduce((acc, change) => {
    if (!acc[change.type]) {
      acc[change.type] = [];
    }
    acc[change.type].push(change);
    return acc;
  }, {} as Record<string, typeof changelog.changes>);

  return (
    <Card className={cn('overflow-hidden hover:shadow-lg transition-shadow', className)}>
      {/* 头部区域 */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <VersionBadge version={changelog.version} isImportant={changelog.isImportant} />
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(changelog.releaseDate)}</span>
            </div>
          </div>
          {changelog.isImportant && (
            <Badge variant="warning" className="bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 border-orange-200">
              重要更新
            </Badge>
          )}
        </div>

        {/* 标题和描述 */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {changelog.title}
        </h3>
        <p className="text-gray-600 mb-4 leading-relaxed">
          {changelog.description}
        </p>

      </div>

      {/* 更新内容预览/详情 */}
      <div className={cn('px-6', expanded ? 'pb-4' : 'pb-6')}>
        {!expanded ? (
          // 简化预览
          <div className="space-y-2">
            {Object.entries(changesByType).slice(0, 2).map(([type, changes]) => (
              <div key={type} className="flex items-center space-x-2">
                <ChangeTypeIcon type={type as ChangeType} size="sm" />
                <span className="text-sm font-medium text-gray-700">
                  {getChangeTypeLabel(type as ChangeType)}
                </span>
                <Badge variant="secondary" size="sm">
                  {changes.length}项
                </Badge>
              </div>
            ))}
            {Object.keys(changesByType).length > 2 && (
              <div className="text-sm text-gray-500">
                还有 {Object.keys(changesByType).length - 2} 个类别...
              </div>
            )}
          </div>
        ) : (
          // 详细内容
          <div className="space-y-6">
            {Object.entries(changesByType).map(([type, changes]) => (
              <div key={type} className="space-y-3">
                <div className="flex items-center space-x-3">
                  <ChangeTypeIcon type={type as ChangeType} />
                  <h4 className="text-lg font-semibold text-gray-800">
                    {getChangeTypeLabel(type as ChangeType)}
                  </h4>
                </div>
                <div className="space-y-2 ml-8">
                  {changes.map((change) => (
                    <div key={change.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 mb-1">
                            {change.title}
                          </h5>
                          <p className="text-sm text-gray-600">
                            {change.description}
                          </p>
                        </div>
                        {change.category && (
                          <Badge variant="secondary" size="sm" className="ml-2">
                            {change.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部统计和操作 */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <MessageSquare className="h-4 w-4" />
              <span>{changelog.feedbackCount} 反馈</span>
            </div>
          </div>
          
          <button
            onClick={handleToggleExpand}
            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span>{expanded ? '收起' : '展开详情'}</span>
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </Card>
  );
};
