import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Star, Edit, Send, RefreshCw, CheckCircle, AlertCircle, XCircle, Eye, Info } from 'lucide-react';
import { TestimonialService } from '@shared/services/api/testimonial.service';
import { TestimonialDTO, CreateTestimonialRequest, UpdateTestimonialRequest } from '@shared/types';
import { showToast } from '@shared/utils/toast';

export const MyTestimonialPage: React.FC = () => {
  const [testimonial, setTestimonial] = useState<TestimonialDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // 表单状态
  const [formData, setFormData] = useState({
    content: '',
    rating: 0
  });

  // 对话框状态
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'create' | 'update';
    title: string;
    message: string;
  }>({
    open: false,
    type: 'create',
    title: '',
    message: ''
  });

  // 加载用户评价
  const loadMyTestimonial = useCallback(async () => {
    try {
      setLoading(true);
      const data = await TestimonialService.getMyTestimonial();
      setTestimonial(data);

      // 如果有评价数据且正在编辑，加载到表单
      if (data && isEditing) {
        setFormData({
          content: data.content,
          rating: data.rating
        });
      }
    } catch (error) {
      console.error('加载我的评价失败:', error);
      showToast.error('加载评价失败');
    } finally {
      setLoading(false);
    }
  }, [isEditing]);

  // 页面初始化加载
  useEffect(() => {
    loadMyTestimonial();
  }, [loadMyTestimonial]);

  // 重置表单
  const resetForm = () => {
    setFormData({
      content: '',
      rating: 0
    });
    setIsEditing(false);
  };

  // 处理星级评分点击
  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  // 处理内容变化
  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }));
  };

  // 验证表单
  const validateForm = (): { valid: boolean; message?: string } => {
    const contentValidation = TestimonialService.validateContent(formData.content);
    if (!contentValidation.valid) {
      return contentValidation;
    }

    const ratingValidation = TestimonialService.validateRating(formData.rating);
    if (!ratingValidation.valid) {
      return ratingValidation;
    }

    return { valid: true };
  };

  // 打开确认对话框
  const openConfirmDialog = (type: 'create' | 'update') => {
    const validation = validateForm();
    if (!validation.valid) {
      showToast.error(validation.message || '表单验证失败');
      return;
    }

    setConfirmDialog({
      open: true,
      type,
      title: type === 'create' ? '提交评价' : '更新评价',
      message: type === 'create'
        ? '确定要提交您的评价吗？提交后将进入审核流程。'
        : '确定要更新您的评价吗？更新后将重新进入审核流程。'
    });
  };

  // 提交评价
  const handleSubmitTestimonial = async () => {
    try {
      setSubmitting(true);

      const request: CreateTestimonialRequest = {
        content: formData.content.trim(),
        rating: formData.rating
      };

      const result = await TestimonialService.createTestimonial(request);
      setTestimonial(result);
      resetForm();
      setConfirmDialog({ open: false, type: 'create', title: '', message: '' });
      showToast.success('评价提交成功！正在等待审核');
    } catch (error) {
      console.error('提交评价失败:', error);
      showToast.error('提交评价失败');
    } finally {
      setSubmitting(false);
    }
  };

  // 更新评价
  const handleUpdateTestimonial = async () => {
    if (!testimonial) return;

    try {
      setSubmitting(true);

      const request: UpdateTestimonialRequest = {
        content: formData.content.trim(),
        rating: formData.rating
      };

      const result = await TestimonialService.updateMyTestimonial(testimonial.id, request);
      setTestimonial(result);
      resetForm();
      setConfirmDialog({ open: false, type: 'update', title: '', message: '' });
      showToast.success('评价更新成功！');
    } catch (error) {
      console.error('更新评价失败:', error);
      showToast.error('更新评价失败');
    } finally {
      setSubmitting(false);
    }
  };

  // 开始编辑
  const startEditing = () => {
    if (testimonial) {
      setFormData({
        content: testimonial.content,
        rating: testimonial.rating
      });
      setIsEditing(true);
    }
  };

  // 取消编辑
  const cancelEditing = () => {
    resetForm();
  };

  // 渲染星级评分（只读）
  const renderReadOnlyRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={`h-5 w-5 ${
              index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-muted-foreground">({rating} 分)</span>
      </div>
    );
  };

  // 渲染可交互星级评分
  const renderInteractiveRating = () => {
    return (
      <div className="space-y-2">
        <Label>评分 *</Label>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, index) => {
            const starValue = index + 1;
            return (
              <button
                key={index}
                type="button"
                onClick={() => handleRatingClick(starValue)}
                className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded"
              >
                <Star
                  className={`h-6 w-6 ${
                    index < formData.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300 hover:text-yellow-200'
                  }`}
                />
              </button>
            );
          })}
          {formData.rating > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">({formData.rating} 分)</span>
          )}
        </div>
      </div>
    );
  };

  // 渲染状态图标
  const renderStatusIcon = (status: string) => {
    const iconMap = {
      'PENDING': <AlertCircle className="h-5 w-5 text-orange-500" />,
      'APPROVED': <CheckCircle className="h-5 w-5 text-green-500" />,
      'REJECTED': <XCircle className="h-5 w-5 text-red-500" />,
      'PUBLISHED': <Eye className="h-5 w-5 text-blue-500" />
    };
    return iconMap[status as keyof typeof iconMap] || <Info className="h-5 w-5 text-gray-500" />;
  };

  // 渲染提交表单
  const renderSubmitForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          分享您的学习体验
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            您还没有提交过评价。请分享您在敲鸭社区的学习体验，您的评价将帮助其他学员更好地了解我们的课程。
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="content">评价内容 *</Label>
          <Textarea
            id="content"
            placeholder="请分享您的学习体验、收获或建议..."
            value={formData.content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="min-h-[150px] resize-none"
            maxLength={2000}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>请详细描述您的学习体验</span>
            <span className={formData.content.length > 1800 ? 'text-orange-500' : ''}>
              {formData.content.length}/2000
            </span>
          </div>
        </div>

        {renderInteractiveRating()}

        <div className="flex gap-3 pt-4">
          <Button
            onClick={() => openConfirmDialog('create')}
            disabled={!formData.content.trim() || formData.rating === 0 || submitting}
            className="flex-1"
          >
            {submitting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                提交中...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                提交评价
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // 渲染评价详情
  const renderTestimonialDetail = () => {
    if (!testimonial) return null;

    const isEditable = TestimonialService.isEditable(testimonial.status);
    const statusVariant = TestimonialService.getStatusVariant(testimonial.status);
    const statusDescription = TestimonialService.getStatusDescription(testimonial.status);
    const helpText = TestimonialService.getStatusHelpText(testimonial.status);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {renderStatusIcon(testimonial.status)}
              我的评价
            </span>
            <Badge variant={statusVariant}>
              {statusDescription}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {helpText && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>{helpText}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">评分</Label>
              <div className="mt-1">
                {renderReadOnlyRating(testimonial.rating)}
              </div>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">评价内容</Label>
              <div className="mt-2 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {testimonial.content}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">提交时间</Label>
                <p>{new Date(testimonial.createTime).toLocaleString('zh-CN')}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">更新时间</Label>
                <p>{new Date(testimonial.updateTime).toLocaleString('zh-CN')}</p>
              </div>
            </div>
          </div>

          {isEditable && !isEditing && (
            <div className="flex gap-3 pt-4">
              <Button onClick={startEditing} variant="outline" className="flex-1">
                <Edit className="mr-2 h-4 w-4" />
                编辑评价
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // 渲染编辑表单
  const renderEditForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit className="h-5 w-5" />
          编辑评价
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            您正在编辑评价内容。修改后将重新进入审核流程。
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="edit-content">评价内容 *</Label>
          <Textarea
            id="edit-content"
            placeholder="请分享您的学习体验、收获或建议..."
            value={formData.content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="min-h-[150px] resize-none"
            maxLength={2000}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>请详细描述您的学习体验</span>
            <span className={formData.content.length > 1800 ? 'text-orange-500' : ''}>
              {formData.content.length}/2000
            </span>
          </div>
        </div>

        {renderInteractiveRating()}

        <div className="flex gap-3 pt-4">
          <Button
            onClick={cancelEditing}
            variant="outline"
            disabled={submitting}
            className="flex-1"
          >
            取消
          </Button>
          <Button
            onClick={() => openConfirmDialog('update')}
            disabled={!formData.content.trim() || formData.rating === 0 || submitting}
            className="flex-1"
          >
            {submitting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                更新中...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                更新评价
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-8 w-24" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">我的评价</h1>
        <p className="text-muted-foreground mt-1">
          分享您在敲鸭社区的学习体验和收获
        </p>
      </div>

      {!testimonial && !isEditing && renderSubmitForm()}
      {testimonial && !isEditing && renderTestimonialDetail()}
      {isEditing && renderEditForm()}

      {/* 确认对话框 */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => {
        if (!submitting) {
          setConfirmDialog({ open, type: 'create', title: '', message: '' });
        }
      }}>
        <AlertDialogContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDialog.type === 'create' ? handleSubmitTestimonial : handleUpdateTestimonial}
              disabled={submitting}
            >
              {submitting ? '处理中...' : '确认'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};