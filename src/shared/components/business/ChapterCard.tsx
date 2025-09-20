import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, BookOpen, Calendar } from 'lucide-react';
import { Card } from '@shared/components/ui/Card';
import { Badge } from '@shared/components/ui/Badge';
import { ChaptersService } from '@shared/services/api/chapters.service';

// 章节数据接口（基于现有类型）
interface ChapterCardData {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  readingTime: number;
  updateTime: string;
  isNew?: boolean; // 是否为新章节（最近7天内）
}

interface ChapterCardProps {
  chapter: ChapterCardData;
  onClick?: (chapterId: string) => void;
}

// 单个章节卡片组件
export const ChapterCard: React.FC<ChapterCardProps> = ({ chapter, onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(chapter.id);
    } else {
      // 默认跳转到章节详情页
      navigate(`/courses/${chapter.courseId}/chapters/${chapter.id}`);
    }
  };

  // 计算时间差
  const getTimeAgo = (updateTime: string) => {
    const now = new Date();
    const updateDate = new Date(updateTime);
    const diffInHours = Math.floor((now.getTime() - updateDate.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return '刚刚更新';
    if (diffInHours < 24) return `${diffInHours}小时前更新`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}天前更新`;

    return updateDate.toLocaleDateString('zh-CN');
  };

  return (
    <Card hover className="p-4 cursor-pointer" onClick={handleClick}>
      <div className="flex items-start space-x-3">
        {/* 章节图标 */}
        <div className="w-10 h-10 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <BookOpen className="h-5 w-5 text-orange-600" />
        </div>

        {/* 章节信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h4 className="font-semibold text-gray-900 line-clamp-2 text-sm">
              {chapter.title}
            </h4>
            {chapter.isNew && (
              <Badge variant="error" size="sm" className="ml-2 flex-shrink-0">
                NEW
              </Badge>
            )}
          </div>

          {/* 课程名称 */}
          <p className="text-xs text-gray-600 mb-2 line-clamp-1">
            {chapter.courseName}
          </p>

          {/* 底部信息 */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{ChaptersService.formatReadingTime(chapter.readingTime)}</span>
              </span>
            </div>

            <span className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{getTimeAgo(chapter.updateTime)}</span>
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

// 章节列表组件
interface ChapterListProps {
  chapters: ChapterCardData[];
  title?: string;
  showViewAll?: boolean;
  onViewAll?: () => void;
  loading?: boolean;
}

export const ChapterList: React.FC<ChapterListProps> = ({
  chapters,
  title = '最新章节',
  showViewAll = true,
  onViewAll,
  loading = false
}) => {
  const navigate = useNavigate();

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      navigate('/courses'); // 默认跳转到课程页面
    }
  };

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        {showViewAll && (
          <button
            onClick={handleViewAll}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            查看全部
          </button>
        )}
      </div>

      <div className="space-y-4">
        {chapters.length > 0 ? (
          chapters.map((chapter) => (
            <ChapterCard key={chapter.id} chapter={chapter} />
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-sm mb-1">暂无最新章节</div>
            <p className="text-gray-500 text-xs">敬请期待更多精彩内容</p>
          </div>
        )}
      </div>
    </div>
  );
};