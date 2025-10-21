import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MessageSquare, Send, Loader2, Trash2, CornerDownRight, LogIn, FileText, BookOpen, Book, Clock, ChevronRight, AtSign, ListChecks } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
// 移除三点菜单，直接铺开操作按钮
import { Separator } from '@/components/ui/separator';
import { cn } from '@shared/utils/cn';
import { useAuth } from '@/context/AuthContext';
import { CommentsService, ChaptersService } from '@shared/services/api';
import { PostsService } from '@shared/services/api/posts.service';
import type { BusinessType, CommentDTO, PageResponse, LatestCommentDTO } from '@shared/types';
import { AuthModal } from '@shared/components/business/AuthModal';
import { MarkdownEditor, MarkdownEditorHandle } from '@shared/components/ui/MarkdownEditor';
import { ResourcePicker } from '@shared/components/business/ResourcePicker';
import { ReactionBar } from '@shared/components/ui/ReactionBar';
import { LikeButton } from '@shared/components/ui/LikeButton';
import { FavoriteButton } from '@shared/components/business/FavoriteButton';
import { useNavigate } from 'react-router-dom';
import { routeUtils } from '@shared/routes/routes';

export interface CommentsProps {
  businessId: string;
  businessType: BusinessType;
  authorId?: string;
  pageSize?: number;
  className?: string;
  onCountChange?: (count: number) => void;
  mode?: 'thread' | 'latest';
  // 是否问答类型（用于展示采纳/撤销操作）
  isQA?: boolean;
  // 采纳/撤销成功时回传给父组件（用于同步文章状态）
  onQAResolveChange?: (payload: { action: 'accept' | 'revoke'; commentId: string; resolveStatus?: 'UNSOLVED' | 'SOLVED'; solvedAt?: string }) => void;
}

/**
 * 新版评论组件（shadcn 组合）
 * - 仅使用项目内 shadcn 风格基础组件（Button/Card/Avatar/DropdownMenu 等）
 * - 支持发布评论、回复、删除、分页加载更多
 * - 使用 Markdown 组件渲染评论内容
 */
