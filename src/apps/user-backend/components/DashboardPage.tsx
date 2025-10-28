import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Calendar, CheckCircle, Clock, Crown, LayoutDashboard, MessageCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTES, routeUtils } from '@shared/routes/routes';
import { UpdateLogs } from '@shared/components/business/UpdateLogs';
import { RedeemCDKDialog } from '@shared/components/business/RedeemCDKDialog';
import { NotificationsService, UpdateLogService, UserLearningService, UserService } from '@shared/services/api';
import type { UpdateLogDTO, PageResponse, UserNotificationDTO, LearningRecordItemDTO } from '@shared/types';
import { Switch } from '@/components/ui/switch';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // 更新日志
  const [logs, setLogs] = useState<UpdateLogDTO[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  // 最新消息
  const [messages, setMessages] = useState<UserNotificationDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [msgLoading, setMsgLoading] = useState(true);
  // 通知开关（邮箱通知）
  const [emailNotifEnabled, setEmailNotifEnabled] = useState<boolean | null>(null);
  const [emailToggleLoading, setEmailToggleLoading] = useState(false);

  // 学习记录
  const [learning, setLearning] = useState<PageResponse<LearningRecordItemDTO>>({
    records: [], total: 0, size: 5, current: 1, orders: [], optimizeCountSql: true, searchCount: true, optimizeJoinOfCountSql: true, pages: 0,
  });
  const [learnLoading, setLearnLoading] = useState(true);

  const [isRedeemOpen, setIsRedeemOpen] = useState(false);

  // 拉取更新日志（前3条）
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLogsLoading(true);
      try {
        const list = await UpdateLogService.getPublicUpdateLogs();
        if (!cancelled) setLogs(list.slice(0, 3));
      } catch (e) {
        console.error('获取更新日志失败:', e);
      } finally {
        if (!cancelled) setLogsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // 拉取最新消息（前5条 + 未读数）
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setMsgLoading(true);
      try {
        const page = await NotificationsService.getNotifications({ pageNum: 1, pageSize: 5 });
        const count = await NotificationsService.getUnreadCount();
        if (!cancelled) {
          setMessages(page.records || []);
          setUnreadCount(count);
        }
      } catch (e) {
        console.error('获取最新消息失败:', e);
      } finally {
        if (!cancelled) setMsgLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // 拉取通知设置（邮箱通知开关）
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await UserService.getCurrentUser();
        if (!cancelled) setEmailNotifEnabled(!!me.emailNotificationEnabled);
      } catch (e) {
        console.error('加载通知设置失败:', e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleToggleEmailNotification = async (next: boolean) => {
    if (emailNotifEnabled === null || emailToggleLoading) return;
    const prev = emailNotifEnabled;
    // 乐观更新
    setEmailNotifEnabled(next);
    setEmailToggleLoading(true);
    try {
      const updated = await UserService.toggleEmailNotification();
      setEmailNotifEnabled(!!updated.emailNotificationEnabled);
      // 成功提示由拦截器统一处理
    } catch (e) {
      console.error('切换邮箱通知设置失败:', e);
      // 回滚
      setEmailNotifEnabled(prev);
    } finally {
      setEmailToggleLoading(false);
    }
  };

  // 拉取学习记录（前5条）
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLearnLoading(true);
      try {
        const page = await UserLearningService.listMyLearningRecords(1, 5);
        if (!cancelled) setLearning(page);
      } catch (e) {
        console.error('获取学习记录失败:', e);
      } finally {
        if (!cancelled) setLearnLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // 会员卡片数据
  const membershipCard = useMemo(() => {
    const planName = user?.currentSubscriptionPlanName;
    const level = user?.currentSubscriptionPlanLevel as number | undefined;
    const startRaw = user?.currentSubscriptionStartTime as string | undefined;
    const endRaw = user?.currentSubscriptionEndTime as string | undefined;
    const format = (v?: string | Date) => {
      if (!v) return '-';
      const d = typeof v === 'string' ? new Date(v) : v;
      const t = d instanceof Date && !isNaN(d.getTime()) ? d : undefined;
      return t ? t.toLocaleString('zh-CN') : String(v);
    };
    const now = Date.now();
    const endMs = endRaw ? new Date(endRaw).getTime() : undefined;
    const daysLeft = typeof endMs === 'number' ? Math.max(0, Math.floor((endMs - now) / 86400000)) : undefined;
    const isActive = typeof endMs === 'number' ? endMs > now : false;
    return { planName, level, startRaw, endRaw, format, daysLeft, isActive };
  }, [user?.currentSubscriptionPlanName, user?.currentSubscriptionStartTime, user?.currentSubscriptionEndTime, user?.currentSubscriptionPlanLevel]);

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'COMMENT':
      case 'REPLY':
        return <MessageCircle className="h-4 w-4 text-blue-600" />;
      case 'LIKE':
        return <CheckCircle className="h-4 w-4 text-red-600" />;
      case 'FOLLOW':
        return <User className="h-4 w-4 text-green-600" />;
      case 'SYSTEM':
      default:
        return <Bell className="h-4 w-4 text-orange-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-yellow-600" />
          <h1 className="text-2xl font-bold text-gray-900">我的看板</h1>
        </div>
        <div className="text-sm text-gray-500">欢迎回来，{user?.name}</div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左列：会员卡片 + 更新日志 */}
        <div className="lg:col-span-4 space-y-6">
          {/* 会员与套餐卡片 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">会员与套餐</h3>
            <div className={`p-4 rounded-xl border ${membershipCard.isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Crown className={`h-5 w-5 ${membershipCard.isActive ? 'text-yellow-500' : 'text-gray-400'}`} />
                  <span className="font-medium text-gray-900">{membershipCard.planName || '未订阅套餐'}</span>
                  {membershipCard.level ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">Lv.{membershipCard.level}</span>
                  ) : null}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${membershipCard.isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                  {membershipCard.isActive ? '活跃' : '已过期'}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2">
                <div className="flex items-center text-sm text-gray-700">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" /> 生效时间：<span className="ml-1 font-medium">{membershipCard.format(membershipCard.startRaw)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" /> 到期时间：<span className="ml-1 font-medium">{membershipCard.format(membershipCard.endRaw)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Clock className={`h-4 w-4 mr-2 ${!membershipCard.isActive ? 'text-gray-400' : (membershipCard.daysLeft !== undefined && membershipCard.daysLeft <= 7) ? 'text-orange-500' : 'text-gray-500'}`} />
                  剩余天数：<span className={`ml-1 font-medium ${!membershipCard.isActive ? 'text-gray-500' : (membershipCard.daysLeft !== undefined && membershipCard.daysLeft <= 7) ? 'text-orange-600' : 'text-gray-900'}`}>{membershipCard.daysLeft !== undefined ? `${membershipCard.daysLeft} 天` : '-'}</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2 mt-4">
              <Button size="sm" variant="honeySoft" className="flex-1" onClick={() => navigate(ROUTES.MEMBERSHIP)}>续费 / 升级</Button>
              <Button size="sm" variant="honeySoft" className="flex-1" onClick={() => setIsRedeemOpen(true)}>兑换码兑换</Button>
            </div>
          </Card>

          {/* 更新日志 */}
          <UpdateLogs logs={logs} isLoading={logsLoading} />
        </div>

        {/* 中列：最新消息 */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">最新消息</h3>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-1">{unreadCount > 99 ? '99+' : unreadCount}</Badge>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/user-backend/messages')}>查看全部</Button>
            </div>

            {/* 列表 */}
            {/* 通知开关美化块 */}
            <div className="mb-4">
              <div className={`flex items-center justify-between p-3 rounded-lg border ${emailNotifEnabled ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="shrink-0">
                    {emailNotifEnabled ? (
                      <Bell className="h-4 w-4 text-amber-600" />
                    ) : (
                      <BellOff className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">消息通知</div>
                    <div className="text-xs text-gray-500 truncate">{emailNotifEnabled === null ? '加载设置中…' : (emailNotifEnabled ? '已开启，重要消息将通过邮箱提醒' : '已关闭，仅在站内查看消息，不发送邮件')}</div>
                  </div>
                </div>
                <Switch
                  id="emailNotifSwitch"
                  checked={!!emailNotifEnabled}
                  disabled={emailNotifEnabled === null || emailToggleLoading}
                  onCheckedChange={handleToggleEmailNotification}
                />
              </div>
            </div>

            <div className="space-y-3">
              {msgLoading ? (
                <div className="text-sm text-gray-500">加载中...</div>
              ) : messages.length === 0 ? (
                <div className="text-sm text-gray-500">暂无消息</div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`p-3 rounded-lg border ${!m.read ? 'bg-blue-50/40 border-blue-200' : 'border-gray-200'} hover:shadow-sm transition` }>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getMessageIcon(m.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-medium ${!m.read ? 'text-gray-900' : 'text-gray-700'}`}>{m.title}</h4>
                          <span className="text-xs text-gray-500">{new Date(m.createTime).toLocaleString()}</span>
                        </div>
                        <p className={`text-sm ${!m.read ? 'text-gray-800' : 'text-gray-600'} line-clamp-2`}>{m.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* 右列：学习记录 */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-700" />
                <h3 className="text-lg font-semibold text-gray-900">学习记录</h3>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/user-backend/learning')}>查看全部</Button>
            </div>

            {learnLoading ? (
              <div className="text-sm text-gray-500">加载中...</div>
            ) : (learning.records || []).length === 0 ? (
              <div className="text-sm text-gray-500">暂无学习记录</div>
            ) : (
              <div className="space-y-3">
                {(learning.records || []).map((rec) => (
                  <div key={rec.courseId} className="p-3 rounded-lg border border-gray-200 hover:shadow-sm transition">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{rec.courseTitle}</div>
                        <div className="text-xs text-gray-500 mt-0.5">最近学习：{new Date(rec.lastAccessTime).toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-28 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: `${Math.min(100, Math.max(0, rec.progressPercent || 0))}%` }} />
                        </div>
                        <span className="text-sm text-gray-700 w-10 text-right">{rec.progressPercent ?? 0}%</span>
                      </div>
                    </div>
                    <div className="mt-2 text-right">
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => navigate(routeUtils.getCourseDetailRoute(rec.courseId))}>
                        继续学习
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <RedeemCDKDialog open={isRedeemOpen} onOpenChange={setIsRedeemOpen} />
    </div>
  );
};

export default DashboardPage;
