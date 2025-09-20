import React from 'react';
import { TrendingUp, Users, Award, Code, MessageSquare } from 'lucide-react';

export const Hero: React.FC = () => {

  const stats = [
    { icon: Users, value: '50K+', label: '活跃学员' },
    { icon: Award, value: '500+', label: '专业课程' },
    { icon: TrendingUp, value: '95%', label: '成功率' }
  ];

  return (
    <section className="relative bg-gradient-to-br from-yellow-50 via-white to-orange-50 pt-20 pb-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              打造你的
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent block">
                技术生涯
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              加入我们的技术社区，与专业开发者一起学习、成长、分享
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl mb-2">
                    <stat.icon className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <img
                src="/duck-learning-hero.jpg"
                alt="敲鸭社区学习插画"
                className="w-full h-64 object-contain rounded-xl"
              />
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  敲鸭社区
                </h3>
                <p className="text-gray-600">
                  加入敲鸭大家庭，与志同道合的开发者一起成长。
                </p>
              </div>
            </div>
            
            {/* Floating cards */}
            <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 animate-float">
              <div className="flex items-center space-x-2">
                <Code className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium">实战项目</span>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 animate-float animation-delay-2000">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-orange-500" />
                <span className="text-sm font-medium">技术分享</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};