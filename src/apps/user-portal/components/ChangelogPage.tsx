import React, { useState, useMemo } from 'react';
import { Search, Filter, FileText, Clock } from 'lucide-react';
import { Input } from '@shared/components/ui/Input';
import { Badge } from '@shared/components/ui/Badge';
import { Button } from '@shared/components/ui/Button';
import { ChangelogCard } from '@shared/components/business/ChangelogCard';
import { changelogEntries } from '@shared/constants/mockData';

interface ChangelogPageProps {
  onVersionClick?: (versionId: string) => void;
}

export const ChangelogPage: React.FC<ChangelogPageProps> = ({ onVersionClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'important' | 'feature' | 'improvement' | 'bugfix'>('all');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // 筛选和搜索逻辑
  const filteredChangelogs = useMemo(() => {
    return changelogEntries.filter(changelog => {
      // 搜索过滤
      const matchesSearch = !searchTerm || 
        changelog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        changelog.version.includes(searchTerm) ||
        changelog.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        changelog.changes.some(change => 
          change.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          change.description.toLowerCase().includes(searchTerm.toLowerCase())
        );

      // 分类过滤
      const matchesFilter = 
        activeFilter === 'all' ||
        (activeFilter === 'important' && changelog.isImportant) ||
        (activeFilter !== 'important' && activeFilter !== 'all' && 
          changelog.changes.some(change => change.type === activeFilter));

      return matchesSearch && matchesFilter && changelog.status === 'published';
    }).sort((a, b) => b.releaseDate.getTime() - a.releaseDate.getTime());
  }, [searchTerm, activeFilter]);

  const handleToggleExpand = (changelogId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(changelogId)) {
        newSet.delete(changelogId);
      } else {
        newSet.add(changelogId);
      }
      return newSet;
    });
  };

  // 统计数据
  const stats = useMemo(() => {
    const total = changelogEntries.filter(c => c.status === 'published').length;
    const important = changelogEntries.filter(c => c.status === 'published' && c.isImportant).length;
    const features = changelogEntries.filter(c => 
      c.status === 'published' && c.changes.some(change => change.type === 'feature')
    ).length;
    const improvements = changelogEntries.filter(c => 
      c.status === 'published' && c.changes.some(change => change.type === 'improvement')
    ).length;
    const bugfixes = changelogEntries.filter(c => 
      c.status === 'published' && c.changes.some(change => change.type === 'bugfix')
    ).length;

    return { total, important, features, improvements, bugfixes };
  }, []);

  const filterTabs = [
    { id: 'all', name: '全部更新', count: stats.total, icon: FileText },
    { id: 'important', name: '重要更新', count: stats.important, icon: Clock },
    { id: 'feature', name: '新功能', count: stats.features, icon: null },
    { id: 'improvement', name: '优化改进', count: stats.improvements, icon: null },
    { id: 'bugfix', name: '问题修复', count: stats.bugfixes, icon: null }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 页面头部 */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-3">
          <div className="h-10 w-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">平台更新日志</h1>
            <p className="text-gray-600 mt-1">了解巧牙社区的最新功能和改进</p>
          </div>
        </div>
      </div>

      {/* 搜索和筛选区域 */}
      <div className="mb-6 space-y-4">
        {/* 搜索框 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="搜索版本号、功能或内容..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center space-x-2 min-w-fit">
            <Filter className="h-4 w-4" />
            <span>高级筛选</span>
          </Button>
        </div>

        {/* 分类标签 */}
        <div className="flex flex-wrap gap-2">
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`
                  inline-flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 border
                  ${activeFilter === tab.id
                    ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 border-orange-200 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{tab.name}</span>
                <Badge 
                  variant="secondary" 
                  size="sm" 
                  className={activeFilter === tab.id ? 'bg-orange-200 text-orange-800' : ''}
                >
                  {tab.count}
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      {/* 更新日志列表 */}
      <div className="space-y-6">
        {filteredChangelogs.length > 0 ? (
          filteredChangelogs.map((changelog) => (
            <ChangelogCard
              key={changelog.id}
              changelog={changelog}
              isExpanded={expandedCards.has(changelog.id)}
              onToggleExpand={() => handleToggleExpand(changelog.id)}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">未找到相关更新</h3>
            <p className="text-gray-600">
              {searchTerm ? '尝试调整搜索关键词' : '暂无符合筛选条件的更新内容'}
            </p>
            {searchTerm && (
              <Button
                variant="outline"
                onClick={() => setSearchTerm('')}
                className="mt-4"
              >
                清除搜索
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 底部提示 */}
      {filteredChangelogs.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">
            显示了 {filteredChangelogs.length} 个版本更新 • 
            想查看更多历史版本？
            <button className="text-blue-600 hover:text-blue-700 ml-1">
              联系我们
            </button>
          </p>
        </div>
      )}
    </div>
  );
};