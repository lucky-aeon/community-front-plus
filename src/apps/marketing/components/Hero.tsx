import React, { useEffect, useMemo, useState } from 'react';
import { TrendingUp, Users, Award, Code, MessageSquare } from 'lucide-react';
import { PublicCoursesService, PublicStatsService, apiClient, ApiResponse } from '@shared/services/api';
import { InstallCommandBlock } from '@shared/components/business/InstallCommandBlock';
import { hasConfiguredInstallCommand, type InstallCommandConfig } from '@shared/utils/install-command';

export const Hero: React.FC = () => {
  const [qiaoyaConfig, setQiaoyaConfig] = useState<InstallCommandConfig | null>(null);
  const [courseTotal, setCourseTotal] = useState<number>(0);
  const [userTotal, setUserTotal] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    const loadTotal = async () => {
      try {
        // 仅取 total，避免加载大量数据
        const [coursePage, users] = await Promise.all([
          PublicCoursesService.getPublicCoursesList({ pageNum: 1, pageSize: 1 }),
          PublicStatsService.getUsersTotalCount(),
        ]);
        if (!cancelled) {
          setCourseTotal(coursePage.total || 0);
          setUserTotal(users || 0);
        }
      } catch {
        if (!cancelled) {
          setCourseTotal(0);
          setUserTotal(0);
        }
      }
    };
    loadTotal();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadConfig = async () => {
      try {
        const resp = await apiClient.get<ApiResponse<InstallCommandConfig>>('/public/site/plus-guide-config');
        if (!cancelled) {
          setQiaoyaConfig(resp.data.data || null);
        }
      } catch {
        // 静默失败
      }
    };
    loadConfig();
    return () => { cancelled = true; };
  }, []);

  const courseCountDisplay = useMemo(() => {
    // 严格使用接口返回总数，不做占位回退
    return courseTotal.toLocaleString('zh-CN');
  }, [courseTotal]);

  const userCountDisplay = useMemo(() => {
    // >= 1000 显示 K+，否则显示原值
    if (userTotal >= 1000) {
      const k = Math.floor(userTotal / 1000);
      return `${k}K+`;
    }
    return String(userTotal);
  }, [userTotal]);

  const showInstallCommand = hasConfiguredInstallCommand(qiaoyaConfig);

  const stats = [
    { icon: Users, value: userCountDisplay, label: '活跃学员' },
    { icon: Award, value: courseCountDisplay, label: '专业课程' },
    { icon: TrendingUp, value: '95%', label: '就业率' }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-yellow-50 via-white to-orange-50 pt-16 pb-24 sm:pt-20 sm:pb-32">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-5 sm:mb-6">
              打造你的
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent block">
                技术生涯
              </span>
            </h1>
            
            <p className="text-base sm:text-xl text-gray-600 mb-8 sm:mb-10 leading-relaxed">
              加入我们的技术社区，与专业开发者一起学习、成长、分享
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 sm:h-12 sm:w-12 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl mb-2">
                    <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>

            {showInstallCommand && qiaoyaConfig && (
            <div className="mt-8 max-w-2xl rounded-2xl border border-honey-200/80 bg-white/80 p-4 text-left shadow-lg shadow-honey-200/20 backdrop-blur-sm">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-honey-700">
                <span className="h-2 w-2 rounded-full bg-honey-500" />
                给 AI 的快速入口
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                也可以让 AI 先替你逛一圈敲鸭社区
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                适用于 Codex、Claude Code、Cursor、Windsurf、OpenClaw 等 Agent 工具，无需 Node / Python，执行后可让 AI 直接了解社区课程、服务和内容结构。
              </p>

              <InstallCommandBlock config={qiaoyaConfig} className="mt-4" />
            </div>
            )}
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 transform sm:rotate-3 hover:rotate-0 transition-transform duration-300">
              <img
                src="/duck-learning-hero.jpg"
                alt="敲鸭社区学习插画"
                width={768}
                height={512}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                className="w-full h-52 sm:h-64 object-contain rounded-xl"
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
            <div className="absolute -top-4 -right-4 hidden sm:block bg-white rounded-xl shadow-lg p-4 animate-float">
              <div className="flex items-center space-x-2">
                <Code className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium">实战项目</span>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 hidden sm:block bg-white rounded-xl shadow-lg p-4 animate-float animation-delay-2000">
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
