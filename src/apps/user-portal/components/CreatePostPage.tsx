import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Save, Hash, FileText, HelpCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@shared/components/common/ImageUpload';
import { MarkdownEditor, MarkdownEditorHandle } from '@shared/components/ui/MarkdownEditor';
import { ResourcePicker } from '@shared/components/business/ResourcePicker';
import { CategorySelect } from '@shared/components/common/CategorySelect';
import { PostsService } from '@shared/services/api/posts.service';
import { PostDTO } from '@shared/types';
import { showToast } from '@shared/utils/toast';
import { ResourceAccessService } from '@shared/services/api/resource-access.service';

interface CreatePostPageProps {
  onPostCreated: () => void;
  initialData?: PostDTO; // 编辑模式的初始数据
}

export const CreatePostPage: React.FC<CreatePostPageProps> = ({ onPostCreated, initialData }) => {
  const [postType, setPostType] = useState<'article' | 'question'>('article');
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [summary, setSummary] = useState(initialData?.summary || '');
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
  const [coverResourceId, setCoverResourceId] = useState<string>('');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showResourcePicker, setShowResourcePicker] = useState(false);
  const editorRef = useRef<MarkdownEditorHandle>(null);
  
  const isEditMode = !!initialData;

  // 初始化：如果初始 coverImage 是资源ID，则转换为访问URL并记录ID
  useEffect(() => {
    const val = initialData?.coverImage;
    if (val && !(val.startsWith('http') || val.startsWith('/'))) {
      try {
        const url = ResourceAccessService.getResourceAccessUrl(val);
        setCoverImage(url);
        setCoverResourceId(val);
      } catch {
        // 忽略资源ID解析错误
      }
    }
  }, [initialData?.coverImage]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // 表单验证
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // 标题验证
    if (!title.trim()) {
      newErrors.title = '请输入标题';
    } else if (title.trim().length < 5) {
      newErrors.title = '标题至少需要5个字符';
    } else if (title.trim().length > 200) {
      newErrors.title = '标题最多200个字符';
    }

    // 内容验证
    if (!content.trim()) {
      newErrors.content = '请输入内容';
    } else if (content.trim().length < 10) {
      newErrors.content = '内容至少需要10个字符';
    }

    // 分类验证
    if (!categoryId) {
      newErrors.categoryId = '请选择文章分类';
    }

    // 概要验证（可选但有长度限制）
    if (summary.trim().length > 500) {
      newErrors.summary = '概要最多500个字符';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showToast.error('请检查表单信息');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const postParams = {
        title: title.trim(),
        content: content.trim(),
        categoryId,
        ...(summary.trim() && { summary: summary.trim() }),
        ...(coverResourceId
          ? { coverImage: coverResourceId }
          : (coverImage.trim() ? { coverImage: coverImage.trim() } : {})),
      };

      let result: PostDTO;
      
      if (isEditMode && initialData) {
        // 编辑模式
        result = await PostsService.updatePost(initialData.id, postParams);
      } else {
        // 创建模式
        result = await PostsService.createPost(postParams);
      }
      
      console.log('文章操作成功:', result);
      
      // 返回到列表页面
      onPostCreated();
      
    } catch (error) {
      console.error('文章操作失败:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <>
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={onPostCreated}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>返回</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? '编辑内容' : '发布内容'}
            </h1>
            <p className="text-gray-600">
              {isEditMode ? '修改您的文章内容' : '分享您的知识和经验'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧主编辑区 */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="space-y-6">
              {/* Post Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  内容类型
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setPostType('article')}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-xl border-2 transition-all duration-200
                      ${postType === 'article'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <FileText className="h-4 w-4" />
                    <span>文章</span>
                  </button>
                  <button
                    onClick={() => setPostType('question')}
                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-xl border-2 transition-all duration-200
                      ${postType === 'question'
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span>问答</span>
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <Input
                  label={postType === 'article' ? '文章标题' : '问题标题'}
                  placeholder={postType === 'article' ? '请输入文章标题...' : '请输入您的问题...'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg"
                  error={errors.title}
                  required
                />
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {postType === 'article' ? '文章内容' : '问题描述'}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  {errors.content && (
                    <span className="text-sm text-red-600">{errors.content}</span>
                  )}
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-gray-500">支持图片/视频上传与资源库复用</div>
                  <div className="space-x-2">
                    <Button variant="secondary" size="sm" onClick={() => setShowResourcePicker(true)}>从资源库插入</Button>
                  </div>
                </div>
                <MarkdownEditor
                  ref={editorRef}
                  value={content}
                  onChange={setContent}
                  height={500}
                  placeholder={postType === 'article' ? '请输入文章内容...' : '请详细描述您的问题...'}
                  className="w-full"
                  enableFullscreen={true}
                  onOpenResourcePicker={() => setShowResourcePicker(true)}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* 右侧边栏 */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            {/* 文章分类 */}
            <Card className="p-4">
              <CategorySelect
                label="文章分类"
                value={categoryId}
                onChange={(newCategoryId) => {
                  setCategoryId(newCategoryId);
                  // 清除分类相关的错误
                  if (errors.categoryId) {
                    setErrors(prev => ({ ...prev, categoryId: '' }));
                  }
                }}
                error={errors.categoryId}
                required
                categoryType={postType === 'article' ? 'ARTICLE' : 'QA'}
                className="w-full"
              />
            </Card>

            {/* 标签管理 */}
            <Card className="p-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  标签 (最多5个)
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleRemoveTag(tag)}
                      className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 text-gray-800 rounded-md text-xs hover:bg-red-100 hover:text-red-800 transition-colors cursor-pointer"
                    >
                      <Hash className="h-3 w-3" />
                      <span>{tag}</span>
                      <span className="ml-1">×</span>
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  <Input
                    placeholder="添加标签..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={tags.length >= 5}
                    className="text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim() || tags.length >= 5}
                    className="w-full text-sm"
                  >
                    添加标签
                  </Button>
                </div>
              </div>
            </Card>

            {/* 文章概要 */}
            <Card className="p-4">
              <Textarea
                label="文章概要"
                placeholder="请输入文章概要（可选，用于文章列表展示）..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                error={errors.summary}
                maxLength={500}
                showCharCount={true}
                autoResize={true}
                minRows={2}
                maxRows={4}
              />
            </Card>

            {/* 封面图片 */}
            <Card className="p-4">
              <ImageUpload
                label="封面图片"
                value={coverImage}
                onChange={(url) => {
                  setCoverImage(url);
                  // 如果用户清空或替换为外链，清理资源ID
                  if (!url || url.startsWith('http') || url.startsWith('/')) {
                    // 保留 setCoverResourceId 由 onUploadSuccess 决定；这里不清空非空 ID
                  }
                }}
                error={errors.coverImage}
                placeholder="上传文章封面图片（可选）"
                showPreview={true}
                previewSize="md"
                onError={(error) => setErrors(prev => ({ ...prev, coverImage: error }))}
                onUploadSuccess={(rid) => setCoverResourceId(rid)}
              />
            </Card>

            {/* 发布操作 */}
            <Card className="p-4">
              <div className="space-y-3">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !title.trim() || !content.trim() || !categoryId}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>
                    {isSubmitting 
                      ? (isEditMode ? '更新中...' : '发布中...') 
                      : (isEditMode ? '保存更新' : '发布')
                    }
                  </span>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
    <ResourcePicker
      open={showResourcePicker}
      onClose={() => setShowResourcePicker(false)}
      onInsert={(snippet) => {
        editorRef.current?.insertMarkdown(snippet);
        setShowResourcePicker(false);
      }}
    />
    </>
  );
};
