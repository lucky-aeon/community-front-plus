import React, { useState } from 'react';
import { FileText, Calendar, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { UpdateLogDTO } from '@shared/types';
import { UpdateLogModal } from './UpdateLogModal';
import { cn } from '@shared/utils/cn';

interface UpdateLogsProps {
  logs?: UpdateLogDTO[];
  isLoading?: boolean;
  className?: string;
}

export const UpdateLogs: React.FC<UpdateLogsProps> = ({
  logs = [],
  isLoading = false,
  className
}) => {
  const [selectedLog, setSelectedLog] = useState<UpdateLogDTO | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogClick = (log: UpdateLogDTO) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLog(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-bold text-gray-900">更新日志</h3>
          </div>
          <span className="text-xs text-warm-gray-400">点击查看详情</span>
        </div>

        {/* Logs List */}
        <div className="space-y-3">
          {logs.length > 0 ? (
            logs.map((log) => (
              <div
                key={log.id}
                className="group p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-orange-100"
                onClick={() => handleLogClick(log)}
              >
                <div className="space-y-2">
                  {/* Log Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {/* Version Badge */}
                      <Badge
                        variant="outline"
                        className="text-xs px-2 py-0.5 bg-orange-50 text-orange-700 border-orange-200 font-mono"
                      >
                        v{log.version}
                      </Badge>

                      {/* Important Badge */}
                      {log.isImportant && (
                        <Badge className="text-xs px-2 py-0.5 bg-red-100 text-red-700 border-red-200">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          重要
                        </Badge>
                      )}
                    </div>

                    {/* Publish Date */}
                    <div className="flex items-center space-x-1 text-xs text-warm-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {log.publishTime
                          ? formatDate(log.publishTime)
                          : formatDate(log.createTime)
                        }
                      </span>
                    </div>
                  </div>

                  {/* Log Title */}
                  <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors leading-snug">
                    {log.title}
                  </h4>

                  {/* Log Description */}
                  {log.description && (
                    <p className="text-xs text-warm-gray-600 line-clamp-2 leading-relaxed">
                      {log.description}
                    </p>
                  )}

                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">暂无更新日志</p>
              <p className="text-xs text-gray-400 mt-1">期待新功能发布</p>
            </div>
          )}
        </div>

        {/* View More Hint */}
        {logs.length > 0 && (
          <div className="text-center">
            <p className="text-xs text-warm-gray-400">
              点击任意更新查看详情
            </p>
          </div>
        )}
      </div>

      {/* 更新详情模态框 */}
      <UpdateLogModal
        updateLog={selectedLog}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </Card>
  );
};
