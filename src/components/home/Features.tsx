import React from 'react';
import { BookOpen, Users, AlignCenterVertical as Certificate, MessageCircle, Download, Clock, Star, Award } from 'lucide-react';

export const Features: React.FC = () => {
  const features = [
    {
      icon: BookOpen,
      title: 'Expert-Led Courses',
      description: 'Learn from industry professionals with years of real-world experience.',
      color: 'text-blue-600 bg-blue-100'
    },
    {
      icon: Users,
      title: 'Live Workshops',
      description: 'Interactive sessions with instructors and fellow students.',
      color: 'text-green-600 bg-green-100'
    },
    {
      icon: Certificate,
      title: 'Industry Certificates',
      description: 'Earn recognized certificates to boost your professional profile.',
      color: 'text-purple-600 bg-purple-100'
    },
    {
      icon: MessageCircle,
      title: 'Community Support',
      description: '24/7 access to our vibrant community of learners and mentors.',
      color: 'text-orange-600 bg-orange-100'
    },
    {
      icon: Download,
      title: 'Offline Access',
      description: 'Download courses and learn at your own pace, anywhere.',
      color: 'text-pink-600 bg-pink-100'
    },
    {
      icon: Clock,
      title: 'Lifetime Access',
      description: 'Once purchased, access your courses forever with free updates.',
      color: 'text-indigo-600 bg-indigo-100'
    },
    {
      icon: Star,
      title: 'Personalized Learning',
      description: 'AI-powered recommendations tailored to your learning goals.',
      color: 'text-yellow-600 bg-yellow-100'
    },
    {
      icon: Award,
      title: 'Career Support',
      description: 'Get career guidance and job placement assistance.',
      color: 'text-red-600 bg-red-100'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Choose EduElite?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We provide everything you need to succeed in your learning journey, 
            from expert instruction to career support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-300 group"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${feature.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};