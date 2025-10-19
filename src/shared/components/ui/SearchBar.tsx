import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, BookOpen, MessageSquare, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@shared/utils/cn';

interface SearchResult {
  id: string;
  title: string;
  type: 'course' | 'post' | 'chapter';
  url: string;
  excerpt?: string;
  isPremium?: boolean;
}

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  onResultClick?: (result: SearchResult) => void;
  showRecent?: boolean; // 是否展示最近搜索
  showSuggestions?: boolean; // 是否展示下拉搜索结果
}

export const SearchBar: React.FC<SearchBarProps> = ({
  className,
  placeholder = "搜索课程、文章、讨论...",
  onSearch,
  onResultClick,
  showRecent = true,
  showSuggestions = true,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches] = useState<string[]>([
    'React Hooks 最佳实践',
    'TypeScript 进阶',
    'Next.js 性能优化'
  ]);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 模拟搜索结果
  const mockResults: SearchResult[] = [
    {
      id: '1',
      title: 'React Hooks 深入理解',
      type: 'course',
      url: '/courses/1',
      excerpt: '深入学习 React Hooks 的原理和最佳实践',
      isPremium: true
    },
    {
      id: '2',
      title: 'TypeScript 类型系统详解',
      type: 'post',
      url: '/discussions/2',
      excerpt: '全面了解 TypeScript 的类型系统'
    },
    {
      id: '3',
      title: '第三章：组件状态管理',
      type: 'chapter',
      url: '/courses/1/chapters/3',
      excerpt: '学习如何有效地管理组件状态'
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(showSuggestions);

    if (value.length > 0 && showSuggestions) {
      setIsLoading(true);
      // 模拟搜索延迟
      setTimeout(() => {
        setResults(mockResults.filter(item =>
          item.title.toLowerCase().includes(value.toLowerCase())
        ));
        setIsLoading(false);
      }, 300);
    } else {
      setResults([]);
      setIsLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setQuery(result.title);
    setIsOpen(false);
    onResultClick?.(result);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleRecentSearchClick = (search: string) => {
    setQuery(search);
    onSearch?.(search);
    setIsOpen(false);
  };

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'course': return BookOpen;
      case 'post': return MessageSquare;
      case 'chapter': return BookOpen;
      default: return Search;
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'course': return '课程';
      case 'post': return '文章';
      case 'chapter': return '章节';
      default: return '';
    }
  };

  return (
    <div ref={searchRef} className={cn("relative", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-warm-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSearch?.(query);
              setIsOpen(false);
            }
          }}
          onFocus={() => setIsOpen(showSuggestions || showRecent)}
          placeholder={placeholder}
          className={cn(
            "pl-10 pr-10 h-10 bg-white/90 backdrop-blur-sm border-honey-border",
            "focus:ring-2 focus:ring-honey-primary/20 focus:border-honey-primary",
            "transition-all duration-200 hover:bg-white"
          )}
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-honey-border z-50 overflow-hidden animate-fade-in">
          <div className="max-h-96 overflow-y-auto">
            {/* Loading State */}
            {isLoading && (
              <div className="p-4 text-center">
                <div className="animate-pulse">搜索中...</div>
              </div>
            )}

            {/* Search Results */}
            {!isLoading && results.length > 0 && (
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-semibold text-warm-gray-500 uppercase tracking-wider border-b border-gray-100">
                  搜索结果
                </div>
                {results.map((result) => {
                  const TypeIcon = getTypeIcon(result.type);
                  return (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full px-4 py-3 text-left hover:bg-honey-50 transition-colors group flex items-start gap-3"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <TypeIcon className="h-4 w-4 text-warm-gray-400 group-hover:text-honey-primary transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-honey-primary transition-colors truncate">
                            {result.title}
                          </p>
                          {result.isPremium && (
                            <Sparkles className="h-3 w-3 text-premium-500 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-warm-gray-600">
                            {getTypeLabel(result.type)}
                          </span>
                          {result.excerpt && (
                            <p className="text-xs text-warm-gray-500 truncate">
                              {result.excerpt}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Recent Searches */}
            {!isLoading && showRecent && query.length === 0 && (
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-semibold text-warm-gray-500 uppercase tracking-wider border-b border-gray-100">
                  最近搜索
                </div>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(search)}
                    className="w-full px-4 py-3 text-left hover:bg-honey-50 transition-colors group flex items-center gap-3"
                  >
                    <Clock className="h-4 w-4 text-warm-gray-400 group-hover:text-honey-primary transition-colors flex-shrink-0" />
                    <span className="text-sm text-gray-700 group-hover:text-honey-primary transition-colors">
                      {search}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {!isLoading && query.length > 0 && results.length === 0 && (
              <div className="p-8 text-center">
                <Search className="h-8 w-8 text-warm-gray-300 mx-auto mb-3" />
                <p className="text-sm text-warm-gray-500 mb-2">未找到相关内容</p>
                <p className="text-xs text-warm-gray-400">尝试使用不同的关键词</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
