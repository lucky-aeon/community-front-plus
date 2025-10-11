import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Trash2, Search, FileText, GraduationCap, Reply, Send, X, BookOpen, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MarkdownEditor, MarkdownEditorHandle } from '@shared/components/ui/MarkdownEditor';
import { ResourcePicker } from '@shared/components/business/ResourcePicker';
import { LoadingPage as LoadingSpinner } from '@shared/components/common/LoadingPage';
import { ConfirmDialog } from '@shared/components/common/ConfirmDialog';
import { CommentsService } from '@shared/services/api/comments.service';
import { ChaptersService } from '@shared/services/api';
import { CommentDTO, PageResponse, BusinessType } from '@shared/types';
import { showToast } from '@shared/utils/toast';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { routeUtils } from '@shared/routes/routes';

export const MyCommentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [pageInfo, setPageInfo] = useState<PageResponse<CommentDTO> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; commentId: string | null }>({ isOpen: false, commentId: null });
  // 展示维度：我发表的 | 回复我的 | 全部
  const [activeTab, setActiveTab] = useState<'mine' | 'toMe' | 'all'>('all');

  // 回复相关状态
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [showResourcePicker, setShowResourcePicker] = useState(false);
  const replyEditorRef = useRef<MarkdownEditorHandle>(null);

  // 获取当前用户信息
  const { user } = useAuth();

  // 获取评论列表
  const fetchComments = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await CommentsService.getUserRelatedComments({
        pageNum: page,
        pageSize: 10
      });
      setPageInfo(response);
      setComments(response.records);
    } catch (error) {
      console.error('获取评论列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 删除评论
  const handleDeleteComment = async (commentId: string) => {
    try {
      await CommentsService.deleteComment(commentId);
      
      // 直接从本地状态中移除删除的评论，避免重新请求接口
      setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
      
      // 同时更新总数
      if (pageInfo) {
        setPageInfo(prevPageInfo => ({
          ...prevPageInfo!,
          total: prevPageInfo!.total - 1
        }));
      }
      
    } catch (error) {
      console.error('删除评论失败:', error);
    }
  };

  // 开始回复评论
  const handleStartReply = (commentId: string) => {
    setReplyingCommentId(commentId);
    setReplyContent('');
  };

  // 取消回复
  const handleCancelReply = () => {
    setReplyingCommentId(null);
    setReplyContent('');
  };

  // 提交回复
  const handleSubmitReply = async (comment: CommentDTO) => {
    if (!replyContent.trim()) {
      showToast.warning('请输入回复内容');
      return;
    }

    if (!user) {
      showToast.error('请先登录');
      return;
    }

    try {
      setReplySubmitting(true);
      await CommentsService.replyComment(comment.id, {
        content: replyContent.trim(),
        parentCommentId: comment.id,
        businessId: comment.businessId,
        businessType: comment.businessType,
        replyUserId: comment.commentUserId
      });

      // 重置回复状态
      setReplyingCommentId(null);
      setReplyContent('');
      
      // 刷新评论列表
      fetchComments(currentPage);
    } catch (error) {
      console.error('回复评论失败:', error);
    } finally {
      setReplySubmitting(false);
    }
  };

  // 初始化和页面变化时获取数据
  useEffect(() => {
    fetchComments(currentPage);
  }, [currentPage]);

  // ESC键取消回复
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && replyingCommentId) {
        handleCancelReply();
      }
    };

    if (replyingCommentId) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [replyingCommentId]);

  // 搜索过滤处理
  const isMine = (c: CommentDTO) => Boolean(user && c.commentUserId === user.id);
  const isReplyToMe = (c: CommentDTO) => Boolean(user && c.replyUserId === user.id && c.commentUserId !== user.id);

  const mineComments = comments.filter(isMine);
  const toMeComments = comments.filter(isReplyToMe);

  const byTab = (list: CommentDTO[]) =>
    list.filter(comment => searchTerm === '' || comment.content.toLowerCase().includes(searchTerm.toLowerCase()));

  const filteredComments = byTab(
    activeTab === 'mine' ? mineComments : activeTab === 'toMe' ? toMeComments : comments
  );

  const getBusinessTypeBadge = (businessType: BusinessType) => {
    switch (businessType) {
      case 'POST':
        return (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <FileText className="h-3 w-3" />
            <span>文章</span>
          </Badge>
        );
      case 'COURSE':
        return (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <GraduationCap className="h-3 w-3" />
            <span>课程</span>
          </Badge>
        );
      case 'CHAPTER':
        return (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <BookOpen className="h-3 w-3" />
            <span>章节</span>
          </Badge>
        );
      default:
        return <Badge variant="secondary">未知</Badge>;
    }
  };

  const getBusinessIcon = (businessType: BusinessType) => {
    switch (businessType) {
      case 'POST':
        return <FileText className="h-3 w-3" />;
      case 'COURSE':
        return <GraduationCap className="h-3 w-3" />;
      case 'CHAPTER':
        return <BookOpen className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const openBusinessTarget = async (c: CommentDTO) => {
    try {
      if (c.businessType === 'POST') {
        navigate(routeUtils.getPostDetailRoute(c.businessId));
        return;
      }
      if (c.businessType === 'COURSE') {
        navigate(routeUtils.getCourseDetailRoute(c.businessId));
        return;
      }
      if (c.businessType === 'CHAPTER') {
        const detail = await ChaptersService.getFrontChapterDetail(c.businessId);
        navigate(`/dashboard/courses/${detail.courseId}/chapters/${c.businessId}`);
      }
    } catch (e) {
      console.error('跳转目标打开失败：', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">我的评论</h1>
          <p className="text-gray-600 mt-1">管理你发布的评论与收到的回复</p>
        </div>
        <div className="text-sm text-gray-500 space-x-3">
          {pageInfo && <span>共 {pageInfo.total} 条</span>}
          <span>当前页我发表 {mineComments.length} 条</span>
          <span>当前页回复我的 {toMeComments.length} 条</span>
        </div>
      </div>

      {/* 过滤与搜索 */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex rounded-lg overflow-hidden border border-gray-200 w-full md:w-auto">
            <button
              type="button"
              className={`px-4 py-2 text-sm ${activeTab === 'mine' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('mine')}
            >
              我发表的
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm border-l border-gray-200 ${activeTab === 'toMe' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('toMe')}
            >
              回复我的
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm border-l border-gray-200 ${activeTab === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('all')}
            >
              全部
            </button>
          </div>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="搜索评论内容..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </Card>

      {/* 评论列表 */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredComments.length === 0 ? (
        <Card className="p-12 text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchTerm ? '没有找到匹配的评论' : '暂无评论'}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            {searchTerm ? '尝试调整搜索条件' : '参与讨论，发表你的第一条评论吧！'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredComments.map((comment) => (
            <Card 
              key={comment.id} 
              className="p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group"
              role="button"
              tabIndex={0}
              onClick={() => openBusinessTarget(comment)}
              onKeyDown={(e) => { if (e.key === 'Enter') openBusinessTarget(comment); }}
            >
              <div className="space-y-4">
                {/* 评论头部信息 */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {getBusinessTypeBadge(comment.businessType)}
                    <span className="text-sm text-gray-500">
                      {new Date(comment.createTime).toLocaleString('zh-CN')}
                    </span>
                    {/* 来源标记：我发表 / 回复我的 */}
                    {isMine(comment) && (
                      <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">我发表</Badge>
                    )}
                    {isReplyToMe(comment) && (
                      <Badge variant="secondary" className="text-blue-700 bg-blue-50 border-blue-200">回复我的</Badge>
                    )}
                    {comment.businessName && (
                      <button
                        type="button"
                        onClick={() => openBusinessTarget(comment)}
                        className="inline-flex items-center gap-1 max-w-[220px] px-2 py-1 rounded-full border border-honey-border bg-honey-50 text-honey-700 hover:bg-honey-100"
                        title={comment.businessName}
                      >
                        {getBusinessIcon(comment.businessType)}
                        <span className="text-xs font-medium truncate">{comment.businessName}</span>
                      </button>
                    )}
                    {/* 无业务名称时也提供跳转 */}
                    {!comment.businessName && (
                      <button
                        type="button"
                        onClick={() => openBusinessTarget(comment)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        前往内容
                      </button>
                    )}
                  </div>
                  <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                    {/* 更明显的跳转入口 */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); openBusinessTarget(comment); }}
                      className="hidden sm:inline-flex items-center space-x-1 text-honey-700 hover:text-honey-800 hover:bg-honey-50 border-honey-200"
                    >
                      <span>查看内容</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    {CommentsService.canDeleteComment(comment, user?.id) && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ isOpen: true, commentId: comment.id }); }}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>删除</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* 评论内容 */}
                <div className="prose-content" onClick={(e) => e.stopPropagation()}>
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

                {/* 评论统计信息 */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <span>{comment.likeCount || 0} 点赞</span>
                    <span>{comment.replyCount || 0} 回复</span>
                    {comment.replyUserName && isMine(comment) && (
                      <span className="text-blue-600">你 回复 @{comment.replyUserName}</span>
                    )}
                    {isReplyToMe(comment) && (
                      <span className="text-orange-600">{comment.commentUserName} 回复了你</span>
                    )}
                  </div>
                  
                  {/* 回复按钮 */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); handleStartReply(comment.id); }}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                  >
                    <Reply className="h-4 w-4" />
                    <span>回复</span>
                  </Button>
                </div>

                {/* 回复编辑器区域 */}
                {replyingCommentId === comment.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200" onClick={(e) => e.stopPropagation()}>
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        回复 @{comment.commentUserName}
                      </h4>
                      <MarkdownEditor
                        ref={replyEditorRef}
                        value={replyContent}
                        onChange={setReplyContent}
                        height={200}
                        placeholder="请输入你的回复内容..."
                        toolbar={true}
                        className="!border-gray-300"
                        enableFullscreen={false}
                        enableToc={false}
                        onOpenResourcePicker={() => setShowResourcePicker(true)}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelReply}
                        className="flex items-center space-x-1"
                      >
                        <X className="h-4 w-4" />
                        <span>取消</span>
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSubmitReply(comment)}
                        disabled={replySubmitting || !replyContent.trim()}
                        className="flex items-center space-x-1"
                      >
                        {replySubmitting ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                        <span>{replySubmitting ? '发送中...' : '发送回复'}</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 分页 */}
      {pageInfo && pageInfo.pages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <Button 
              variant="neutral" 
              size="sm" 
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              上一页
            </Button>
            {Array.from({ length: Math.min(5, pageInfo.pages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button 
                  key={page}
                  variant={currentPage === page ? 'primary' : 'neutral'} 
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              );
            })}
            <Button 
              variant="neutral" 
              size="sm" 
              disabled={currentPage >= pageInfo.pages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      )}

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onCancel={() => setDeleteConfirm({ isOpen: false, commentId: null })}
        onConfirm={() => {
          if (deleteConfirm.commentId) {
            handleDeleteComment(deleteConfirm.commentId);
            setDeleteConfirm({ isOpen: false, commentId: null });
          }
        }}
        title="确认删除评论"
        message="删除后评论将无法恢复，您确定要继续吗？"
        confirmText="确认删除"
        cancelText="取消"
        variant="danger"
      />
      <ResourcePicker
        open={showResourcePicker}
        onClose={() => setShowResourcePicker(false)}
        onInsert={(snippet) => {
          replyEditorRef.current?.insertMarkdown(snippet);
          setShowResourcePicker(false);
        }}
      />
    </div>
  );
};
