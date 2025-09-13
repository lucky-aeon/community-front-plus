import React from 'react';
import { Clock, MessageSquare, Heart, TrendingUp, BookOpen, Users } from 'lucide-react';
import { Card } from '@shared/components/ui/Card';
import { Badge } from '@shared/components/ui/Badge';
import { posts, courses, comments } from '@shared/constants/mockData';

interface HomePageProps {
  onPostClick: (postId: string) => void;
  onCourseClick: (courseId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onPostClick, onCourseClick }) => {
  const recentPosts = posts.slice(0, 3);
  const recentCourses = courses.slice(0, 3);
  const recentComments = comments.slice(0, 3);

  const formatDate = (date: Date) => {
    return new Intl.RelativeTimeFormat('zh-CN', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  const getMembershipColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'vip': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">社区首页</h1>
        <p className="text-gray-600">欢迎回到 EduElite 学习社区</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-xl">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">1,234</p>
              <p className="text-sm text-gray-600">今日活跃用户</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-xl">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">89</p>
              <p className="text-sm text-gray-600">今日新讨论</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-xl">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-sm text-gray-600">新增课程</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-xl">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">5,678</p>
              <p className="text-sm text-gray-600">社区成员</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Latest Articles */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">最新文章</h2>
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              查看全部
            </button>
          </div>
          
          <div className="space-y-6">
            {recentPosts.map((post) => (
              <Card key={post.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">{post.author.name}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getMembershipColor(post.author.membershipTier)}`}>
                          {post.author.membershipTier.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
                    </div>
                  </div>
                  <Badge variant={post.type === 'article' ? 'primary' : 'warning'}>
                    {post.type === 'article' ? '文章' : '问答'}
                  </Badge>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                  <button onClick={() => onPostClick(post.id)} className="text-left">
                    {post.title}
                  </button>
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {post.content}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{post.comments}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Latest Courses */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">最新课程</h2>
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                查看全部
              </button>
            </div>
            
            <div className="space-y-4">
              {recentCourses.map((course) => (
                <Card key={course.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex space-x-3 cursor-pointer" onClick={() => onCourseClick(course.id)}>
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 line-clamp-2 mb-1">
                        {course.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">{course.instructor}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" size="sm">
                          {course.level}
                        </Badge>
                        <span className="text-sm font-medium text-gray-900">
                          ${course.price}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Latest Comments */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">最新评论</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                查看全部
              </button>
            </div>
            
            <div className="space-y-4">
              {recentComments.map((comment) => (
                <Card key={comment.id} className="p-4">
                  <div className="flex items-start space-x-3">
                    <img
                      src={comment.author.avatar}
                      alt={comment.author.name}
                      className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium text-gray-900">
                          {comment.author.name}
                        </p>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${getMembershipColor(comment.author.membershipTier)}`}>
                          {comment.author.membershipTier.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {comment.content}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </p>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Heart className="h-3 w-3" />
                          <span>{comment.likes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};