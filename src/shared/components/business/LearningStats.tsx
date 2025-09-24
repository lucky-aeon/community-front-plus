import React from 'react';
import { BookOpen, MessageSquare, Clock, Target, Award, Users, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@shared/utils/cn';

interface LearningStatsProps {
  className?: string;
  stats?: {
    totalLearningHours: number;
    coursesCompleted: number;
    articlesRead: number;
    discussionsJoined: number;
    currentStreak: number;
    weeklyGoal: number;
    weeklyProgress: number;
    rank: number;
    points: number;
  };
}

export const LearningStats: React.FC<LearningStatsProps> = ({
  className,
  stats = {
    totalLearningHours: 124,
    coursesCompleted: 8,
    articlesRead: 45,
    discussionsJoined: 23,
    currentStreak: 12,
    weeklyGoal: 20,
    weeklyProgress: 14,
    rank: 156,
    points: 2480
  }
}) => {
  const progressPercentage = Math.round((stats.weeklyProgress / stats.weeklyGoal) * 100);

  const statCards = [
    {
      title: '总学习时长',
      value: `${stats.totalLearningHours}h`,
      icon: Clock,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      subtitle: '累计学习时间'
    },
    {
      title: '完成课程',
      value: stats.coursesCompleted,
      icon: BookOpen,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      subtitle: '门课程已完成'
    },
    {
      title: '阅读文章',
      value: stats.articlesRead,
      icon: MessageSquare,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      subtitle: '篇技术文章'
    },
    {
      title: '连续天数',
      value: stats.currentStreak,
      icon: Zap,
      color: 'from-honey-500 to-orange-500',
      bgColor: 'bg-honey-50',
      textColor: 'text-honey-600',
      subtitle: '天连续学习',
      badge: stats.currentStreak >= 7 ? '周连击' : undefined
    }
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="p-4 hover:shadow-lg transition-all duration-200 group border-0 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className={cn("p-2 rounded-xl", stat.bgColor)}>
                  <IconComponent className={cn("h-5 w-5", stat.textColor)} />
                </div>
                {stat.badge && (
                  <Badge className={cn("text-xs", stat.textColor, "bg-transparent border-current")}>
                    {stat.badge}
                  </Badge>
                )}
              </div>
              <div className="space-y-1">
                <div className={cn(
                  "text-2xl font-bold group-hover:scale-105 transition-transform origin-left",
                  stat.textColor
                )}>
                  {stat.value}
                </div>
                <div className="text-xs text-warm-gray-500 font-medium">{stat.title}</div>
                <div className="text-xs text-warm-gray-400">{stat.subtitle}</div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Weekly Progress Card */}
      <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-honey-50 to-honey-100/50">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-honey-200 rounded-xl">
                <Target className="h-5 w-5 text-honey-700" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">本周学习目标</h3>
                <p className="text-sm text-warm-gray-600">坚持每天学习，养成好习惯</p>
              </div>
            </div>
            <Badge className="bg-honey-200 text-honey-800 border-honey-300">
              {stats.weeklyProgress} / {stats.weeklyGoal} 小时
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-warm-gray-600">完成进度</span>
              <span className="font-bold text-honey-700">{progressPercentage}%</span>
            </div>
            <Progress
              value={progressPercentage}
              className="h-3 bg-honey-200"
            />
            <div className="flex justify-between text-xs text-warm-gray-500">
              <span>本周已学习 {stats.weeklyProgress} 小时</span>
              <span>{progressPercentage >= 100 ? '目标已达成！' : `还需 ${stats.weeklyGoal - stats.weeklyProgress} 小时`}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Achievement & Ranking */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Community Ranking */}
        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-200 rounded-2xl">
              <Users className="h-6 w-6 text-purple-700" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">社区排名</h3>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-purple-700">#{stats.rank}</span>
                <span className="text-sm text-warm-gray-600">本月排名</span>
              </div>
              <p className="text-xs text-warm-gray-500 mt-1">学习积分: {stats.points.toLocaleString()} 分</p>
            </div>
          </div>
        </Card>

        {/* Achievements */}
        <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-premium-50 to-premium-100/50">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-premium-200 rounded-2xl">
              <Award className="h-6 w-6 text-premium-700" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">最新成就</h3>
              <div className="space-y-1">
                <Badge className="bg-premium-200 text-premium-800 border-premium-300 text-xs">
                  🔥 连续学习达人
                </Badge>
                <p className="text-xs text-warm-gray-500">连续学习 {stats.currentStreak} 天</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
