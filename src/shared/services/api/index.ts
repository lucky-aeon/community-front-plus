// API服务导出文件
export { AuthService } from './auth.service';
export { PostsService } from './posts.service';  
export { UserService } from './user.service';
export { UploadService } from './upload.service';
export { CommentsService } from './comments.service';
export { CategoriesService } from './categories.service';
export { CoursesService } from './courses.service';
export { ChaptersService } from './chapters.service';
export { AdminUserService } from './admin-user.service';
export { AdminTestimonialService } from './admin-testimonial.service';
export { TestimonialService } from './testimonial.service';
export { SubscribeService, FollowService } from './subscribe.service';
export { SubscriptionPlansService } from './subscription-plans.service';
export { SubscriptionPlanCoursesService } from './subscription-plan-courses.service';
export { AppSubscriptionPlansService } from './app-subscription-plans.service';
export { PublicSubscriptionPlansService } from './public-subscription-plans.service';
export { NotificationsService } from './notifications.service';
export { CDKService } from './cdk.service';
export { UpdateLogService } from './update-log.service';
export { AdminDeviceSessionService } from './admin-device-session.service';
export { UserDeviceSessionService, type MySessionOverview } from './user-device-session.service';
export { ResourceService } from './resource.service';
export { AdminResourceService } from './admin-resource.service';
export { AdminExpressionService } from './admin-expression.service';
export { ExpressionsService, type ExpressionTypeDTO } from './expressions.service';
export { ReactionsService, type ReactionSummaryDTO, type ReactionUserDTO } from './reactions.service';
export { LikesService, type LikeStatusDTO } from './likes.service';
export { UserFollowsService } from './user-follows.service';
export { PublicCoursesService } from './public-courses.service';
export { PublicStatsService } from './public-stats.service';
export { apiClient, type ApiResponse } from './config';
export { UserSubscriptionService } from './user-subscription.service';
export { AdminAiNewsService } from './admin-ai-news.service';
export { AppAiNewsService } from './app-ai-news.service';
export { UserLearningService } from './user-learning.service';
export { InterviewQuestionsService } from './interview-questions.service';
export { AdminInterviewQuestionsService } from './admin-interview-questions.service';
export { UnreadService } from './unread.service';
export { AppUnreadService } from './app-unread.service';

// 导出类型定义
export type {
  LoginRequest,
  RegisterRequest,
  RegisterWithCodeRequest,
  BackendUser,
  LoginResponse,
} from './auth.service';

export type {
  UpdateProfileRequest,
  ChangePasswordRequest,
  UserDTO,
  CourseDTO,
  CreateCourseRequest,
  UpdateCourseRequest,
  CourseQueryRequest,
  CourseStatus,
  AdminPostQueryRequest,
  AdminPostDTO,
  ChapterDTO,
  CreateChapterRequest,
  UpdateChapterRequest,
  ChapterQueryRequest,
  AdminUserQueryRequest,
  AdminUserDTO,
  UpdateUserDeviceCountRequest,
  AdminTestimonialDTO,
  QueryTestimonialRequest,
  ChangeStatusRequest,
  TestimonialStatus,
  TestimonialDTO,
  CreateTestimonialRequest,
  UpdateTestimonialRequest,
  PublicTestimonialDTO,
  SubscriptionPlanDTO,
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
  SubscriptionPlanQueryRequest,
  SubscriptionPlanStatus,
  SimpleSubscriptionPlanDTO,
  SimpleCourseDTO,
  UpdateSubscriptionPlanCoursesRequest,
  CDKDTO,
  CreateCDKRequest,
  CDKQueryRequest,
  CDKType,
  CDKStatus,
  UpdateLogDTO,
  CreateUpdateLogRequest,
  UpdateUpdateLogRequest,
  AdminUpdateLogQueryRequest,
  ChangeDetailDTO,
  ChangeType,
  UpdateLogStatus,
  ActiveSessionDTO,
  UserSessionSummaryDTO,
  AdminDeviceSessionQueryRequest,
  TokenBlacklistStatsDTO,
  BlacklistQueryRequest,
  BlacklistedUserDTO,
  SystemConfigType,
  UserSessionLimitConfigData,
  // 表情管理
  AdminExpressionDTO,
  ExpressionQueryRequest,
  CreateExpressionRequest,
  UpdateExpressionRequest,
  ExpressionStatus,
  // 用户套餐回显相关类型
  UserSubscriptionDTO,
  SubscriptionStatus,
  // 资源管理
  ResourceDTO,
  ResourceQueryRequest,
  ResourceType,
  GetUploadCredentialsRequest,
  UploadCredentialsDTO,
  // AI 日报
  AdminDailyItemDTO,
  AdminDailyQueryRequest,
  IngestResult,
  DailyItemStatus,
  DailySource,
  // 前台 AI 日报
  TodayDailyDTO,
  HistoryOverviewDTO,
  HistoryDateDTO,
  DailyQueryRequest,
  FrontDailyItemDTO,
  // 学习进度
  ReportChapterProgressRequest,
  CourseProgressDTO,
  LearningRecordItemDTO,
  LearningRecordQueryRequest,
  // 面试题
  InterviewQuestionDTO,
  InterviewQuestionQueryRequest,
  CreateInterviewQuestionRequest,
  UpdateInterviewQuestionRequest,
  InterviewProblemStatus,
  UnreadSummaryDTO,
  UnreadChannel,
} from '@shared/types';
