import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, BookOpen, Users, ArrowRight, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@shared/routes/routes';

interface CommunityStats {
  totalPosts?: number;
  totalCourses?: number;
  totalUsers?: number;
}

interface HeroSectionProps {
  stats?: CommunityStats;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ stats }) => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-gradient-to-br from-yellow-50 via-white to-orange-50 rounded-3xl p-8 mb-8 overflow-hidden">
      {/* 装饰性背景元素 */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />

      <div className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* 左侧：欢迎内容 */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-3xl">🦆</span>
              <Badge variant="primary" size="md">敲鸭社区</Badge>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
              欢迎回到
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent block">
                敲鸭社区
              </span>
            </h1>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              发现精品技术内容，与专业开发者一起学习成长
            </p>

            {/* 快捷操作按钮 */}
            <div className="flex flex-wrap gap-4 mb-8">
              <Button
                variant="primary"
                onClick={() => navigate(ROUTES.USER_BACKEND_ARTICLES_CREATE)}
                className="flex items-center space-x-2"
              >
                <Edit3 className="h-4 w-4" />
                <span>发布文章</span>
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Button
                variant="secondary"
                onClick={() => navigate(ROUTES.DASHBOARD_COURSES)}
              >
                浏览课程
              </Button>
            </div>

            {/* 社区统计（如果有数据） */}
            {stats && (
              <div className="grid grid-cols-3 gap-6">
                {stats.totalPosts && (
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl mb-2">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalPosts}</div>
                    <div className="text-sm text-gray-600">篇文章</div>
                  </div>
                )}

                {stats.totalCourses && (
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-100 to-green-200 rounded-xl mb-2">
                      <BookOpen className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalCourses}</div>
                    <div className="text-sm text-gray-600">门课程</div>
                  </div>
                )}

                {stats.totalUsers && (
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl mb-2">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
                    <div className="text-sm text-gray-600">位成员</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 右侧：今日亮点（可以放置精选内容或插画） */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                </div>

                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"></div>
                    <div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                      <div className="h-2 bg-gray-100 rounded w-12 mt-1"></div>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">精品内容</Badge>
                </div>
              </div>

              {/* 浮动标签 */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 animate-float">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">专业课程</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-3 animate-float animation-delay-2000">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">技术分享</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
