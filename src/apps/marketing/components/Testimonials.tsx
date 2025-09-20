import React from 'react';
import { Star, Quote } from 'lucide-react';
import { Card } from '@shared/components/ui/Card';

export const Testimonials: React.FC = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Senior Developer at Google',
      avatar: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      content: 'EduElite transformed my career. The courses are incredibly detailed and the instructors are world-class. I landed my dream job at Google thanks to the skills I learned here.',
      rating: 5
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'CTO at TechStart',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      content: 'The VIP membership is worth every penny. The 1-on-1 mentoring sessions helped me scale my startup and the exclusive content is always cutting-edge.',
      rating: 5
    },
    {
      id: 3,
      name: 'Emma Rodriguez',
      role: 'UX Designer at Apple',
      avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      content: 'The design courses here are phenomenal. I went from a junior designer to leading design at Apple in just 18 months. The community support is amazing too.',
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            成功案例
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            加入成千上万优秀专业人士的行列，通过敲鸭社区改变您的职业轨迹。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="p-8 relative">
              <Quote className="absolute top-4 right-4 h-8 w-8 text-blue-200" />
              
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                ))}
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              <div className="flex items-center">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="h-12 w-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};