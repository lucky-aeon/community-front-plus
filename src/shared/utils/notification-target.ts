import { routeUtils } from '@shared/routes/routes';
import { ChaptersService } from '@shared/services/api';
import type { UserNotificationDTO } from '@shared/types';

type NotificationTargetInput = Pick<UserNotificationDTO, 'contentType' | 'contentId' | 'commentId' | 'type'>;

const normalizeContentType = (value?: string | null) =>
  typeof value === 'string' ? value.trim().toUpperCase() : '';

const normalizeContentId = (value?: string | null) => {
  if (value === null || value === undefined) return '';
  const text = String(value).trim();
  return text;
};

const normalizeCommentId = (value?: string | null) => {
  if (value === null || value === undefined) return '';
  const text = String(value).trim();
  return text;
};

const SUPPORTED_CONTENT_TYPES = new Set(['POST', 'COURSE', 'CHAPTER', 'INTERVIEW_QUESTION', 'UPDATE_LOG']);

export const getNotificationContentType = (notification: NotificationTargetInput) =>
  normalizeContentType(notification.contentType);

export const isNotificationTargetable = (notification: NotificationTargetInput) => {
  const contentType = normalizeContentType(notification.contentType);
  const contentId = normalizeContentId(notification.contentId);
  return Boolean(contentId && SUPPORTED_CONTENT_TYPES.has(contentType));
};

export const resolveNotificationTarget = async (
  notification: NotificationTargetInput
): Promise<string | null> => {
  const contentType = normalizeContentType(notification.contentType);
  const contentId = normalizeContentId(notification.contentId);
  if (!contentId || !SUPPORTED_CONTENT_TYPES.has(contentType)) return null;
  const commentId = normalizeCommentId(notification.commentId);

  let baseUrl: string | null = null;
  switch (contentType) {
    case 'POST':
      baseUrl = routeUtils.getPostDetailRoute(contentId);
      break;
    case 'COURSE':
      baseUrl = routeUtils.getCourseDetailRoute(contentId);
      break;
    case 'INTERVIEW_QUESTION':
      baseUrl = routeUtils.getInterviewDetailRoute(contentId);
      break;
    case 'UPDATE_LOG':
      return null;
    case 'CHAPTER': {
      try {
        const detail = await ChaptersService.getFrontChapterDetail(contentId);
        baseUrl = `/dashboard/courses/${detail.courseId}/chapters/${contentId}`;
        break;
      } catch (error) {
        console.error('解析章节通知跳转失败:', error);
        return null;
      }
    }
    default:
      return null;
  }

  if (!baseUrl) return null;
  if ((notification.type === 'COMMENT' || notification.type === 'REPLY') && commentId) {
    return `${baseUrl}#comment-${commentId}`;
  }
  return baseUrl;
};
