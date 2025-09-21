import React, { useState, useEffect } from 'react';
import { Star, Quote } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TestimonialService } from '@shared/services/api/testimonial.service';
import { PublicTestimonialDTO } from '@shared/types';

// 临时默认头像（用于没有用户头像的情况）
const DEFAULT_AVATARS = [
  'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
  'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
];

// 用于展示的评价数据接口
interface DisplayTestimonial {
  id: string;
  name: string;
  content: string;
  rating: number;
  avatar: string;
}

export const Testimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<DisplayTestimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 处理用户名脱敏（保护隐私）
  const maskUserName = (name: string): string => {
    if (name.length <= 2) {
      return name;
    }
    if (name.length <= 4) {
      return name.charAt(0) + '*'.repeat(name.length - 2) + name.charAt(name.length - 1);
    }
    return name.substring(0, 2) + '*'.repeat(name.length - 4) + name.substring(name.length - 2);
  };

  // 获取随机头像
  const getRandomAvatar = (index: number): string => {
    return DEFAULT_AVATARS[index % DEFAULT_AVATARS.length];
  };

  // 加载已发布的评价
  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await TestimonialService.getPublishedTestimonials();

        // 转换数据格式并限制显示数量（最多6条）
        const displayData: DisplayTestimonial[] = data
          .slice(0, 6)
          .map((item: PublicTestimonialDTO, index: number) => ({
            id: item.id,
            name: maskUserName(item.userNickname || `用户${index + 1}`), // 用户名脱敏
            content: item.content,
            rating: item.rating,
            avatar: getRandomAvatar(index)
          }));

        setTestimonials(displayData);
      } catch (err) {
        console.error('加载评价数据失败:', err);
        setError('加载评价数据失败，请稍后重试');
        // 不再设置备用数据，直接显示空状态
        setTestimonials([]);
      } finally {
        setLoading(false);
      }
    };

    loadTestimonials();
  }, []);

  // 渲染加载状态
  const renderLoading = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="p-8">
          <div className="flex items-center mb-4">
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-20 w-full mb-6" />
          <div className="flex items-center">
            <Skeleton className="h-12 w-12 rounded-full mr-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  // 渲染错误状态
  const renderError = () => (
    <div className="text-center py-12">
      <p className="text-gray-500 mb-4">{error}</p>
    </div>
  );

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            学员真实评价
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            听听我们学员的真实声音，了解他们在敲鸭社区的学习体验和收获。
          </p>
        </div>

        {loading ? renderLoading() : (
          <>
            {error && renderError()}
            {testimonials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((testimonial) => (
                  <Card key={testimonial.id} className="p-8 relative hover:shadow-lg transition-shadow duration-300">
                    <Quote className="absolute top-4 right-4 h-8 w-8 text-blue-200" />

                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                      ))}
                    </div>

                    <p className="text-gray-700 mb-6 leading-relaxed line-clamp-4">
                      "{testimonial.content}"
                    </p>

                    <div className="flex items-center">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="h-12 w-12 rounded-full object-cover mr-4"
                        onError={(e) => {
                          // 头像加载失败时使用默认头像
                          e.currentTarget.src = DEFAULT_AVATARS[0];
                        }}
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                        <p className="text-sm text-gray-600">
                          敲鸭社区学员
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : !error && (
              <div className="text-center py-12">
                <p className="text-gray-500">暂无学员评价</p>
                <p className="text-sm text-gray-400 mt-2">成为第一个分享学习体验的学员吧！</p>
              </div>
            )}
          </>
        )}

        {/* 鼓励用户分享评价 */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            也想分享您的学习体验？
          </p>
          <a
            href="/dashboard/user-backend/testimonial"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            分享我的评价
          </a>
        </div>
      </div>
    </section>
  );
};