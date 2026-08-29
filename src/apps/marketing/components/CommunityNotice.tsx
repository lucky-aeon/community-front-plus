import React from 'react';
import { ArrowUpRight, Info } from 'lucide-react';

const BILIBILI_PROFILE_URL = 'https://space.bilibili.com/152686439';

export const CommunityNotice: React.FC = () => {
  return (
    <section
      aria-labelledby="community-notice-title"
      className="border-y border-amber-200 bg-amber-50/70"
    >
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 sm:py-14 lg:grid-cols-[0.8fr_1.4fr] lg:gap-16 lg:px-8">
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
            <Info aria-hidden="true" className="h-4 w-4" />
            <span>社区公告</span>
          </div>
          <h2
            id="community-notice-title"
            className="mt-4 max-w-md text-2xl font-bold leading-tight text-gray-950 [text-wrap:pretty] sm:text-3xl"
          >
            敲鸭社区已停止新增付费
          </h2>
          <a
            href={BILIBILI_PROFILE_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#fb7299] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#e9658b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb7299] focus-visible:ring-offset-2"
          >
            前往 B 站
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </a>
        </div>

        <div className="max-w-3xl space-y-4 text-base leading-7 text-gray-700 [text-wrap:pretty]">
          <p>从即日起，敲鸭社区不再接受会员、课程及相关服务的新付款。</p>
          <p>
            随着 AI 编程工具和开发方式快速变化，我重新评估了社区目前的内容。部分项目和课程仍然具有参考价值，但已经不适合继续作为持续维护的付费内容进行售卖。
          </p>
          <p>
            社区课程与我在 B 站发布的公开讲解主体内容相近，社区版本主要增加了完整代码和更细致的实现说明。新朋友建议直接前往 B 站观看，不需要为这些内容付款。
          </p>
          <p>
            社区现有内容会继续保留。目前没有固定的更新计划；未来如果有值得补充的新内容，仍可能继续更新，具体以届时公告为准。
          </p>
        </div>
      </div>
    </section>
  );
};
