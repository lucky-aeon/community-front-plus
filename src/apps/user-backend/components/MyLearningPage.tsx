import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingPage as LoadingSpinner } from '@shared/components/common/LoadingPage';
import { UserLearningService } from '@shared/services/api/user-learning.service';
import type { LearningRecordItemDTO, PageResponse } from '@shared/types';
import { BookOpen, Clock, ChevronRight, Trophy } from 'lucide-react';

export const MyLearningPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [records, setRecords] = useState<LearningRecordItemDTO[]>([]);
  const [pageInfo, setPageInfo] = useState<PageResponse<LearningRecordItemDTO> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchRecords = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const data = await UserLearningService.listMyLearningRecords(page, 10);
      setRecords(data.records);
      setPageInfo(data);
    } catch (e) {
      console.error('获取学习记录失败:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchRecords(currentPage);
  }, [currentPage]);

  const formatDateTime = (iso?: string) =>
    iso ? new Date(iso).toLocaleString('zh-CN') : '-';

  const goContinue = async (rec: LearningRecordItemDTO) => {
    try {
      if (rec.lastAccessChapterId) {
        navigate(`/dashboard/courses/${rec.courseId}/chapters/${rec.lastAccessChapterId}`);
      } else {
        navigate(`/dashboard/courses/${rec.courseId}`);
      }
    } catch (e) {
      console.error('跳转失败:', e);
    }
  };

  const ProgressBar: React.FC<{ percent: number }> = ({ percent }) => (
    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
      <div
        className="h-full bg-yellow-500 transition-all"
        style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">我的学习</h1>
          <p className="text-gray-600 mt-1">查看你学习过的课程进度与最近学习位置</p>
        </div>
        <div className="text-sm text-gray-500">
          {pageInfo && <span>共 {pageInfo.total} 门课程</span>}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : records.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">暂无学习记录</p>
          <p className="text-gray-400 text-sm mt-2">开始学习一门课程，系统会自动记录你的进度</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {records.map((rec) => (
            <Card key={`${rec.courseId}`} className="p-6 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate" title={rec.courseTitle}>
                      {rec.courseTitle}
                    </h3>
                    {rec.completed && (
                      <Badge variant="secondary" className="inline-flex items-center gap-1 text-green-700 bg-green-50 border-green-200">
                        <Trophy className="h-3 w-3" /> 已完成
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
                    <span>共 {rec.totalChapters} 章</span>
                    <span>·</span>
                    <span>已完成 {rec.completedChapters} 章</span>
                    <span>·</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>最近学习：{formatDateTime(rec.lastAccessTime)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button variant="outline" onClick={() => navigate(`/dashboard/courses/${rec.courseId}`)}>
                    课程详情
                  </Button>
                  <Button variant="primary" onClick={() => goContinue(rec)} className="inline-flex items-center gap-1">
                    继续学习 <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-3">
                <ProgressBar percent={rec.progressPercent || 0} />
                <span className="text-sm text-gray-700 w-12 text-right">{rec.progressPercent ?? 0}%</span>
              </div>

              {/* Last access chapter */}
              {rec.lastAccessChapterId && (
                <div className="text-sm text-gray-600">
                  最近章节：
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => navigate(`/dashboard/courses/${rec.courseId}/chapters/${rec.lastAccessChapterId}`)}
                  >
                    {rec.lastAccessChapterTitle || `#${rec.lastAccessChapterId}`}
                  </button>
                  {typeof rec.lastPositionSec === 'number' && (
                    <span className="ml-2 text-gray-500">位置 {Math.max(0, rec.lastPositionSec)}s</span>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pageInfo && pageInfo.pages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <Button
              variant="neutral"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              上一页
            </Button>
            {Array.from({ length: Math.min(5, pageInfo.pages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'primary' : 'neutral'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              );
            })}
            <Button
              variant="neutral"
              size="sm"
              disabled={currentPage >= pageInfo.pages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLearningPage;

