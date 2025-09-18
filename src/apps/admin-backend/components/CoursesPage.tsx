import React, { useState, useCallback, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  BookOpen,
  Clock,
  Star,
  List,
  DollarSign
} from 'lucide-react';
import { Card } from '@shared/components/ui/Card';
import { Button } from '@shared/components/ui/Button';
import { Input } from '@shared/components/ui/Input';
import { Select } from '@shared/components/ui/Select';
import { Badge } from '@shared/components/ui/Badge';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { LoadingSpinner } from '@shared/components/ui/LoadingSpinner';
import { CoursesService } from '@shared/services/api';
import { CourseDTO, CourseQueryRequest, CourseStatus } from '@shared/types';
import { CourseModal } from './CourseModal';
import { ChaptersList } from './ChaptersList';

export const CoursesPage: React.FC = () => {
  // 状态管理
  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseDTO | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<CourseDTO | null>(null);
  
  // 章节管理状态
  const [chaptersListOpen, setChaptersListOpen] = useState(false);
  const [managingCourse, setManagingCourse] = useState<CourseDTO | null>(null);

  // 筛选和分页状态
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | CourseStatus>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  // 加载课程列表
  const loadCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: CourseQueryRequest = {
        pageNum: currentPage,
        pageSize,
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
        ...(searchTerm.trim() && { keyword: searchTerm.trim() })
      };

      const response = await CoursesService.getCoursesList(params);
      setCourses(response.records);
      setTotalPages(response.pages);
      setTotalCount(response.total);
    } catch (error) {
      console.error('加载课程列表失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, pageSize]);

  // 初始化加载
  useEffect(() => {
    loadCourses();
  }, [currentPage, statusFilter]);

  // 处理搜索
  const handleSearch = async () => {
    setCurrentPage(1); // 重置到第一页
    setIsLoading(true);
    try {
      const params: CourseQueryRequest = {
        pageNum: 1,
        pageSize,
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
        ...(searchTerm.trim() && { keyword: searchTerm.trim() })
      };

      const response = await CoursesService.getCoursesList(params);
      setCourses(response.records);
      setTotalPages(response.pages);
      setTotalCount(response.total);
    } catch (error) {
      console.error('搜索课程失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理创建课程
  const handleCreate = () => {
    setEditingCourse(null);
    setIsModalOpen(true);
  };

  // 处理编辑课程
  const handleEdit = (course: CourseDTO) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  // 处理删除课程
  const handleDelete = async (course: CourseDTO) => {
    setDeletingCourse(course);
  };

  // 处理管理章节
  const handleManageChapters = (course: CourseDTO) => {
    setManagingCourse(course);
    setChaptersListOpen(true);
  };

  // 确认删除
  const confirmDelete = async () => {
    if (!deletingCourse) return;

    try {
      await CoursesService.deleteCourse(deletingCourse.id);
      setDeletingCourse(null);
      loadCourses(); // 重新加载列表
    } catch (error) {
      console.error('删除课程失败:', error);
    }
  };

  // 渲染课程行
  const renderCourseRow = (course: CourseDTO) => {
    return (
      <React.Fragment key={course.id}>
        <tr className="hover:bg-gray-50 transition-colors">
          {/* 封面图片 */}
          <td className="py-4 px-6">
            <div className="w-16 h-12 rounded-lg overflow-hidden border border-gray-200">
              {course.coverImage ? (
                <img
                  src={course.coverImage}
                  alt={course.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-full h-full bg-gray-100 flex items-center justify-center ${course.coverImage ? 'hidden' : ''}`}>
                <BookOpen className="h-6 w-6 text-gray-400" />
              </div>
            </div>
          </td>

          {/* 课程标题 */}
          <td className="py-4 px-6">
            <div className="flex items-start space-x-3">
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900 truncate">
                  {course.title}
                </div>
              </div>
            </div>
          </td>
          
          <td className="py-4 px-6">
            {course.techStack && course.techStack.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {course.techStack.slice(0, 3).map((tech, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tech}
                  </span>
                ))}
                {course.techStack.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{course.techStack.length - 3}
                  </span>
                )}
              </div>
            )}
          </td>
          
          <td className="py-4 px-6">
            <Badge 
              variant={CoursesService.getStatusVariant(course.status)}
              size="sm"
            >
              {CoursesService.getStatusText(course.status)}
            </Badge>
          </td>

          {/* 价格信息 */}
          <td className="py-4 px-6">
            <div className="text-sm">
              {course.price !== undefined && course.price > 0 ? (
                <div className="space-y-1">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-gray-900">¥{course.price.toFixed(2)}</span>
                  </div>
                  {course.originalPrice && course.originalPrice > course.price && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500 line-through">
                        ¥{course.originalPrice.toFixed(2)}
                      </span>
                      <span className="text-xs bg-red-100 text-red-600 px-1 py-0.5 rounded">
                        {Math.round((1 - course.price / course.originalPrice) * 100)}%折
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-sm text-green-600 font-medium">免费</span>
              )}
            </div>
          </td>

          <td className="py-4 px-6">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>{course.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{CoursesService.formatReadingTime(course.totalReadingTime)}</span>
              </div>
            </div>
          </td>
          
          <td className="py-4 px-6 text-sm text-gray-600">
            {new Date(course.createTime).toLocaleDateString()}
          </td>
          
          <td className="py-4 px-6">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleManageChapters(course)}
                className="text-green-600 hover:text-green-700"
                title="管理章节"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEdit(course)}
                className="text-blue-600 hover:text-blue-700"
                title="编辑课程"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(course)}
                className="text-red-600 hover:text-red-700"
                title="删除课程"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </td>
        </tr>
      </React.Fragment>
    );
  };

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">课程管理</h1>
          <p className="text-gray-600 mt-1">管理系统中的所有课程内容和状态</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>创建课程</span>
        </Button>
      </div>

      {/* 筛选和搜索 */}
      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索课程标题、描述或技术栈..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as 'ALL' | CourseStatus)}
            options={[
              { value: 'ALL', label: '全部状态' },
              { value: 'PENDING', label: '待处理' },
              { value: 'IN_PROGRESS', label: '进行中' },
              { value: 'COMPLETED', label: '已完成' }
            ]}
            className="w-36"
            size="md"
          />

          <Button
            onClick={handleSearch}
            variant="outline"
            size="md"
          >
            搜索
          </Button>
        </div>
      </Card>

      {/* 课程列表 */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  封面
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  课程标题
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  技术栈
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  价格
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  评分/时长
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <LoadingSpinner />
                  </td>
                </tr>
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    {searchTerm || statusFilter !== 'ALL' ? '未找到符合条件的课程' : '暂无课程数据'}
                  </td>
                </tr>
              ) : (
                courses.map(course => renderCourseRow(course))
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                共 {totalCount} 条记录，第 {currentPage} 页，共 {totalPages} 页
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  下一页
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        isOpen={!!deletingCourse}
        title="确认删除课程"
        message={`确定要删除课程"${deletingCourse?.title}"吗？此操作不可恢复。`}
        confirmText="确定删除"
        cancelText="取消"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingCourse(null)}
      />

      {/* 创建/编辑课程模态框 */}
      <CourseModal
        isOpen={isModalOpen}
        editingCourse={editingCourse}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCourse(null);
        }}
        onSuccess={() => {
          loadCourses(); // 重新加载课程列表
        }}
      />

      {/* 章节管理弹窗 */}
      {managingCourse && (
        <ChaptersList
          isOpen={chaptersListOpen}
          course={managingCourse}
          onClose={() => {
            setChaptersListOpen(false);
            setManagingCourse(null);
          }}
        />
      )}
    </div>
  );
};