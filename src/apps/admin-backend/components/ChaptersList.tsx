import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Clock,
  FileText,
  BookOpen,
  X,
  GripVertical
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { Button } from '@shared/components/ui/Button';
import { LoadingSpinner } from '@shared/components/ui/LoadingSpinner';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { PortalModal } from '@shared/components/ui/PortalModal';
import { ChaptersService } from '@shared/services/api';
import { ChapterDTO, CourseDTO } from '@shared/types';
import { Z_INDEX } from '@shared/constants/z-index';
import { ChapterModal } from './ChapterModal';
import { SortableChapterItem } from './SortableChapterItem';

interface ChaptersListProps {
  course: CourseDTO;
  isOpen: boolean;
  onClose: () => void;
}

export const ChaptersList: React.FC<ChaptersListProps> = ({
  course,
  isOpen,
  onClose
}) => {
  // 状态管理
  const [chapters, setChapters] = useState<ChapterDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<ChapterDTO | null>(null);
  const [deletingChapter, setDeletingChapter] = useState<ChapterDTO | null>(null);

  // 加载章节列表
  const loadChapters = useCallback(async () => {
    if (!isOpen) return;
    
    setIsLoading(true);
    try {
      const chaptersList = await ChaptersService.getAllCourseChapters(course.id);
      // 按排序值排序：数值越大越靠前
      const sortedChapters = chaptersList.sort((a, b) => b.sortOrder - a.sortOrder);
      setChapters(sortedChapters);
    } catch (error) {
      console.error('加载章节列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [course.id, isOpen]);

  // 初始化加载
  useEffect(() => {
    loadChapters();
  }, [loadChapters]);

  // 处理创建章节
  const handleCreate = () => {
    setEditingChapter(null);
    setIsModalOpen(true);
  };

  // 处理编辑章节
  const handleEdit = (chapter: ChapterDTO) => {
    setEditingChapter(chapter);
    setIsModalOpen(true);
  };

  // 处理删除章节
  const handleDelete = (chapter: ChapterDTO) => {
    setDeletingChapter(chapter);
  };

  // 确认删除
  const confirmDelete = async () => {
    if (!deletingChapter) return;

    try {
      await ChaptersService.deleteChapter(deletingChapter.id);
      setDeletingChapter(null);
      loadChapters(); // 重新加载列表
    } catch (error) {
      console.error('删除章节失败:', error);
    }
  };

  // 拖拽传感器配置
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 处理拖拽排序
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = chapters.findIndex(chapter => chapter.id === active.id);
    const newIndex = chapters.findIndex(chapter => chapter.id === over.id);

    // 更新本地状态
    const newChapters = arrayMove(chapters, oldIndex, newIndex);
    setChapters(newChapters);

    try {
      // 生成新的章节ID顺序
      const chapterIds = newChapters.map(chapter => chapter.id);
      
      // 调用批量排序API
      await ChaptersService.updateChaptersOrder(chapterIds);
    } catch (error) {
      console.error('调整章节顺序失败:', error);
      // 发生错误时，重新加载章节列表恢复原状态
      loadChapters();
    }
  };

  // 计算总阅读时间
  const totalReadingTime = chapters.reduce((total, chapter) => {
    return total + (chapter.readingTime || 0);
  }, 0);

  return (
    <PortalModal
      isOpen={isOpen}
      onClose={onClose}
      zIndex={Z_INDEX.IMPORTANT_MODAL}
      ariaLabel="章节管理"
      containerClassName="px-4 py-8"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-[95vw] max-w-[1400px] min-h-[85vh] max-h-[90vh] flex flex-col mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                章节管理
              </h2>
              <p className="text-sm text-gray-600">
                课程：{course.title}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={handleCreate} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>创建章节</span>
            </Button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <span className="text-gray-600">
                共 <span className="font-semibold text-blue-600">{chapters.length}</span> 个章节
              </span>
              <span className="text-gray-600 flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>总时长：{ChaptersService.formatReadingTime(totalReadingTime)}</span>
              </span>
            </div>
          </div>
        </div>

        {/* 章节列表 - 可滚动区域 */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : chapters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <FileText className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-lg">暂无章节</p>
              <p className="text-sm">点击"创建章节"开始添加课程内容</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div className="p-6">
                <div className="mb-4 text-sm text-gray-500 flex items-center space-x-2">
                  <GripVertical className="h-4 w-4" />
                  <span>拖拽章节卡片可调整顺序</span>
                </div>
                <SortableContext
                  items={chapters.map(chapter => chapter.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {chapters.map((chapter, index) => (
                      <SortableChapterItem
                        key={chapter.id}
                        chapter={chapter}
                        index={index}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </SortableContext>
              </div>
            </DndContext>
          )}
        </div>

        {/* 删除确认对话框 */}
        <ConfirmDialog
          isOpen={!!deletingChapter}
          title="确认删除章节"
          message={`确定要删除章节"${deletingChapter?.title}"吗？此操作不可恢复。`}
          confirmText="确定删除"
          cancelText="取消"
          variant="danger"
          onConfirm={confirmDelete}
          onCancel={() => setDeletingChapter(null)}
        />

        {/* 章节创建/编辑模态框 */}
        <ChapterModal
          isOpen={isModalOpen}
          course={course}
          editingChapter={editingChapter}
          onClose={() => {
            setIsModalOpen(false);
            setEditingChapter(null);
          }}
          onSuccess={() => {
            loadChapters(); // 重新加载章节列表
          }}
        />
      </div>
    </PortalModal>
  );
};