export const Comments: React.FC<CommentsProps> = ({
  businessId,
  businessType,
  authorId,
  pageSize = 10,
  className,
  onCountChange,
  mode = 'thread',
  isQA = false,
  onQAResolveChange,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  const [flatComments, setFlatComments] = useState<CommentDTO[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [loading, setLoading] = useState(false);

  const [latestComments, setLatestComments] = useState<LatestCommentDTO[]>([]);
  const [loadingLatest, setLoadingLatest] = useState(false);

  const [newContent, setNewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [replying, setReplying] = useState<Record<string, boolean>>({});
  const [openReply, setOpenReply] = useState<Record<string, boolean>>({});
  const [accepting, setAccepting] = useState<Record<string, boolean>>({});
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);

  // 资源库弹窗与编辑器引用
  const [showResourcePicker, setShowResourcePicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<string | null>(null); // 'new' 或 commentId
  const newEditorRef = useRef<MarkdownEditorHandle>(null);
  const replyEditorRefs = useRef<Record<string, MarkdownEditorHandle | null>>({});
  const scrollAttempted = useRef(false);

  const hasMore = flatComments.length < total;

  const loadComments = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      const nextPage = reset ? 1 : pageNum;
      const resp: PageResponse<CommentDTO> = await CommentsService.getBusinessComments({
        businessId,
        businessType,
        pageNum: nextPage,
        pageSize,
      });
      setTotal(resp.total);
      setFlatComments(prev => {
        const base = reset ? [] : prev;
        const merged = [...base, ...resp.records];
        // 去重（按 id）
        const map = new Map(merged.map(c => [c.id, c] as const));
        return Array.from(map.values());
      });
      if (!reset) {
        setPageNum(nextPage + 1);
      } else {
        setPageNum(2);
      }
      onCountChange?.(resp.total);
    } catch (e: unknown) {
      console.error('加载评论失败', e);
    } finally {
      setLoading(false);
    }
  }, [businessId, businessType, pageNum, pageSize, onCountChange]);

  useEffect(() => {
    if (mode === 'thread') {
      // 业务对象变更时重载
      setFlatComments([]);
      setTotal(0);
      setPageNum(1);
      void loadComments(true);
    }
  }, [businessId, businessType, mode]);

  useEffect(() => {
    if (mode === 'latest') {
      const run = async () => {
        try {
          setLoadingLatest(true);
          const data = await CommentsService.getLatestComments();
          setLatestComments(data);
        } catch (e: unknown) {
          console.error('加载最新评论失败', e);
        } finally {
          setLoadingLatest(false);
        }
      };
      run();
    }
  }, [mode]);

  // 监听 URL hash，自动滚动并高亮指定评论
  useEffect(() => {
    if (mode !== 'thread' || loading || scrollAttempted.current) return;

    const hash = window.location.hash;
    if (!hash.startsWith('#comment-')) return;

    const targetCommentId = hash.replace('#comment-', '');
    const targetComment = flatComments.find(c => c.id === targetCommentId);

    if (targetComment) {
      // 找到目标评论，滚动并高亮
      scrollAttempted.current = true;
      setTimeout(() => {
        const element = document.getElementById(`comment-${targetCommentId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setHighlightedCommentId(targetCommentId);
          // 3秒后移除高亮
          setTimeout(() => setHighlightedCommentId(null), 3000);
          // 清除 hash（可选）
          window.history.replaceState(null, '', window.location.pathname);
        }
      }, 300);
    } else if (hasMore && !loading) {
      // 目标评论不在当前页，加载更多
      void loadComments(false);
    }
  }, [flatComments, loading, hasMore, mode, loadComments]);

  const formatTime = CommentsService.formatCommentTime;

  const getBusinessTypeInfo = (bt: BusinessType) => {
    switch (bt) {
      case 'POST':
        return { label: '文章', Icon: FileText, badgeCls: 'bg-green-50 text-green-700 border-green-200', iconCls: 'text-green-600' };
      case 'COURSE':
        return { label: '课程', Icon: BookOpen, badgeCls: 'bg-blue-50 text-blue-700 border-blue-200', iconCls: 'text-blue-600' };
      case 'CHAPTER':
        return { label: '章节', Icon: Book, badgeCls: 'bg-purple-50 text-purple-700 border-purple-200', iconCls: 'text-purple-600' };
      case 'INTERVIEW_QUESTION':
        return { label: '题库', Icon: ListChecks, badgeCls: 'bg-amber-50 text-amber-700 border-amber-200', iconCls: 'text-amber-600' };
      default:
        return { label: '内容', Icon: FileText, badgeCls: 'bg-gray-50 text-gray-700 border-gray-200', iconCls: 'text-gray-600' };
    }
  };

  const jumpToCommentTarget = async (item: LatestCommentDTO) => {
    try {
      if (item.businessType === 'POST') {
        navigate(routeUtils.getPostDetailRoute(item.businessId) + `#comment-${item.id}`);
      } else if (item.businessType === 'COURSE') {
        navigate(routeUtils.getCourseDetailRoute(item.businessId) + `#comment-${item.id}`);
      } else if (item.businessType === 'CHAPTER') {
        const detail = await ChaptersService.getFrontChapterDetail(item.businessId);
        navigate(`/dashboard/courses/${detail.courseId}/chapters/${item.businessId}#comment-${item.id}`);
      }
    } catch {
      // fallback：至少跳到业务详情
      if (item.businessType === 'POST') navigate(routeUtils.getPostDetailRoute(item.businessId));
      if (item.businessType === 'COURSE') navigate(routeUtils.getCourseDetailRoute(item.businessId));
      if (item.businessType === 'CHAPTER') navigate(`/dashboard/chapters/${item.businessId}`);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    const content = newContent.trim();
    if (!content) return;
    try {
      setSubmitting(true);
      await CommentsService.createComment({ businessId, businessType, content });
      setNewContent('');
      // 直接刷新列表，保证与服务端一致（避免分页边界问题）
      await loadComments(true);
    } catch (e: unknown) {
      console.error('发布评论失败', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parent: CommentDTO) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    const content = (replyDraft[parent.id] || '').trim();
    if (!content) return;
    try {
      setReplying(prev => ({ ...prev, [parent.id]: true }));
      await CommentsService.replyComment(parent.id, {
        parentCommentId: parent.id,
        businessId,
        businessType,
        content,
        replyUserId: parent.commentUserId,
      });
      setReplyDraft(prev => ({ ...prev, [parent.id]: '' }));
      setOpenReply(prev => ({ ...prev, [parent.id]: false }));
      await loadComments(true);
    } catch (e: unknown) {
      console.error('回复失败', e);
    } finally {
      setReplying(prev => ({ ...prev, [parent.id]: false }));
    }
  };

  const handleDelete = async (comment: CommentDTO) => {
    try {
      await CommentsService.deleteComment(comment.id);
      setFlatComments(prev => prev.filter(c => c.id !== comment.id && c.parentCommentId !== comment.id));
      setTotal(prev => Math.max(0, prev - 1));
      onCountChange?.(Math.max(0, total - 1));
    } catch (e: unknown) {
      console.error('删除失败', e);
    }
  };

  const canDelete = (c: CommentDTO) => CommentsService.canDeleteComment(c, user?.id);

  const canAccept = (c: CommentDTO) => {
    // 仅文章业务、问答类型，且当前用户为作者
    if (!user || !authorId) return false;
    if (businessType !== 'POST') return false;
    if (!isQA) return false;
    return user.id === authorId;
  };

  const handleToggleAccept = async (c: CommentDTO) => {
    if (!canAccept(c)) return;
    try {
      setAccepting(prev => ({ ...prev, [c.id]: true }));
      const isAccepted = !!c.accepted;
      const resPost = isAccepted
        ? await PostsService.revokeAccepted(businessId, c.id)
        : await PostsService.acceptComment(businessId, c.id);
      // 更新本地评论的 accepted 状态
      setFlatComments(prev => prev.map(item => item.id === c.id ? { ...item, accepted: !isAccepted } : item));
      // 通知父组件同步文章解决状态
      onQAResolveChange?.({
        action: isAccepted ? 'revoke' : 'accept',
        commentId: c.id,
        resolveStatus: resPost.resolveStatus as any,
        solvedAt: resPost.solvedAt,
      });
    } catch (e) {
      console.error('切换采纳状态失败', e);
    } finally {
      setAccepting(prev => ({ ...prev, [c.id]: false }));
    }
  };

  const renderItem = (c: CommentDTO) => {
    const isAuthor = authorId && c.commentUserId === authorId;
    const isHighlighted = highlightedCommentId === c.id;
    return (
      <div
        key={c.id}
        id={`comment-${c.id}`}
        className={cn(
          'py-4 transition-all duration-500',
          isHighlighted && 'bg-yellow-50 border-l-4 border-yellow-400 pl-4 -ml-4'
        )}
      > 
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={c.commentUserAvatar || ''} alt={c.commentUserName} />
            <AvatarFallback>{c.commentUserName?.slice(0, 1) || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">{c.commentUserName}</span>
              {isAuthor && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-honey-100 text-honey-800 border border-honey-200">作者</span>
              )}
              {isQA && c.accepted && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">已采纳</span>
              )}
              <span className="text-xs text-gray-500">· {formatTime(c.createTime)}</span>
            </div>
            {c.replyUserName && (
              <div className="mt-1 text-xs flex items-center gap-1">
                <AtSign className="h-3 w-3 text-amber-600" />
                <span className="text-warm-gray-600">回复</span>
                <span className="text-amber-700 font-medium">@{c.replyUserName}</span>
              </div>
            )}
            <div className="mt-2 prose-content">
              <MarkdownEditor
                value={c.content}
                onChange={() => {}}
                previewOnly
                height="auto"
                toolbar={false}
                enableFullscreen={false}
                enableToc={false}
                className="!border-none !shadow-none !bg-transparent p-0"
              />
            </div>
            {/* 表情回复 */}
            <ReactionBar businessType={'COMMENT'} businessId={c.id} />
            <div className="mt-2 flex items-center gap-2">
              <LikeButton
                businessType="COMMENT"
                businessId={c.id}
                initialLiked={c.isLiked}
                initialCount={c.likeCount}
                onChange={(s) => setFlatComments(prev => prev.map(item => item.id === c.id ? { ...item, likeCount: s.likeCount, isLiked: s.liked } : item))}
              />
              <FavoriteButton
                targetId={c.id}
                targetType="COMMENT"
                variant="ghost"
                size="sm"
                showCount={false}
              />
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setOpenReply(prev => ({ ...prev, [c.id]: !prev[c.id] }))}>
                <CornerDownRight className="h-4 w-4 mr-1" /> 回复
              </Button>
              {canAccept(c) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => handleToggleAccept(c)}
                  disabled={accepting[c.id]}
                >
                  {c.accepted ? '撤销采纳' : '采纳此评论'}
                </Button>
              )}
              {canDelete(c) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-red-600 hover:text-red-700"
                  onClick={() => handleDelete(c)}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> 删除
                </Button>
              )}
            </div>
            {openReply[c.id] && (
              <div className="mt-2">
                <MarkdownEditor
                  ref={(inst) => { replyEditorRefs.current[c.id] = inst; }}
                  value={replyDraft[c.id] || ''}
                  onChange={(v) => setReplyDraft(prev => ({ ...prev, [c.id]: v }))}
                  height={160}
                  placeholder={`回复 @${c.commentUserName}（支持 Markdown）`}
                  toolbar
                  enableFullscreen={false}
                  enableToc={false}
                  className="!rounded-md"
                  onOpenResourcePicker={() => { setPickerTarget(c.id); setShowResourcePicker(true); }}
                />
                <div className="mt-2 flex justify-end">
                  <Button size="sm" onClick={() => handleReply(c)} disabled={replying[c.id] || !replyDraft[c.id]?.trim()}>
                    {replying[c.id] ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> 发送中</>) : (<><Send className="h-4 w-4 mr-2" /> 发送</>)}
                  </Button>
                </div>
              </div>
            )}
          </div>
          {/* 操作按钮直接展示，减少心智负担 */}
        </div>
      </div>
    );
  };

  if (mode === 'latest') {
    return (
      <Card className={cn('p-4', className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-600" />
            <h3 className="text-base font-semibold text-gray-900">最新评论</h3>
          </div>
          <Button variant="ghost" size="sm" className="p-1 h-auto text-purple-600 hover:text-purple-700 hover:bg-purple-50" onClick={() => navigate('/dashboard/discussions')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4 space-y-4">
          {loadingLatest && (
            <div className="py-8 text-center text-sm text-muted-foreground">加载中...</div>
          )}
          {!loadingLatest && latestComments.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">暂无评论</div>
          )}
          {!loadingLatest && latestComments.length > 0 && latestComments.map((item) => {
            const info = getBusinessTypeInfo(item.businessType);
            return (
              <div key={item.id} className="p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-purple-100" onClick={() => jumpToCommentTarget(item)}>
                <div className="flex items-start gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={item.commentUserAvatar || undefined} alt={item.commentUserName} />
                    <AvatarFallback>{(item.commentUserName || 'U').slice(0, 1).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-medium text-gray-900 truncate">{item.commentUserName}</span>
                        <span className="text-xs text-warm-gray-500 flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(item.createTime)}</span>
                      </div>
                      <span className={cn('text-xs px-2 py-0.5 rounded border', info.badgeCls)}>{info.label}</span>
                    </div>
                    {item.businessName && (
                      <div className="mt-1 text-xs flex items-center gap-1 text-warm-gray-600">
                        <info.Icon className={cn('h-3 w-3', info.iconCls)} />
                        <span className="truncate">{item.businessName}</span>
                      </div>
                    )}
                    {item.replyUserId && item.replyUserName && (
                      <div className="mt-1 text-xs flex items-center gap-1">
                        <AtSign className="h-3 w-3 text-amber-600" />
                        <span className="text-warm-gray-600">回复</span>
                        <span className="text-amber-700 font-medium">@{item.replyUserName}</span>
                      </div>
                    )}
                    <div className="mt-1 prose-content">
                      <MarkdownEditor
                        value={item.content}
                        onChange={() => {}}
                        previewOnly
                        height="auto"
                        toolbar={false}
                        enableFullscreen={false}
                        enableToc={false}
                        className="!border-none !shadow-none !bg-transparent p-0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-honey-600" />
          <h3 className="text-base font-semibold text-gray-900">评论</h3>
          <span className="text-sm text-gray-500">{total}</span>
        </div>
      </div>

      {/* 发表框 */}
      <div className="mt-4">
        {user ? (
          <div>
            <MarkdownEditor
              ref={newEditorRef}
              value={newContent}
              onChange={setNewContent}
              height={200}
              placeholder="友好评论，理性交流（支持 Markdown）"
              toolbar
              enableFullscreen={false}
              enableToc={false}
              className="!rounded-md"
              onOpenResourcePicker={() => { setPickerTarget('new'); setShowResourcePicker(true); }}
            />
            <div className="mt-2 flex justify-end">
              <Button onClick={handleSubmit} disabled={submitting || !newContent.trim()}>
                {submitting ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> 发布中</>) : (<><Send className="h-4 w-4 mr-2" /> 发布</>)}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
            <div className="text-sm text-gray-600">登录后参与评论</div>
            <Button variant="outline" size="sm" onClick={() => setAuthModalOpen(true)}>
              <LogIn className="h-4 w-4 mr-1" /> 登录
            </Button>
          </div>
        )}
      </div>

      <Separator className="my-4" />

      {/* 列表（扁平） */}
      <div className="divide-y">
        {flatComments.length === 0 && !loading && (
          <div className="py-10 text-center text-sm text-muted-foreground">暂无评论</div>
        )}
        {flatComments.map((c) => renderItem(c))}
      </div>

      {/* 加载更多 */}
      {hasMore && (
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={() => loadComments(false)} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : '加载更多'}
          </Button>
        </div>
      )}

      {/* 登录弹窗 */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
      {/* 资源库弹窗（用于新评论与各回复编辑器） */}
      <ResourcePicker
        open={showResourcePicker}
        onClose={() => { setShowResourcePicker(false); setPickerTarget(null); }}
        onInsert={(snippet) => {
          if (pickerTarget === 'new') {
            newEditorRef.current?.insertMarkdown(snippet);
          } else if (pickerTarget) {
            replyEditorRefs.current[pickerTarget]?.insertMarkdown(snippet);
          }
          setShowResourcePicker(false);
          setPickerTarget(null);
        }}
      />
    </Card>
  );
};

export default Comments;
