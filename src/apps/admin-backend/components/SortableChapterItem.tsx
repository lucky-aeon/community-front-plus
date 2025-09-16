import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Edit, Trash2, Clock, Hash, GripVertical } from 'lucide-react';
import { Button } from '@shared/components/ui/Button';
import { ChaptersService } from '@shared/services/api';
import { ChapterDTO } from '@shared/types';

interface SortableChapterItemProps {
  chapter: ChapterDTO;
  index: number;
  onEdit: (chapter: ChapterDTO) => void;
  onDelete: (chapter: ChapterDTO) => void;
}

export const SortableChapterItem: React.FC<SortableChapterItemProps> = ({
  chapter,
  index,
  onEdit,
  onDelete
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: chapter.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 rounded-lg p-4 transition-all duration-200 ${
        isDragging
          ? 'shadow-lg ring-2 ring-blue-300 z-50'
          : 'hover:shadow-sm'
      }`}
    >
      <div className="flex items-start space-x-4">
        {/* 拖拽手柄 */}
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center cursor-grab hover:bg-gray-200 transition-colors active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>

        {/* 章节序号 */}
        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <span className="text-sm font-semibold text-blue-600">
            {index + 1}
          </span>
        </div>

        {/* 章节内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-semibold text-gray-900 truncate">
                {chapter.title}
              </h4>
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <Hash className="h-3 w-3" />
                  <span>排序：{chapter.sortOrder}（数值越大越靠前）</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    {chapter.readingTime ? ChaptersService.formatReadingTime(chapter.readingTime) : '未设置'}
                  </span>
                </span>
                <span>
                  创建于 {new Date(chapter.createTime).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center space-x-1 ml-4">
              {/* 编辑按钮 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(chapter)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Edit className="h-4 w-4" />
              </Button>

              {/* 删除按钮 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(chapter)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};