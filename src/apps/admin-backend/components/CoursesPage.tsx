import React, { useState, useCallback, useEffect } from 'react';
import {
  Plus,
  Search,
  BookOpen,
  Clock,
  Star,
  DollarSign
} from 'lucide-react';
import { Card } from '@shared/components/ui/Card';
import { Button } from '@shared/components/ui/Button';
import { Input } from '@shared/components/ui/Input';
import { Select } from '@shared/components/ui/Select';
import { Badge } from '@shared/components/ui/Badge';
import { ConfirmDialog } from '@shared/components/ui/ConfirmDialog';
import { DataTable, DataTableColumn } from '@shared/components/ui/DataTable';
import { Pagination } from '@shared/components/ui/Pagination';
import { TableActions, TableAction } from '@shared/components/ui/TableActions';
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

  // 定义表格列
  const columns: DataTableColumn<CourseDTO>[] = [
    {
      key: 'cover',
      title: '封面',
      width: 80,
      render: (_, course) => (
        <div className="w-16 h-12 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
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
          <div className={`w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${course.coverImage ? 'hidden' : ''}`}>
            <BookOpen className="h-6 w-6 text-gray-400 dark:text-gray-500" />
          </div>
        </div>
      ),
    },
    {
      key: 'title',
      title: '课程标题',
      dataIndex: 'title',
      render: (title) => (
        <div className="font-medium text-gray-900 dark:text-white truncate">
          {title}
        </div>
      ),
    },
    {
      key: 'techStack',
      title: '技术栈',
      render: (_, course) => (
        <div>
          {course.techStack && course.techStack.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {course.techStack.slice(0, 3).map((tech, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {tech}
                </span>
              ))}
              {course.techStack.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{course.techStack.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      title: '状态',
      render: (_, course) => (
        <Badge
          variant={CoursesService.getStatusVariant(course.status)}
          size="sm"
        >
          {CoursesService.getStatusText(course.status)}
        </Badge>
      ),
    },
    {
      key: 'price',
      title: '价格',
      render: (_, course) => (
        <div className="text-sm">
          {course.price !== undefined && course.price > 0 ? (
            <div className="space-y-1">
              <div className="flex items-center space-x-1">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-medium text-gray-900 dark:text-white">¥{course.price.toFixed(2)}</span>
              </div>
              {course.originalPrice && course.originalPrice > course.price && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 line-through">
                    ¥{course.originalPrice.toFixed(2)}
                  </span>
                  <span className="text-xs bg-red-100 text-red-600 px-1 py-0.5 rounded dark:bg-red-900 dark:text-red-200">
                    {Math.round((1 - course.price / course.originalPrice) * 100)}%折
                  </span>
                </div>
              )}
            </div>
          ) : (
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">免费</span>
          )}
        </div>
      ),
    },
    {
      key: 'rating',
      title: '评分/时长',
      render: (_, course) => (
        <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400" />
            <span>{course.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{CoursesService.formatReadingTime(course.totalReadingTime)}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'createTime',
      title: '创建时间',
      render: (_, course) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(course.createTime).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      title: '操作',
      render: (_, course) => {
        const actions: TableAction[] = [
          {
            key: 'chapters',
            type: 'chapters',
            onClick: () => handleManageChapters(course),
          },
          {
            key: 'edit',
            type: 'edit',
            onClick: () => handleEdit(course),
          },
          {
            key: 'delete',
            type: 'delete',
            onClick: () => handleDelete(course),
          },
        ];
        return <TableActions actions={actions} />;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">课程管理</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">管理系统中的所有课程内容和状态</p>
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
      <DataTable
        columns={columns}
        data={courses}
        loading={isLoading}
        rowKey="id"
        emptyText={searchTerm || statusFilter !== 'ALL' ? '未找到符合条件的课程' : '暂无课程数据'}
        emptyIcon={<BookOpen className="w-12 h-12 text-gray-400 dark:text-gray-500" />}
        pagination={
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            onChange={setCurrentPage}
            mode="simple"
          />
        }
      />

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