import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { UpdateLogDTO } from '@shared/types';
import { cn } from '@/lib/utils';

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
  const navigate = useNavigate();

  const handleLogClick = (logId: string) => {
    navigate(`/dashboard/changelog/${logId}`);
  };

  const handleViewMore = () => {
    navigate('/dashboard/changelog');
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
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewMore}
            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 p-1 h-auto"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Logs List */}
        <div className="space-y-3">
          {logs.length > 0 ? (
            logs.map((log) => (
              <div
                key={log.id}
                className="group p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-orange-100"
                onClick={() => handleLogClick(log.id)}
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

                  {/* Status indicator */}
                  <div className="flex items-center justify-end text-xs">
                    {log.status === 'PUBLISHED' ? (
                      <div className="flex items-center space-x-1 text-green-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>已发布</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-gray-500">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span>草稿</span>
                      </div>
                    )}
                  </div>
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

        {/* View More Button */}
        {logs.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewMore}
            className="w-full text-orange-600 hover:text-orange-700 hover:bg-orange-50 text-sm"
          >
            查看更多更新
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </Card>
  );
};