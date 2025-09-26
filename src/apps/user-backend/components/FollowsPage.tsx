import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Search, Users, GraduationCap, HeartOff } from 'lucide-react';
import { UserFollowsService } from '@shared/services/api/user-follows.service';
import { FollowDTO, PageResponse } from '@shared/types';
import { showToast } from '@shared/utils/toast';
import { SubscribeService } from '@shared/services/api/subscribe.service';
import { useNavigate } from 'react-router-dom';

type TabKey = 'all' | 'users' | 'courses';
type FollowItemEx = FollowDTO & {
  targetUserAvatar?: string;
  targetUserName?: string;
  courseCover?: string;
  courseTitle?: string;
  createTime?: string;
};

export const FollowsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [allFollows, setAllFollows] = useState<FollowDTO[]>([]);
  const [userFollows, setUserFollows] = useState<FollowDTO[]>([]);
  const [courseFollows, setCourseFollows] = useState<FollowDTO[]>([]);
  const [allPage, setAllPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [coursePage, setCoursePage] = useState(1);
  const [allPageInfo, setAllPageInfo] = useState<PageResponse<FollowDTO> | null>(null);
  const [userPageInfo, setUserPageInfo] = useState<PageResponse<FollowDTO> | null>(null);
  const [coursePageInfo, setCoursePageInfo] = useState<PageResponse<FollowDTO> | null>(null);
  const navigate = useNavigate();

  const formatFollowTime = (time?: string) => {
    if (!time) return '-';
    const normalized = time.includes('T') ? time : time.replace(' ', 'T');
    const d = new Date(normalized);
    return isNaN(d.getTime()) ? time : d.toLocaleString('zh-CN');
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'all') {
        const res = await UserFollowsService.getAllFollows({ pageNum: allPage, pageSize: 10, keyword: searchTerm || undefined });
        setAllPageInfo(res);
        setAllFollows(res.records);
      } else if (activeTab === 'users') {
        const res = await UserFollowsService.getFollowedUsers({ pageNum: userPage, pageSize: 10, keyword: searchTerm || undefined });
        setUserPageInfo(res);
        setUserFollows(res.records);
      } else {
        const res = await UserFollowsService.getFollowedCourses({ pageNum: coursePage, pageSize: 10, keyword: searchTerm || undefined });
        setCoursePageInfo(res);
        setCourseFollows(res.records);
      }
    } catch (e) {
      console.error('加载关注列表失败:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, allPage, userPage, coursePage]);

  const filteredAll = useMemo(() => {
    if (!searchTerm) return allFollows;
    return allFollows.filter(i => (i.targetName || '').toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, allFollows]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return userFollows;
    return userFollows.filter(u => (u.targetName || '').toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, userFollows]);

  const filteredCourses = useMemo(() => {
    if (!searchTerm) return courseFollows;
    return courseFollows.filter(c => (c.targetName || '').toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, courseFollows]);

  const handleUnfollowUser = async (u: FollowDTO) => {
    try {
      const resp = await SubscribeService.toggleSubscribe({ targetId: u.targetId, targetType: 'USER' });
      if (!resp.isFollowing) {
        setAllFollows(prev => prev.filter(x => x.targetId !== u.targetId));
        setUserFollows(prev => prev.filter(x => x.targetId !== u.targetId));
      }
    } catch (e) {
      console.error('取消关注失败:', e);
    }
  };

  const handleUnfollowCourse = async (c: FollowDTO) => {
    try {
      const resp = await SubscribeService.toggleSubscribe({ targetId: c.targetId, targetType: 'COURSE' });
      if (!resp.isFollowing) {
        setAllFollows(prev => prev.filter(x => x.targetId !== c.targetId));
        setCourseFollows(prev => prev.filter(x => x.targetId !== c.targetId));
      }
    } catch (e) {
      console.error('取消订阅失败:', e);
    }
  };

  const renderFollowItem = (item: FollowDTO) => {
    if (item.targetType === 'USER') {
      return (
        <Card key={`all-${item.targetId}`} className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={item.targetAvatar || (item as FollowItemEx).targetUserAvatar} />
              <AvatarFallback>{(item.targetName || (item as FollowItemEx).targetUserName || 'U')[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-gray-900 flex items-center">
                <Users className="h-4 w-4 text-gray-400 mr-2" />
                {item.targetName || (item as FollowItemEx).targetUserName}
              </div>
              <div className="text-sm text-gray-500 line-clamp-1">{item.description || (item as FollowItemEx).targetUserDescription || '这个人很神秘，什么都没有写。'}</div>
              <div className="text-xs text-gray-400 mt-1">关注于 {formatFollowTime(item.followTime || (item as FollowItemEx).createTime)}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => handleUnfollowUser(item)} className="text-red-600 border-red-200 hover:bg-red-50">
              <HeartOff className="h-4 w-4 mr-1" /> 取消关注
            </Button>
          </div>
        </Card>
      );
    }
    // COURSE
    return (
      <Card key={`all-${item.targetId}`} className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-14 w-20 rounded bg-gray-100 overflow-hidden">
            {item.targetCover || (item as FollowItemEx).courseCover ? (
              <img src={item.targetCover || (item as FollowItemEx).courseCover} alt={(item.targetName || (item as FollowItemEx).courseTitle) || ''} className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div>
            <div className="font-medium text-gray-900 flex items-center">
              <GraduationCap className="h-4 w-4 text-gray-400 mr-2" />
              {item.targetName || (item as FollowItemEx).courseTitle}
            </div>
            <div className="text-sm text-gray-500">{item.authorName ? `作者：${item.authorName}` : '课程'}</div>
            <div className="text-xs text-gray-400 mt-1">订阅于 {formatFollowTime(item.followTime || (item as FollowItemEx).createTime)}</div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="neutral" onClick={() => navigate(`/dashboard/courses/${item.targetId}`)}>查看课程</Button>
          <Button variant="outline" onClick={() => handleUnfollowCourse(item)} className="text-red-600 border-red-200 hover:bg-red-50">
            <HeartOff className="h-4 w-4 mr-1" /> 取消订阅
          </Button>
        </div>
      </Card>
    );
  };

  const renderUsers = () => (
    <div className="space-y-4">
      {loading ? (
        <div className="py-12 text-center text-gray-500">加载中...</div>
      ) : filteredUsers.length === 0 ? (
        <Card className="p-10 text-center text-gray-500">暂无关注的用户</Card>
      ) : (
        filteredUsers.map(u => (
          <Card key={u.targetId} className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={u.targetAvatar || (u as FollowItemEx).targetUserAvatar} />
                <AvatarFallback>{(u.targetName || (u as FollowItemEx).targetUserName || 'U')[0]}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-gray-900 flex items-center">
                  <Users className="h-4 w-4 text-gray-400 mr-2" />
                  {u.targetName || (u as FollowItemEx).targetUserName}
                </div>
                <div className="text-sm text-gray-500 line-clamp-1">{u.description || (u as FollowItemEx).targetUserDescription || '这个人很神秘，什么都没有写。'}</div>
                <div className="text-xs text-gray-400 mt-1">关注于 {formatFollowTime(u.followTime || (u as FollowItemEx).createTime)}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => handleUnfollowUser(u)} className="text-red-600 border-red-200 hover:bg-red-50">
                <HeartOff className="h-4 w-4 mr-1" /> 取消关注
              </Button>
            </div>
          </Card>
        ))
      )}
      {/* 分页 */}
      {userPageInfo && userPageInfo.pages > 1 && (
        <div className="flex justify-center mt-2 space-x-2">
          <Button variant="neutral" size="sm" disabled={userPage <= 1} onClick={() => setUserPage(userPage - 1)}>上一页</Button>
          <span className="text-sm text-gray-500">第 {userPage} / {userPageInfo.pages} 页</span>
          <Button variant="neutral" size="sm" disabled={userPage >= userPageInfo.pages} onClick={() => setUserPage(userPage + 1)}>下一页</Button>
        </div>
      )}
    </div>
  );

  const renderCourses = () => (
    <div className="space-y-4">
      {loading ? (
        <div className="py-12 text-center text-gray-500">加载中...</div>
      ) : filteredCourses.length === 0 ? (
        <Card className="p-10 text-center text-gray-500">暂无订阅的课程</Card>
      ) : (
        filteredCourses.map(c => (
          <Card key={c.targetId} className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-14 w-20 rounded bg-gray-100 overflow-hidden">
                {c.targetCover || (c as FollowItemEx).courseCover ? (
                  <img src={c.targetCover || (c as FollowItemEx).courseCover} alt={(c.targetName || (c as FollowItemEx).courseTitle) || ''} className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div>
                <div className="font-medium text-gray-900 flex items-center">
                  <GraduationCap className="h-4 w-4 text-gray-400 mr-2" />
                  {c.targetName || (c as FollowItemEx).courseTitle}
                </div>
                <div className="text-sm text-gray-500">{c.authorName ? `作者：${c.authorName}` : '课程'}</div>
                <div className="text-xs text-gray-400 mt-1">订阅于 {formatFollowTime(c.followTime || (c as FollowItemEx).createTime)}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="neutral" onClick={() => navigate(`/dashboard/courses/${c.targetId}`)}>查看课程</Button>
              <Button variant="outline" onClick={() => handleUnfollowCourse(c)} className="text-red-600 border-red-200 hover:bg-red-50">
                <HeartOff className="h-4 w-4 mr-1" /> 取消订阅
              </Button>
            </div>
          </Card>
        ))
      )}
      {/* 分页 */}
      {coursePageInfo && coursePageInfo.pages > 1 && (
        <div className="flex justify-center mt-2 space-x-2">
          <Button variant="neutral" size="sm" disabled={coursePage <= 1} onClick={() => setCoursePage(coursePage - 1)}>上一页</Button>
          <span className="text-sm text-gray-500">第 {coursePage} / {coursePageInfo.pages} 页</span>
          <Button variant="neutral" size="sm" disabled={coursePage >= coursePageInfo.pages} onClick={() => setCoursePage(coursePage + 1)}>下一页</Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">关注管理</h1>
          <p className="text-gray-600 mt-1">查看并管理你关注的用户与订阅的课程</p>
        </div>
      </div>

      {/* 搜索 */}
      <Card className="p-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder={activeTab === 'users' ? '搜索关注的用户...' : activeTab === 'courses' ? '搜索订阅的课程...' : '搜索关注/订阅...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') fetchData(); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)}>
        <TabsList className="grid grid-cols-3 w-full rounded-full bg-muted p-1 h-12">
          <TabsTrigger value="all" className="rounded-full h-10 text-base data-[state=active]:shadow-none">全部</TabsTrigger>
          <TabsTrigger value="users" className="rounded-full h-10 text-base data-[state=active]:shadow-none">关注的用户</TabsTrigger>
          <TabsTrigger value="courses" className="rounded-full h-10 text-base data-[state=active]:shadow-none">订阅的课程</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <div className="space-y-4">
            {loading ? (
              <div className="py-12 text-center text-gray-500">加载中...</div>
            ) : filteredAll.length === 0 ? (
              <Card className="p-10 text-center text-gray-500">暂无数据</Card>
            ) : (
              filteredAll.map(item => renderFollowItem(item))
            )}
            {allPageInfo && allPageInfo.pages > 1 && (
              <div className="flex justify-center mt-2 space-x-2">
                <Button variant="neutral" size="sm" disabled={allPage <= 1} onClick={() => setAllPage(allPage - 1)}>上一页</Button>
                <span className="text-sm text-gray-500">第 {allPage} / {allPageInfo.pages} 页</span>
                <Button variant="neutral" size="sm" disabled={allPage >= allPageInfo.pages} onClick={() => setAllPage(allPage + 1)}>下一页</Button>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="users" className="mt-4">{renderUsers()}</TabsContent>
        <TabsContent value="courses" className="mt-4">{renderCourses()}</TabsContent>
      </Tabs>
    </div>
  );
};

export default FollowsPage;
