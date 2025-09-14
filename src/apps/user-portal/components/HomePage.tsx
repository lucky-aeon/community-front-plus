import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Heart } from 'lucide-react';
import { Card } from '@shared/components/ui/Card';
import { PostCard } from '@shared/components/business/PostCard';
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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Latest Posts */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">最新文章</h2>
            <button 
              className="text-blue-600 hover:text-blue-700 font-medium"
              onClick={() => navigate('/discussions')}
            >
              查看全部
            </button>
          </div>
          
          <div className="space-y-6">
            {isLoadingPosts ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handlePostClick(post.id)}>
                  <div className="flex items-start space-x-4">
                    {post.coverImage && (
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {post.title}
                      </h3>
                      {post.summary && (
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {post.summary}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>{post.authorName}</span>
                          <span>{post.categoryName}</span>
                          <span>{new Date(post.publishTime).toLocaleDateString('zh-CN')}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center space-x-1">
                            <Heart className="h-4 w-4" />
                            <span>{post.likeCount}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{post.commentCount}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                暂无文章
              </div>
            )}
          </div>
        </div>

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
                  <div className="flex space-x-3 cursor-pointer" onClick={() => handleCourseClick(course.id)}>
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                        {course.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">{course.instructor}</p>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          course.level === 'beginner' ? 'bg-green-100 text-green-800' :
                          course.level === 'intermediate' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {course.level}
                        </span>
                        <span className="text-lg font-bold text-blue-600">${course.price}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Latest Comments */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">最新评论</h3>
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                查看全部
              </button>
            </div>
            
            <div className="space-y-4">
              {recentComments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <img
                      src={comment.author.avatar}
                      alt={comment.author.name}
                      className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium text-gray-900">{comment.author.name}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          comment.author.membershipTier === 'premium' ? 'bg-purple-100 text-purple-800' :
                          comment.author.membershipTier === 'vip' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {comment.author.membershipTier.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{comment.content}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>241天前</span>
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4" />
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