import React, { useState, useEffect } from 'react';
import { X, BookOpen } from 'lucide-react';
import { Button } from '@shared/components/ui/Button';
import { Input } from '@shared/components/ui/Input';
import { Select, SelectOption } from '@shared/components/ui/Select';
import { TagInput } from '@shared/components/ui/TagInput';
import { MarkdownEditor } from '@shared/components/ui/MarkdownEditor';
import { LoadingSpinner } from '@shared/components/ui/LoadingSpinner';
import { CoursesService } from '@shared/services/api';
import { CourseDTO, CourseStatus } from '@shared/types';
import toast from 'react-hot-toast';

interface CourseModalProps {
  isOpen: boolean;
  editingCourse?: CourseDTO | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  editingCourse,
  onClose,
  onSuccess
}) => {
  // 表单状态
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    techStack: [] as string[],
    projectUrl: '',
    tags: [] as string[],
    status: 'PENDING' as CourseStatus
  });

  // 其他状态
  const [isLoading, setIsLoading] = useState(false);

  // 初始化表单数据
  useEffect(() => {
    if (editingCourse) {
      setFormData({
        title: editingCourse.title,
        description: editingCourse.description || '',
        techStack: editingCourse.techStack || [],
        projectUrl: editingCourse.projectUrl || '',
        tags: editingCourse.tags || [],
        status: editingCourse.status
      });
    } else {
      setFormData({
        title: '',
        description: '',
        techStack: [],
        projectUrl: '',
        tags: [],
        status: 'PENDING' as CourseStatus
      });
    }
  }, [editingCourse, isOpen]);

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 表单验证
    if (!formData.title.trim()) {
      toast.error('请输入课程标题');
      return;
    }

    if (formData.techStack.length > 20) {
      toast.error('技术栈最多支持20个标签');
      return;
    }

    if (formData.projectUrl && formData.projectUrl.length > 500) {
      toast.error('项目URL不能超过500字符');
      return;
    }

    if (formData.tags.length > 15) {
      toast.error('标签最多支持15个');
      return;
    }

    // 验证URL格式（如果提供了项目URL）
    if (formData.projectUrl && formData.projectUrl.trim()) {
      try {
        new URL(formData.projectUrl.trim());
      } catch {
        toast.error('请输入有效的项目URL');
        return;
      }
    }

    setIsLoading(true);
    
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        techStack: formData.techStack.length > 0 ? formData.techStack : undefined,
        projectUrl: formData.projectUrl.trim() || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        status: formData.status
      };

      if (editingCourse) {
        // 更新课程
        await CoursesService.updateCourse(editingCourse.id, payload);
        toast.success('课程更新成功');
      } else {
        // 创建课程
        await CoursesService.createCourse(payload);
        toast.success('课程创建成功');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('操作失败:', error);
      toast.error(editingCourse ? '更新课程失败' : '创建课程失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理输入变化
  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 状态选项
  const statusOptions: SelectOption[] = [
    { value: 'PENDING', label: '待更新' },
    { value: 'IN_PROGRESS', label: '更新中' },
    { value: 'COMPLETED', label: '已完成' }
  ];

  // 处理ESC键关闭
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {editingCourse ? '编辑课程' : '创建课程'}
              </h2>
              <p className="text-sm text-gray-600">
                {editingCourse ? '修改课程信息和内容' : '创建新的学习课程'}
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
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">基础信息</h3>
              
              {/* 课程标题 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  课程标题 <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="请输入课程标题"
                  required
                />
              </div>

              {/* 课程描述 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  课程描述
                </label>
                <MarkdownEditor
                  value={formData.description}
                  onChange={(value) => handleInputChange('description', value)}
                  placeholder="请输入课程的详细描述，支持Markdown格式..."
                  height={300}
                  enableFullscreen
                  className="border border-gray-300 rounded-lg"
                />
              </div>

              {/* 课程状态 */}
              <div>
                <Select
                  label="课程状态"
                  value={formData.status}
                  onChange={(value) => handleInputChange('status', value)}
                  options={statusOptions}
                  placeholder="请选择课程状态"
                  size="md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  选择课程的当前状态
                </p>
              </div>
            </div>

            {/* 技术信息 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">技术信息</h3>
              
              {/* 技术栈 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  技术栈
                </label>
                <TagInput
                  value={formData.techStack}
                  onChange={(tags) => handleInputChange('techStack', tags)}
                  placeholder="输入技术栈标签，如：React, TypeScript, Node.js..."
                  maxTags={20}
                  maxLength={50}
                  size="md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  标签数量：{formData.techStack.length}/20（可选，按回车或逗号添加标签）
                </p>
              </div>

              {/* 项目URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  项目URL
                </label>
                <Input
                  type="url"
                  value={formData.projectUrl}
                  onChange={(e) => handleInputChange('projectUrl', e.target.value)}
                  placeholder="https://github.com/username/project"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  字符数：{formData.projectUrl.length}/500（可选，请输入完整的URL）
                </p>
              </div>

              {/* 标签 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  标签
                </label>
                <TagInput
                  value={formData.tags}
                  onChange={(tags) => handleInputChange('tags', tags)}
                  placeholder="输入课程标签，如：前端, 后端, 全栈, 入门, 进阶..."
                  maxTags={15}
                  maxLength={30}
                  size="md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  标签数量：{formData.tags.length}/15（可选，用于课程分类和搜索）
                </p>
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
            <span>{editingCourse ? '更新课程' : '创建课程'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};