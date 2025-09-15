import React, { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Search, FileText, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@shared/components/ui/Card';
import { Button } from '@shared/components/ui/Button';
import { Badge } from '@shared/components/ui/Badge';
import { MarkdownEditor } from '@shared/components/ui/MarkdownEditor';
import { LoadingSpinner } from '@shared/components/ui/LoadingSpinner';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { CommentsService } from '@shared/services/api/comments.service';
import { CommentDTO, PageResponse, BusinessType } from '@shared/types';
import { showToast } from '@shared/components/ui/Toast';

interface MyCommentsPageProps {
  onCommentClick?: (commentId: string) => void;
}

export const MyCommentsPage: React.FC<MyCommentsPageProps> = ({ onCommentClick }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [pageInfo, setPageInfo] = useState<PageResponse<CommentDTO> | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; commentId: string | null }>({ isOpen: false, commentId: null });

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
      showToast.error('获取评论列表失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 删除评论
  const handleDeleteComment = async (commentId: string) => {
    try {
      await CommentsService.deleteComment(commentId);
      showToast.success('🗑️ 评论已删除');
      fetchComments(currentPage);
    } catch (error) {
      console.error('删除评论失败:', error);
      showToast.error('删除失败，请稍后再试');
    }
  };

  // 初始化和页面变化时获取数据
  useEffect(() => {
    fetchComments(currentPage);
  }, [currentPage]);

  // 搜索过滤处理
  const filteredComments = comments.filter(comment => 
    searchTerm === '' || comment.content.toLowerCase().includes(searchTerm.toLowerCase())
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
      default:
        return <Badge variant="secondary">未知</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">我的评论</h1>
          <p className="text-gray-600 mt-1">管理你发布的所有评论内容</p>
        </div>
        <div className="text-sm text-gray-500">
          {pageInfo && (
            <span>共 {pageInfo.total} 条评论</span>
          )}
        </div>
      </div>

      {/* 搜索功能 */}
      <Card className="p-4">
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
              className="p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="space-y-4">
                {/* 评论头部信息 */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {getBusinessTypeBadge(comment.businessType)}
                    <span className="text-sm text-gray-500">
                      {new Date(comment.createTime).toLocaleString('zh-CN')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setDeleteConfirm({ isOpen: true, commentId: comment.id })}
                      className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>删除</span>
                    </Button>
                  </div>
                </div>

                {/* 评论内容 */}
                <div className="prose-content">
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
                <div className="flex items-center space-x-6 text-sm text-gray-500 pt-2 border-t border-gray-100">
                  <span>{comment.likeCount || 0} 点赞</span>
                  <span>{comment.replyCount || 0} 回复</span>
                  {comment.replyUserName && (
                    <span className="text-blue-600">
                      回复 @{comment.replyUserName}
                    </span>
                  )}
                </div>
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
                  useCustomTheme={currentPage === page}
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
    </div>
  );
};