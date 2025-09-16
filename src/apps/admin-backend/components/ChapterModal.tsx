import React, { useState, useEffect } from 'react';
import { X, BookOpen, Clock, Hash } from 'lucide-react';
import { Button } from '@shared/components/ui/Button';
import { Input } from '@shared/components/ui/Input';
import { MarkdownEditor } from '@shared/components/ui/MarkdownEditor';
import { LoadingSpinner } from '@shared/components/ui/LoadingSpinner';
import { PortalModal } from '@shared/components/ui/PortalModal';
import { ChaptersService } from '@shared/services/api';
import { ChapterDTO, CourseDTO } from '@shared/types';
import { Z_INDEX } from '@shared/constants/z-index';
import toast from 'react-hot-toast';

interface ChapterModalProps {
  isOpen: boolean;
  course: CourseDTO;
  editingChapter?: ChapterDTO | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ChapterModal: React.FC<ChapterModalProps> = ({
  isOpen,
  course,
  editingChapter,
  onClose,
  onSuccess
}) => {
  // 表单状态
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    sortOrder: 1,
    readingTime: 0
  });

  // 其他状态
  const [isLoading, setIsLoading] = useState(false);
  const [estimatedReadingTime, setEstimatedReadingTime] = useState(0);

  // 初始化表单数据
  useEffect(() => {
    if (editingChapter) {
      setFormData({
        title: editingChapter.title,
        content: editingChapter.content,
        sortOrder: editingChapter.sortOrder,
        readingTime: editingChapter.readingTime || 0
      });
    } else {
      setFormData({
        title: '',
        content: '',
        sortOrder: 1,
        readingTime: 0
      });
    }
  }, [editingChapter, isOpen]);

  // 当内容变化时，自动计算预估阅读时间
  useEffect(() => {
    if (formData.content) {
      const estimated = ChaptersService.estimateReadingTime(formData.content);
      setEstimatedReadingTime(estimated);
      // 如果没有手动设置阅读时间，使用预估时间
      if (formData.readingTime === 0) {
        setFormData(prev => ({
          ...prev,
          readingTime: estimated
        }));
      }
    } else {
      setEstimatedReadingTime(0);
    }
  }, [formData.content, formData.readingTime]);

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 表单验证
    const validation = ChaptersService.validateChapterData({
      ...formData,
      courseId: course.id
    });

    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    setIsLoading(true);
    
    try {
      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        courseId: course.id,
        sortOrder: formData.sortOrder,
        readingTime: formData.readingTime > 0 ? formData.readingTime : undefined
      };

      if (editingChapter) {
        // 更新章节
        await ChaptersService.updateChapter(editingChapter.id, payload);
        toast.success('章节更新成功');
      } else {
        // 创建章节
        await ChaptersService.createChapter(payload);
        toast.success('章节创建成功');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('操作失败:', error);
      toast.error(editingChapter ? '更新章节失败' : '创建章节失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理输入变化
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <PortalModal
      isOpen={isOpen}
      onClose={onClose}
      zIndex={Z_INDEX.NESTED_MODAL}
      ariaLabel={editingChapter ? '编辑章节' : '创建章节'}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {editingChapter ? '编辑章节' : '创建章节'}
              </h2>
              <p className="text-sm text-gray-600">
                课程：{course.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* 表单内容 - 可滚动区域 */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* 基础信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 章节标题 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  章节标题 <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="请输入章节标题（2-200字符）"
                  maxLength={200}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  字符数：{formData.title.length}/200
                </p>
              </div>

              {/* 排序值 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  排序值 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 0)}
                    placeholder="1"
                    min={0}
                    max={9999}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  数值越大排序越靠前
                </p>
              </div>

              {/* 阅读时间 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  阅读时间（分钟）
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="number"
                    value={formData.readingTime}
                    onChange={(e) => handleInputChange('readingTime', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    min={0}
                    max={10000}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  预估：{estimatedReadingTime}分钟（可选，留空使用自动计算）
                </p>
              </div>
            </div>

            {/* 章节内容 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                章节内容 <span className="text-red-500">*</span>
              </label>
              <MarkdownEditor
                value={formData.content}
                onChange={(value) => handleInputChange('content', value)}
                placeholder="请输入章节的详细内容，支持Markdown格式..."
                height={400}
                enableFullscreen
                className="border border-gray-300 rounded-lg"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>最少需要10个字符</span>
                <div className="flex items-center space-x-4">
                  <span>字符数：{formData.content.length}</span>
                  {formData.content && (
                    <span className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>预估阅读：{estimatedReadingTime}分钟</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 底部操作 - 固定在底部 */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            取消
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            {isLoading && <LoadingSpinner size="sm" />}
            <span>{editingChapter ? '更新章节' : '创建章节'}</span>
          </Button>
        </div>
      </div>
    </PortalModal>
  );
};