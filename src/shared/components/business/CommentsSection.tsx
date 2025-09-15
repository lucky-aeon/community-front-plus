import React, { useState } from 'react';
import { Heart, MessageSquare } from 'lucide-react';
import { Card } from '@shared/components/ui/Card';
import { Button } from '@shared/components/ui/Button';
import { Badge } from '@shared/components/ui/Badge';
import { MarkdownEditor } from '@shared/components/ui/MarkdownEditor';
import { Comment, User } from '@shared/types';

interface CommentsSectionProps {
  comments: Comment[];
  currentUser: User | null;
  postId: string;
  onSubmitComment?: (content: string) => void;
  onLikeComment?: (commentId: string) => void;
  onReplyComment?: (commentId: string, content: string) => void;
  className?: string;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  comments,
  currentUser,
  postId,
  onSubmitComment,
  onLikeComment,
  onReplyComment,
  className = ''
}) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMembershipColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'vip': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmitComment = () => {
    if (newComment.trim() && onSubmitComment) {
      onSubmitComment(newComment.trim());
      setNewComment('');
    }
  };

  const handleSubmitReply = (commentId: string) => {
    if (replyContent.trim() && onReplyComment) {
      onReplyComment(commentId, replyContent.trim());
      setReplyContent('');
      setReplyingTo(null);
    }
  };

  const handleLikeComment = (commentId: string) => {
    if (onLikeComment) {
      onLikeComment(commentId);
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        评论 ({comments.length})
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
                  value={newComment}
                  onChange={setNewComment}
                  height={200}
                  placeholder="写下您的评论... 支持 Markdown 语法"
                  className="border rounded-xl"
                  enableFullscreen={false}
                  enableToc={false}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim()}
                  size="sm"
                  className="ml-4"
                >
                  发布评论
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
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="border-b border-gray-100 pb-6 last:border-b-0">
            <div className="flex items-start space-x-4">
              <img
                src={comment.author.avatar}
                alt={comment.author.name}
                className="h-10 w-10 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-medium text-gray-900">{comment.author.name}</h4>
                  {comment.isAnswer && (
                    <Badge variant="success" size="sm">
                      最佳答案
                    </Badge>
                  )}
                  <span className="text-sm text-gray-500">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>

                {/* 评论内容 - 使用 MarkdownEditor 预览模式显示 */}
                <div className="mb-3">
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLikeComment(comment.id)}
                    className="flex items-center space-x-1 text-gray-500 hover:text-red-500"
                  >
                    <Heart className="h-4 w-4" />
                    <span>{comment.likes}</span>
                  </Button>
                  
                  {currentUser && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="text-gray-500 hover:text-blue-500"
                    >
                      {replyingTo === comment.id ? '取消回复' : '回复'}
                    </Button>
                  )}
                </div>

                {/* 回复框 */}
                {replyingTo === comment.id && currentUser && (
                  <div className="mt-4 ml-4 pl-4 border-l-2 border-gray-200">
                    <div className="flex items-start space-x-3">
                      <img
                        src={currentUser.avatar || `https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop`}
                        alt={currentUser.name}
                        className="h-8 w-8 rounded-full object-cover flex-shrink-0 mt-1"
                      />
                      <div className="flex-1">
                        <div className="mb-2">
                          <div className="text-sm text-gray-600 mb-2">
                            回复 <span className="font-medium text-blue-600">@{comment.author.name}</span>：
                          </div>
                          <MarkdownEditor
                            value={replyContent}
                            onChange={setReplyContent}
                            height={150}
                            placeholder={`回复 @${comment.author.name}...`}
                            className="border rounded-lg"
                            enableFullscreen={false}
                            enableToc={false}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReplyingTo(null)}
                          >
                            取消
                          </Button>
                          <Button
                            onClick={() => handleSubmitReply(comment.id)}
                            disabled={!replyContent.trim()}
                            size="sm"
                          >
                            回复
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

      {/* 空状态 */}
      {comments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无评论</h3>
          <p className="text-sm">
            {currentUser ? '成为第一个发表评论的人吧！' : '登录后发表第一个评论'}
          </p>
        </div>
      )}
    </Card>
  );
};