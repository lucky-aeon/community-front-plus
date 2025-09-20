import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Heart, Clock, Pin, ChevronRight, User } from 'lucide-react';
import { Card } from '@shared/components/ui/Card';
import { Button } from '@shared/components/ui/Button';
import { Badge } from '@shared/components/ui/Badge';
import { LoadingSpinner } from '@shared/components/ui/LoadingSpinner';
import { courses, comments } from '@shared/constants/mockData';
import { routeUtils } from '@shared/routes/routes';
import { PostsService } from '@shared/services/api/posts.service';
import { FrontPostDTO } from '@shared/types';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [recentPosts, setRecentPosts] = useState<FrontPostDTO[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const recentCourses = courses.slice(0, 3);
  const recentComments = comments.slice(0, 3);

  // 生成默认头像颜色
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-gray-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // 获取用户名首字母
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  // 获取最新文章
  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        setIsLoadingPosts(true);
        const response = await PostsService.getPublicPosts({
          pageNum: 1,
          pageSize: 3
        });
        setRecentPosts(response.records);
      } catch (error) {
        console.error('获取最新文章失败:', error);
      } finally {
        setIsLoadingPosts(false);
      }
    };

    fetchRecentPosts();
  }, []);

  const handlePostClick = (postId: string) => {
    navigate(routeUtils.getPostDetailRoute(postId));
  };

  const handleCourseClick = (courseId: string) => {
    navigate(routeUtils.getCourseDetailRoute(courseId));
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Latest Posts */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">最新文章</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/discussions')}
              className="group"
            >
              查看全部
              <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          
          <div className="space-y-4 md:space-y-6">
            {isLoadingPosts ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <Card
                  key={post.id}
                  className="p-4 md:p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                  onClick={() => handlePostClick(post.id)}
                >
                  {/* 作者信息栏 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {/* 用户头像 */}
                      <div className="relative">
                        {/* 目前头像为 null，显示默认头像 */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                          getAvatarColor(post.authorName)
                        }`}>
                          {getInitials(post.authorName)}
                        </div>
                      </div>

                      {/* 用户信息 */}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {post.authorName}
                        </p>
                        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(post.publishTime).toLocaleDateString('zh-CN')}</span>
                        </div>
                      </div>
                    </div>

                    {/* 分类标签和置顶标识 */}
                    <div className="flex items-center space-x-2">
                      <Badge variant="primary" size="sm">
                        {post.categoryName}
                      </Badge>
                      {post.isTop && (
                        <Badge variant="warning" className="flex items-center space-x-1 bg-yellow-500 text-white">
                          <Pin className="h-3 w-3" />
                          <span>置顶</span>
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* 主内容区域 */}
                  <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
                    {post.coverImage && (
                      <div className="relative w-full sm:w-auto flex-shrink-0">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full sm:w-28 h-48 sm:h-28 rounded-lg object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      {/* 文章标题 */}
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {post.title}
                      </h3>

                      {/* 文章摘要 */}
                      {post.summary && (
                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 leading-relaxed text-sm md:text-base">
                          {post.summary}
                        </p>
                      )}

                      {/* 互动数据 */}
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1 text-red-500 hover:text-red-600 transition-colors">
                          <Heart className="h-4 w-4" />
                          <span className="font-medium">{post.likeCount}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-blue-500 hover:text-blue-600 transition-colors">
                          <MessageSquare className="h-4 w-4" />
                          <span className="font-medium">{post.commentCount}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                          <span className="text-xs">{post.viewCount} 次查看</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 md:py-12">
                <MessageSquare className="w-12 h-12 md:w-16 md:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg">暂无文章</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs md:text-sm mt-1">等待作者发布精彩内容</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6 lg:space-y-8">
          {/* Latest Courses */}
          <div>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">最新课程</h2>
              <Button variant="ghost" size="sm" className="group">
                查看全部
                <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            
            <div className="space-y-3 md:space-y-4">
              {recentCourses.map((course) => (
                <Card key={course.id} className="p-3 md:p-4 hover:shadow-md transition-shadow">
                  <div className="flex space-x-3 cursor-pointer" onClick={() => handleCourseClick(course.id)}>
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                        {course.title}
                      </h4>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2">{course.instructor}</p>
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={
                            course.level === 'beginner' ? 'success' :
                            course.level === 'intermediate' ? 'primary' :
                            'warning'
                          }
                          size="sm"
                        >
                          {course.level === 'beginner' ? '初级' :
                           course.level === 'intermediate' ? '中级' : '高级'}
                        </Badge>
                        <span className="text-base md:text-lg font-bold text-blue-600 dark:text-blue-400">${course.price}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Latest Comments */}
          <div>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">最新评论</h3>
              <Button variant="ghost" size="sm" className="group">
                查看全部
                <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            
            <div className="space-y-3 md:space-y-4">
              {recentComments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 md:p-4">
                  <div className="flex items-start space-x-3">
                    <img
                      src={comment.author.avatar}
                      alt={comment.author.name}
                      className="h-8 w-8 md:h-10 md:w-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm md:text-base">{comment.author.name}</p>
                        <Badge
                          variant={
                            comment.author.membershipTier === 'premium' ? 'warning' :
                            comment.author.membershipTier === 'vip' ? 'error' :
                            'primary'
                          }
                          size="sm"
                          className={
                            comment.author.membershipTier === 'vip' ?
                            'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0' : ''
                          }
                        >
                          {comment.author.membershipTier.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-2 text-sm md:text-base">{comment.content}</p>
                      <div className="flex items-center space-x-3 md:space-x-4 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                        <span>241天前</span>
                        <div className="flex items-center space-x-1">
                          <Heart className="h-3 w-3 md:h-4 md:w-4" />
                          <span>{comment.likes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};