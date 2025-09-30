import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MarkdownEditor, MarkdownEditorHandle } from '@shared/components/ui/MarkdownEditor';
import { ResourcePicker } from '@shared/components/business/ResourcePicker';
import { LoadingPage as LoadingSpinner } from '@shared/components/common/LoadingPage';
import { ConfirmDialog } from '@shared/components/common/ConfirmDialog';
import { CommentsService } from '@shared/services/api';
import { CommentDTO, User, BusinessType } from '@shared/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LikeButton } from '@shared/components/ui/LikeButton';

interface CommentsSectionProps {
  businessId: string;
  businessType: BusinessType;
  currentUser: User | null;
  authorId?: string; // 文章/内容作者ID，用于显示楼主标识
  onCommentCountChange?: (count: number) => void;
  className?: string;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  businessId,
  businessType,
  currentUser,
  authorId,
  onCommentCountChange,
  className = ''
}) => {
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [showResourcePicker, setShowResourcePicker] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'new' | 'reply' | null>(null);
  const newEditorRef = useRef<MarkdownEditorHandle>(null);
  const replyEditorRef = useRef<MarkdownEditorHandle>(null);

  // 获取评论列表
  const fetchComments = async (page = 1, append = false) => {
    try {
      setLoading(!append);
      const response = await CommentsService.getBusinessComments({
        businessId,
        businessType,
        pageNum: page,
        pageSize: 10
      });
      
      const newComments = response.records || [];
      
      if (append) {
        setComments(prev => [...prev, ...newComments]);
      } else {
        setComments(newComments);
      }
      
      setTotalComments(response.total || 0);
      setCurrentPage(page);
      setHasMore((response.current || 1) < (response.pages || 1));
      
      // 通知父组件评论数量变化
      if (onCommentCountChange) {
        onCommentCountChange(response.total || 0);
      }
    } catch (error) {
      console.error('获取评论列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 组件加载时获取评论
  useEffect(() => {
    fetchComments();
  }, [businessId, businessType]);

  const formatDate = (dateString: string) => {
    return CommentsService.formatCommentTime(dateString);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || submitting) return;
    
    try {
      setSubmitting(true);
      await CommentsService.createComment({
        businessId,
        businessType,
        content: newComment.trim()
      });
      
      setNewComment('');
      // 重新获取第一页评论
      fetchComments(1);
    } catch (error) {
      console.error('发布评论失败:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (commentId: string) => {
    if (!replyContent.trim() || submitting) return;
    
    const parentComment = comments.find(c => c.id === commentId);
    if (!parentComment) return;
    
    try {
      setSubmitting(true);
      await CommentsService.replyComment(commentId, {
        parentCommentId: commentId,
        businessId,
        businessType,
        content: replyContent.trim(),
        replyUserId: parentComment.commentUserId
      });
      
      setReplyContent('');
      setReplyingTo(null);
      // 重新获取第一页评论
      fetchComments(1);
    } catch (error) {
      console.error('发布回复失败:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setCommentToDelete(commentId);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;
    
    try {
      setDeleting(commentToDelete);
      await CommentsService.deleteComment(commentToDelete);
      // 重新获取当前页评论
      fetchComments(currentPage);
    } catch (error) {
      console.error('删除评论失败:', error);
    } finally {
      setDeleting(null);
      setCommentToDelete(null);
    }
  };

  const handleLoadMore = () => {
    if (!hasMore || loading) return;
    fetchComments(currentPage + 1, true);
  };

  return (
    <Card className={`p-6 ${className}`}>
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        评论 ({totalComments})
      </h2>

      {/* 添加评论 */}
      {currentUser ? (
        <div className="mb-8">
          <div className="flex items-start space-x-4">
            <img
              src={currentUser.avatar || `https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop`}
              alt={currentUser.name}
              className="h-10 w-10 rounded-full object-cover flex-shrink-0 mt-1"
            />
            <div className="flex-1">
              <div className="mb-3">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-medium text-gray-900">{currentUser.name}</h4>
                </div>
                <MarkdownEditor
                  ref={newEditorRef}
                  value={newComment}
                  onChange={setNewComment}
                  height={200}
                  placeholder="写下您的评论... 支持 Markdown 语法"
                  className="border rounded-xl"
                  enableFullscreen={false}
                  enableToc={false}
                  onOpenResourcePicker={() => { setPickerTarget('new'); setShowResourcePicker(true); }}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || submitting}
                  size="sm"
                  className="ml-4"
                >
                  {submitting ? '发布中...' : '发布评论'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-6 text-center bg-gray-50 rounded-xl">
          <MessageSquare className="h-8 w-8 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-600 mb-4">登录后即可参与评论讨论</p>
          <Button variant="outline" size="sm">
            登录参与讨论
          </Button>
        </div>
      )}

      {/* 评论列表 */}
      {loading && comments.length === 0 ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-100 pb-6 last:border-b-0">
              <div className="flex items-start space-x-4">
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={comment.commentUserAvatar || undefined} alt={comment.commentUserName} />
                  <AvatarFallback>{(comment.commentUserName || 'U').slice(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{comment.commentUserName}</h4>
                      {/* 楼主标识：必须使用authorId进行比较 */}
                      {authorId && comment.commentUserId === authorId && (
                        <Badge variant="primary" className="text-xs px-2 py-0.5">
                          楼主
                        </Badge>
                      )}
                      {comment.replyUserName && (
                        <span className="text-sm text-blue-600">
                          回复 @{comment.replyUserName}
                          {authorId && comment.replyUserId === authorId && (
                            <Badge variant="primary" className="text-xs px-1 py-0.5 ml-1">
                              楼主
                            </Badge>
                          )}
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        {formatDate(comment.createTime)}
                      </span>
                    </div>
                    
                    {/* 删除按钮（仅评论作者可见） */}
                    {CommentsService.canDeleteComment(comment, currentUser?.id) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deleting === comment.id}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        {deleting === comment.id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>

                  {/* 评论内容 - 使用 MarkdownEditor 预览模式显示 */}
                  <div className="mb-3 prose-content">
                    <MarkdownEditor
                      value={comment.content}
                      onChange={() => {}} // 只读模式
                      previewOnly={true}
                      height="auto"
                      toolbar={false}
                      className="!border-none !shadow-none !bg-transparent"
                      enableFullscreen={false}
                      enableToc={false}
                    />
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center space-x-4">
                    <LikeButton
                      businessType="COMMENT"
                      businessId={comment.id}
                      initialLiked={comment.isLiked}
                      initialCount={comment.likeCount || 0}
                      onChange={(s) => setComments(prev => prev.map(c => c.id === comment.id ? { ...c, likeCount: s.likeCount, isLiked: s.liked } : c))}
                    />
                    
                    {currentUser && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="text-gray-500 hover:text-blue-500"
                        disabled={submitting}
                      >
                        {replyingTo === comment.id ? '取消回复' : '回复'}
                      </Button>
                    )}
                  </div>

                  {/* 回复框 */}
                  {replyingTo === comment.id && currentUser && (
                    <div className="mt-4 ml-4 pl-4 border-l-2 border-gray-200">
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                          <AvatarImage src={currentUser.avatar || undefined} alt={currentUser.name} />
                          <AvatarFallback>{(currentUser.name || 'U').slice(0, 1).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="mb-2">
                            <div className="text-sm text-gray-600 mb-2">
                              回复 <span className="font-medium text-blue-600">@{comment.commentUserName}</span>：
                            </div>
                            <MarkdownEditor
                              ref={replyEditorRef}
                              value={replyContent}
                              onChange={setReplyContent}
                              height={150}
                              placeholder={`回复 @${comment.commentUserName}...`}
                              className="border rounded-lg"
                              enableFullscreen={false}
                              enableToc={false}
                              onOpenResourcePicker={() => { setPickerTarget('reply'); setShowResourcePicker(true); }}
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyContent('');
                              }}
                              disabled={submitting}
                            >
                              取消
                            </Button>
                            <Button
                              onClick={() => handleSubmitReply(comment.id)}
                              disabled={!replyContent.trim() || submitting}
                              size="sm"
                            >
                              {submitting ? '回复中...' : '回复'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 加载更多按钮 */}
      {hasMore && (
        <div className="text-center py-6">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                加载中...
              </>
            ) : (
              '加载更多评论'
            )}
          </Button>
        </div>
      )}

      {/* 空状态 */}
      {!loading && comments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无评论</h3>
          <p className="text-sm">
            {currentUser ? '成为第一个发表评论的人吧！' : '登录后发表第一个评论'}
          </p>
        </div>
      )}
      
      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="删除评论"
        message="确定要删除这条评论吗？删除后不可恢复。"
        confirmText="删除"
        cancelText="取消"
        variant="danger"
        onConfirm={confirmDeleteComment}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setCommentToDelete(null);
        }}
      />
      <ResourcePicker
        open={showResourcePicker}
        onClose={() => { setShowResourcePicker(false); setPickerTarget(null); }}
        onInsert={(snippet) => {
          if (pickerTarget === 'new') newEditorRef.current?.insertMarkdown(snippet);
          if (pickerTarget === 'reply') replyEditorRef.current?.insertMarkdown(snippet);
          setShowResourcePicker(false);
          setPickerTarget(null);
        }}
      />
    </Card>
  );
};
