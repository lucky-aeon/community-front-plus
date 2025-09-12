import React, { useState } from 'react';
import { ArrowLeft, Save, Eye, Hash, FileText, HelpCircle } from 'lucide-react';
import { Card } from '@shared/components/ui/Card';
import { Button } from '@shared/components/ui/Button';
import { Input } from '@shared/components/ui/Input';
import { Badge } from '@shared/components/ui/Badge';

interface CreatePostPageProps {
  onPostCreated: () => void;
}

export const CreatePostPage: React.FC<CreatePostPageProps> = ({ onPostCreated }) => {
  const [postType, setPostType] = useState<'article' | 'question'>('article');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPreview, setIsPreview] = useState(false);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = () => {
    if (title.trim() && content.trim()) {
      // Here you would typically save the post to your backend
      console.log('Creating post:', { postType, title, content, tags });
      onPostCreated();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
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
            <h1 className="text-3xl font-bold text-gray-900">发布内容</h1>
            <p className="text-gray-600">分享您的知识和经验</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>{isPreview ? '编辑' : '预览'}</span>
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim()}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>发布</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <Card className="p-6">
            {!isPreview ? (
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
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {postType === 'article' ? '文章内容' : '问题描述'}
                  </label>
                  <textarea
                    placeholder={postType === 'article' ? '请输入文章内容...' : '请详细描述您的问题...'}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={12}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    标签 (最多5个)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center space-x-1 cursor-pointer hover:bg-red-100 hover:text-red-800"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <Hash className="h-3 w-3" />
                        <span>{tag}</span>
                        <span className="ml-1">×</span>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="添加标签..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={tags.length >= 5}
                    />
                    <Button
                      variant="outline"
                      onClick={handleAddTag}
                      disabled={!tagInput.trim() || tags.length >= 5}
                    >
                      添加
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Preview */}
                <div className="flex items-center space-x-2 mb-4">
                  <Badge variant={postType === 'article' ? 'primary' : 'warning'}>
                    {postType === 'article' ? '文章' : '问答'}
                  </Badge>
                  <span className="text-sm text-gray-500">预览模式</span>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900">{title || '标题预览'}</h1>
                
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700">
                    {content || '内容预览...'}
                  </div>
                </div>
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">发布指南</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 标题要简洁明了，突出重点</li>
              <li>• 内容要详细具体，便于理解</li>
              <li>• 添加相关标签，方便其他用户找到</li>
              <li>• 遵守社区规范，友善交流</li>
            </ul>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">常用标签</h3>
            <div className="flex flex-wrap gap-2">
              {['React', 'JavaScript', 'TypeScript', 'Node.js', 'CSS', 'Python', 'Vue', 'Angular'].map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer hover:bg-blue-100 hover:text-blue-800"
                  onClick={() => {
                    if (!tags.includes(tag) && tags.length < 5) {
                      setTags([...tags, tag]);
                    }
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};