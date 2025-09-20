import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MarkdownEditor } from '@shared/components/ui/MarkdownEditor';
import { CommentsService } from '@shared/services/api/comments.service';
import type { CommentDTO, BusinessType, PageResponse } from '@shared/types';
import { useAuth } from '@/context/AuthContext';

export interface CommentsProps {
  businessId: string;
  businessType: BusinessType; // 'POST' | 'COURSE'
  authorId?: string; // 用于标注楼主
  onCountChange?: (count: number) => void;
  pageSize?: number;
}

export const Comments: React.FC<CommentsProps> = ({
  businessId,
  businessType,
  authorId,
  onCountChange,
  pageSize = 50,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<CommentDTO[]>([]);
  const [content, setContent] = useState('');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const initials = (name?: string) => (name?.charAt(0).toUpperCase() || 'U');

  const load = async () => {
    try {
      setLoading(true);
      const res: PageResponse<CommentDTO> = await CommentsService.getBusinessComments({
        businessId,
        businessType,
        pageNum: 1,
        pageSize,
      });
      setList(res.records);
      onCountChange?.(res.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [businessId, businessType]);

  const submitCreate = async () => {
    if (!user || !content.trim()) return;
    try {
      await CommentsService.createComment({ businessId, businessType, content: content.trim() });
      setContent('');
      await load();
    } catch {}
  };

  const submitReply = async (comment: CommentDTO) => {
    const draft = replyDrafts[comment.id]?.trim();
    if (!user || !draft) return;
    try {
      await CommentsService.replyComment(comment.id, {
        businessId,
        businessType,
        parentCommentId: comment.id,
        replyUserId: comment.commentUserId,
        content: draft,
      });
      setReplyDrafts((m) => ({ ...m, [comment.id]: '' }));
      setReplyingTo(null);
      await load();
    } catch {}
  };

  const removeComment = async (commentId: string) => {
    try {
      await CommentsService.deleteComment(commentId);
      await load();
    } catch {}
  };

  return (
    <Card className="p-4 md:p-6 space-y-4">
      {/* 新建评论 */}
      {user && (
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>{initials(user?.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <MarkdownEditor value={content} onChange={setContent} height={180} />
            <div className="flex justify-end">
              <Button size="sm" onClick={submitCreate} disabled={loading || !content.trim()}>发表评论</Button>
            </div>
          </div>
        </div>
      )}

      {/* 列表 */}
      <div className="space-y-3">
        {list.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-8">暂无评论</div>
        ) : (
          list.map((c, idx) => (
            <div key={c.id} className={`pb-4 ${idx !== list.length - 1 ? 'border-b' : ''}`}>
              <div className="flex items-start gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={c.commentUserAvatar} />
                  <AvatarFallback>{initials(c.commentUserName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-medium truncate">{c.commentUserName}</span>
                    {authorId && c.commentUserId === authorId && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">楼主</Badge>
                    )}
                    {c.replyUserName && (
                      <span className="text-blue-600">@{c.replyUserName}</span>
                    )}
                    <span className="text-muted-foreground">· {CommentsService.formatCommentTime(c.createTime)}</span>
                  </div>
                  {/* 内容：仅正文 Markdown 渲染 */}
                  <div className="mt-2 prose-content">
                    <MarkdownEditor
                      value={c.content}
                      onChange={() => {}}
                      previewOnly
                      height="auto"
                      toolbar={false}
                      enableFullscreen={false}
                      enableToc={false}
                      className="!border-none !shadow-none !bg-transparent"
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    {user && (
                      <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}>回复</Button>
                    )}
                    {user?.id && CommentsService.canDeleteComment(c, user.id) && (
                      <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => removeComment(c.id)}>删除</Button>
                    )}
                  </div>
                  {replyingTo === c.id && (
                    <div className="mt-3 space-y-2">
                      <MarkdownEditor value={replyDrafts[c.id] || ''} onChange={(v) => setReplyDrafts((m) => ({ ...m, [c.id]: v }))} height={160} />
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setReplyingTo(null)}>取消</Button>
                        <Button size="sm" onClick={() => submitReply(c)} disabled={!replyDrafts[c.id]?.trim()}>回复</Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default Comments;
