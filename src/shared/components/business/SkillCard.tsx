import React from 'react';
import { Calendar, ExternalLink, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FavoriteButton } from '@shared/components/business/FavoriteButton';
import { LikeButton } from '@shared/components/ui/LikeButton';
import type { LikeStatusDTO } from '@shared/services/api/likes.service';
import type { PublicSkillDTO, SkillInteractionState } from '@shared/types';

export const GithubMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M12 .5A12 12 0 0 0 0 12.7c0 5.4 3.4 10 8.2 11.6.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.6-4-1.6-.6-1.4-1.3-1.8-1.3-1.8-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 .1.7 2 .7 2 1 .1 2-.5 2-.5-.6-.4-1-.9-1.2-1.5-.2-.6 0-1.3.4-1.8-2.6-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.5 1.3-3.3-.1-.3-.6-1.6.1-3.3 0 0 1-.3 3.4 1.3a11.7 11.7 0 0 1 6.2 0C17 5.2 18 5.5 18 5.5c.7 1.7.2 3 .2 3 .8.8 1.3 2 1.3 3.3 0 4.7-2.8 5.6-5.4 5.9.4.3.7 1 .7 2.1v3c0 .3.2.7.8.6 4.8-1.6 8.2-6.2 8.2-11.6A12 12 0 0 0 12 .5Z" />
  </svg>
);

export interface SkillCardProps {
  skill: PublicSkillDTO;
  onClick: () => void;
  showInteraction: boolean;
  interactionState?: SkillInteractionState;
  onLikeChange?: (next: LikeStatusDTO) => void;
  onFavoriteChange?: (next: boolean) => void;
}

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('zh-CN');
};

export const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  onClick,
  showInteraction,
  interactionState,
  onLikeChange,
  onFavoriteChange,
}) => {
  const handleGithubClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (!skill.githubUrl) {
      return;
    }

    window.open(skill.githubUrl, '_blank', 'noopener,noreferrer');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      className="group h-full cursor-pointer border-warm-gray-200 bg-white/90 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-honey-300 hover:shadow-xl"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <div className="inline-flex items-center rounded-full bg-honey-100 px-2.5 py-1 text-xs font-medium text-honey-700">
              Public Skill
            </div>
            <h3 className="line-clamp-2 text-lg font-semibold text-gray-900">{skill.name}</h3>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-full border-honey-200 bg-white text-gray-700 hover:bg-honey-50"
            onClick={handleGithubClick}
            disabled={!skill.githubUrl}
            aria-label={skill.githubUrl ? `打开 ${skill.name} 的 GitHub 链接` : `${skill.name} 暂无 GitHub 链接`}
          >
            <GithubMarkIcon className="h-4 w-4" />
          </Button>
        </div>

        <p className="line-clamp-3 text-sm leading-6 text-warm-gray-600">
          {skill.summary || '作者暂未填写简介。'}
        </p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-warm-gray-100 pt-4 text-xs text-warm-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            {skill.authorName || '匿名作者'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(skill.createTime)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1 text-sm font-medium text-honey-700">
            查看详情
            <ExternalLink className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </div>

          {showInteraction && (
            <div
              className="flex items-center gap-2"
              onClick={(event) => event.stopPropagation()}
            >
              <LikeButton
                businessType="SKILL"
                businessId={skill.id}
                initialLiked={interactionState?.liked ?? false}
                initialCount={interactionState?.likeCount ?? skill.likeCount ?? 0}
                skipInitialFetch
                onChange={(next) => onLikeChange?.(next)}
              />
              <FavoriteButton
                targetId={skill.id}
                targetType="SKILL"
                variant="ghost"
                size="sm"
                showCount
                initialIsFavorited={interactionState?.isFavorited ?? false}
                initialCount={interactionState?.favoritesCount ?? skill.favoriteCount ?? 0}
                skipInitialFetch
                onToggle={(next) => onFavoriteChange?.(next)}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default SkillCard;
