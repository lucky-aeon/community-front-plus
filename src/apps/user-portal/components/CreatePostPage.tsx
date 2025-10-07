import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Save, FileText, HelpCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@shared/components/common/ImageUpload';
import { TagsInput } from '@/components/ui/tags-input';
import { MarkdownEditor, MarkdownEditorHandle } from '@shared/components/ui/MarkdownEditor';
import { ResourcePicker } from '@shared/components/business/ResourcePicker';
import { CategorySelect } from '@shared/components/common/CategorySelect';
import { PostsService } from '@shared/services/api/posts.service';
import { PostDTO, UpdatePostRequest } from '@shared/types';
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
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  // Tags 输入由 TagsInput 管理
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showResourcePicker, setShowResourcePicker] = useState(false);
  const editorRef = useRef<MarkdownEditorHandle>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const contentSectionRef = useRef<HTMLDivElement>(null);
  const categoryCardRef = useRef<HTMLDivElement>(null);
  const summaryCardRef = useRef<HTMLDivElement>(null);
  
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

  // 编辑态：根据已选分类推断内容类型（文章/问答），确保分类筛选正确
  useEffect(() => {
    const detectTypeFromCategory = async () => {
      if (!isEditMode || !initialData?.categoryId) return;
      try {
        const allCats = await PostsService.getCategories(undefined);
        const findById = (cats: any[]): any | undefined => {
          for (const c of cats) {
            if (c.id === initialData.categoryId) return c;
            if (c.children) {
              const r = findById(c.children);
              if (r) return r;
            }
          }
        };
        const current = findById(allCats);
        if (current?.type === 'QA') setPostType('question');
        else setPostType('article');
      } catch {
        // 忽略分类识别失败
      }
    };
    detectTypeFromCategory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, initialData?.categoryId]);

  // 由 TagsInput 控件负责新增

  // 由 TagsInput 控件管理增删，这里不再需要单独的删除函数

  // 表单验证（返回更详细信息用于提示与定位）
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

    const order: Array<keyof typeof newErrors> = ['title', 'content', 'categoryId', 'summary'];
    const messages: string[] = order
      .map((k) => newErrors[k])
      .filter((m): m is string => Boolean(m));
    const firstKey = order.find((k) => newErrors[k]);

    return {
      ok: Object.keys(newErrors).length === 0,
      messages,
      firstKey,
      newErrors,
    } as const;
  };

  const handleSubmit = async () => {
    const result = validateForm();
    if (!result.ok) {
      const msg = result.messages.length > 0
        ? `请完善表单：${result.messages.join('；')}`
        : '请完善表单信息';
      showToast.error(msg);

      // 将视图滚动/聚焦到第一个错误位置
      switch (result.firstKey) {
        case 'title':
          titleInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          titleInputRef.current?.focus();
          break;
        case 'content':
          contentSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          editorRef.current?.focus();
          break;
        case 'categoryId':
          categoryCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          break;
        case 'summary':
          summaryCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          break;
        default:
          break;
      }
      return;
    }

    try {
      setIsSubmitting(true);
      
      let postParams: UpdatePostRequest = {
        title: title.trim(),
        content: content.trim(),
        categoryId,
        ...(summary.trim() && { summary: summary.trim() }),
        ...(coverResourceId
          ? { coverImage: coverResourceId }
          : (coverImage.trim() ? { coverImage: coverImage.trim() } : {})),
        // 始终携带 tags 字段
        tags: tags.map(t => t.trim()).filter(Boolean),
      };

      // 编辑态：若原本存在封面且被删除，显式传空字符串以指示后端清空
      if (isEditMode && initialData && initialData.coverImage && !coverResourceId && !coverImage.trim()) {
        postParams.coverImage = '';
      }

      let result: PostDTO;
      
      if (isEditMode && initialData) {
        // 编辑模式
        result = await PostsService.updatePost(initialData.id, postParams);
      } else {
        // 创建模式：直接创建草稿，后端创建接口默认为草稿状态
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

  // 输入交互交给 TagsInput 组件

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
                <Label className="text-sm font-medium text-gray-700">
                  {postType === 'article' ? '文章标题' : '问题标题'}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  ref={titleInputRef}
                  placeholder={postType === 'article' ? '请输入文章标题...' : '请输入您的问题...'}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg mt-1"
                  required
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">{errors.title}</p>
                )}
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
                <div ref={contentSectionRef}>
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
            </div>
          </Card>
        </div>

        {/* 右侧边栏 */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            {/* 文章分类 */}
            <Card className="p-4" ref={categoryCardRef}>
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
                  标签
                </label>
                <TagsInput
                  value={tags}
                  onChange={setTags}
                  placeholder="输入标签，回车或逗号添加"
                />
              </div>
            </Card>

            {/* 文章概要 */}
            <Card className="p-4" ref={summaryCardRef}>
              <Label className="text-sm font-medium text-gray-700">文章概要</Label>
              <Textarea
                placeholder="请输入文章概要（可选，用于文章列表展示）..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="mt-1"
                maxLength={500}
              />
              {errors.summary && (
                <p className="text-sm text-red-600 mt-1">{errors.summary}</p>
              )}
            </Card>

            {/* 封面图片 */}
            <Card className="p-4">
              <ImageUpload
                label="封面图片"
                value={coverImage}
                onChange={(url) => {
                  setCoverImage(url);
                  // 用户删除封面时，清空资源ID，避免提交旧的资源ID
                  if (!url) {
                    setCoverResourceId('');
                    return;
                  }
                  // 外链/相对路径由 onUploadSuccess 决定资源ID是否覆盖
                  if (url.startsWith('http') || url.startsWith('/')) {
                    // 保持当前资源ID不变
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
                      ? (isEditMode ? '保存中...' : '保存中...')
                      : (isEditMode ? '保存更新' : '发布文章')
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
