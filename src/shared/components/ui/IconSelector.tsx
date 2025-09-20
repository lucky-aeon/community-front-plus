import React, { useState } from 'react';
import {
  Github,
  Video,
  FileText,
  Users,
  Code,
  BookOpen,
  Download,
  Link,
  MessageCircle,
  Play,
  Folder,
  Monitor,
  Search,
  X
} from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';

interface IconOption {
  name: string;
  component: React.ComponentType<{ className?: string }>;
  category: string;
  keywords: string[];
}

interface IconSelectorProps {
  value?: string;
  onChange: (iconName: string) => void;
  placeholder?: string;
  className?: string;
}

const iconOptions: IconOption[] = [
  { name: 'Github', component: Github, category: '代码', keywords: ['github', 'git', '代码', '源码', '仓库'] },
  { name: 'Code', component: Code, category: '代码', keywords: ['code', '代码', '编程', '开发'] },
  { name: 'Monitor', component: Monitor, category: '代码', keywords: ['demo', '演示', '预览', '项目'] },
  { name: 'Folder', component: Folder, category: '代码', keywords: ['folder', '文件夹', '项目', '目录'] },

  { name: 'Video', component: Video, category: '视频', keywords: ['video', '视频', '教学', '录像'] },
  { name: 'Play', component: Play, category: '视频', keywords: ['play', '播放', '视频', '开始'] },

  { name: 'FileText', component: FileText, category: '文档', keywords: ['file', 'text', '文档', '文件', '说明'] },
  { name: 'BookOpen', component: BookOpen, category: '文档', keywords: ['book', '书籍', '教程', '文档', '学习'] },
  { name: 'Download', component: Download, category: '文档', keywords: ['download', '下载', '资源', '文件'] },

  { name: 'Users', component: Users, category: '社交', keywords: ['users', '用户', '社群', '交流'] },
  { name: 'MessageCircle', component: MessageCircle, category: '社交', keywords: ['message', '消息', '聊天', '讨论'] },
  { name: 'Link', component: Link, category: '链接', keywords: ['link', '链接', '网址', 'url'] }
];

const categories = ['全部', '代码', '视频', '文档', '社交', '链接'];

export const IconSelector: React.FC<IconSelectorProps> = ({
  value = '',
  onChange,
  placeholder = '选择图标',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');

  const selectedIcon = iconOptions.find(icon => icon.name === value);

  const filteredIcons = iconOptions.filter(icon => {
    const matchesCategory = selectedCategory === '全部' || icon.category === selectedCategory;
    const matchesSearch = searchTerm === '' ||
      icon.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase())) ||
      icon.name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleIconSelect = (iconName: string) => {
    onChange(iconName);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* 触发按钮 */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-start h-auto p-3"
      >
        <div className="flex items-center space-x-3">
          {selectedIcon ? (
            <>
              <div className="p-2 bg-blue-100 rounded-lg">
                <selectedIcon.component className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">{selectedIcon.name}</div>
                <div className="text-sm text-gray-500">{selectedIcon.category}</div>
              </div>
            </>
          ) : (
            <div className="text-gray-500">{placeholder}</div>
          )}
        </div>
      </Button>

      {/* 下拉面板 */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 flex flex-col">
          {/* 搜索和分类 */}
          <div className="p-4 border-b border-gray-100 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="搜索图标..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-1">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-100 text-blue-600 font-medium'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* 图标网格 */}
          <div className="flex-1 overflow-y-auto p-4">
            {filteredIcons.length > 0 ? (
              <div className="grid grid-cols-4 gap-3">
                {filteredIcons.map(icon => (
                  <button
                    key={icon.name}
                    onClick={() => handleIconSelect(icon.name)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 ${
                      value === icon.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <icon.component className="h-6 w-6 text-gray-600" />
                      <div className="text-xs text-gray-700 font-medium">
                        {icon.name}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <div>未找到匹配的图标</div>
              </div>
            )}
          </div>

          {/* 底部操作 */}
          <div className="p-4 border-t border-gray-100 flex justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={!value}
            >
              清除
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4 mr-1" />
              关闭
            </Button>
          </div>
        </div>
      )}

      {/* 背景遮罩 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};