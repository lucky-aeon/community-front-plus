import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { DashboardMetricsDTO, DashboardTimeRange } from '@shared/types';
import { AdminMetricsService } from '@shared/services/api/admin-metrics.service';

type EChartsType = typeof import('echarts');

export const OverviewPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetricsDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<DashboardTimeRange>('DAY');
  const [days, setDays] = useState<number>(30);

  // echarts 动态加载（与 MarkdownEditor 的做法一致）
  const [echarts, setEcharts] = useState<EChartsType | null>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const w = window as unknown as { echarts?: EChartsType };
        if (w.echarts) { if (mounted) setEcharts(w.echarts); return; }
        const mod = await import('echarts');
        w.echarts = mod as unknown as EChartsType;
        if (mounted) setEcharts(w.echarts);
      } catch (e) {
        console.warn('Failed to load echarts:', e);
        if (mounted) setEcharts(null);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await AdminMetricsService.getDashboardMetrics({ timeRange, days });
      setMetrics(data);
    } catch (e) {
      console.error('加载仪表盘指标失败:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [timeRange, days]);

  // 图表容器 ref
  const dauRef = useRef<HTMLDivElement | null>(null);
  const orderRef = useRef<HTMLDivElement | null>(null);
  const regRef = useRef<HTMLDivElement | null>(null);
  const courseRef = useRef<HTMLDivElement | null>(null);
  const chartInstances = useRef<{ dau?: any; order?: any; reg?: any; course?: any }>({});

  // 渲染/更新图表
  useEffect(() => {
    if (!echarts) return;

    const disposeAndInit = (el: HTMLDivElement | null, key: 'dau' | 'order' | 'reg') => {
      if (!el) return null;
      if (chartInstances.current[key]) {
        chartInstances.current[key].dispose?.();
        chartInstances.current[key] = undefined;
      }
      const inst = echarts.init(el);
      chartInstances.current[key] = inst;
      return inst;
    };

    const dauInst = disposeAndInit(dauRef.current, 'dau');
    const orderInst = disposeAndInit(orderRef.current, 'order');
    const regInst = disposeAndInit(regRef.current, 'reg');
    const courseInst = disposeAndInit(courseRef.current, 'course');

    const dates = (arr?: { date: string }[]) => (arr || []).map(i => i.date);

    // DAU 组装：总量 + 按套餐堆叠
    if (dauInst) {
      const total = metrics?.activeUserTrend?.totalTrend || [];
      const subs = metrics?.activeUserTrend?.subscriptionTrends || {};
      // 过滤不应出现的“无套餐/未订阅/guest/none”等分组，保持与业务口径一致（所有活跃用户均有套餐）
      const filteredSubEntries = Object.entries(subs).filter(([plan]) => {
        const key = String(plan).trim();
        if (!key) return false;
        return !/(无套餐|未订阅|guest|none)/i.test(key);
      });
      const xAxis = dates(total);
      const series = [
        {
          name: '总活跃',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          data: total.map(i => i.value),
          lineStyle: { width: 2 }
        },
        ...filteredSubEntries.map(([plan, points]) => ({
          name: plan,
          type: 'line',
          smooth: true,
          areaStyle: {},
          stack: 'byPlan',
          emphasis: { focus: 'series' },
          data: (points || []).map(p => p.value)
        }))
      ];
      dauInst.setOption({
        tooltip: { trigger: 'axis' },
        legend: { top: 0 },
        grid: { left: 40, right: 24, bottom: 24, top: 32 },
        xAxis: { type: 'category', data: xAxis },
        yAxis: { type: 'value' },
        series
      });
    }

    // 订单趋势：订单数 + GMV（双轴）
    if (orderInst) {
      const cnt = metrics?.orderTrend?.countTrend || [];
      const amt = metrics?.orderTrend?.amountTrend || [];
      const xAxis = dates(cnt.length >= amt.length ? cnt : amt);
      orderInst.setOption({
        tooltip: { trigger: 'axis' },
        legend: { top: 0 },
        grid: { left: 40, right: 48, bottom: 24, top: 32 },
        xAxis: { type: 'category', data: xAxis },
        yAxis: [
          { type: 'value', name: '订单数' },
          { type: 'value', name: 'GMV(¥)', alignTicks: true }
        ],
        series: [
          { name: '订单数', type: 'line', smooth: true, data: cnt.map(i => i.value) },
          { name: 'GMV', type: 'bar', yAxisIndex: 1, data: amt.map(i => i.amount) }
        ]
      });
    }

    // 注册趋势
    if (regInst) {
      const list = metrics?.registrationTrend?.trend || [];
      regInst.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: 40, right: 24, bottom: 24, top: 16 },
        xAxis: { type: 'category', data: dates(list) },
        yAxis: { type: 'value' },
        series: [ { name: '注册用户', type: 'line', smooth: true, areaStyle: {}, data: list.map(i => i.value) } ]
      });
    }

    // 课程学习榜（水平条形图 TopN）
    if (courseInst) {
      const items = (metrics?.courseLearningMetrics || []).slice(0, 20);
      const titles = items.map(i => i.courseTitle);
      const values = items.map(i => i.learners);
      courseInst.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: 160, right: 24, bottom: 24, top: 16 },
        xAxis: { type: 'value' },
        yAxis: {
          type: 'category',
          data: titles,
          axisLabel: {
            // 截断过长标题
            formatter: (v: string) => (v.length > 18 ? v.slice(0, 18) + '…' : v)
          }
        },
        series: [
          {
            name: '学习人数',
            type: 'bar',
            data: values,
            label: { show: true, position: 'right' },
            itemStyle: { color: '#60a5fa' }
          }
        ]
      });
    }

    const onResize = () => {
      chartInstances.current.dau?.resize?.();
      chartInstances.current.order?.resize?.();
      chartInstances.current.reg?.resize?.();
      chartInstances.current.course?.resize?.();
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      chartInstances.current.dau?.dispose?.();
      chartInstances.current.order?.dispose?.();
      chartInstances.current.reg?.dispose?.();
      chartInstances.current.course?.dispose?.();
      chartInstances.current = {};
    };
  }, [echarts, metrics]);

  const presetDays = useMemo(() => [7, 30, 90], []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">概览</h1>
        <p className="text-muted-foreground mt-1">业务趋势与活跃度</p>
      </div>

      {/* 控件区 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as DashboardTimeRange)}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="时间粒度" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DAY">按天</SelectItem>
                <SelectItem value="WEEK">按周</SelectItem>
                <SelectItem value="MONTH">按月</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              {presetDays.map(d => (
                <Button key={d} size="sm" variant={days === d ? 'default' : 'outline'} onClick={() => setDays(d)}>
                  {d}天
                </Button>
              ))}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">自定义</span>
                <Input className="w-[100px]" type="number" min={1} max={365} value={String(days)} onChange={(e) => setDays(Math.max(1, Math.min(365, Number(e.target.value) || 1)))} />
              </div>
            </div>

            <div className="text-sm text-muted-foreground ml-auto">
              {loading ? '加载中…' : '就绪'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 图表区 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="col-span-1 xl:col-span-2">
          <CardContent className="pt-6">
            <div className="text-base font-medium mb-3">每日活跃用户（区分套餐）</div>
            <div ref={dauRef} className="h-[320px] w-full" />
            {!loading && (!metrics?.activeUserTrend?.totalTrend?.length) && (
              <div className="text-center text-muted-foreground py-8">暂无数据</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-base font-medium mb-3">订单趋势（订单数 / GMV）</div>
            <div ref={orderRef} className="h-[300px] w-full" />
            {!loading && (!metrics?.orderTrend?.countTrend?.length && !metrics?.orderTrend?.amountTrend?.length) && (
              <div className="text-center text-muted-foreground py-8">暂无数据</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-base font-medium mb-3">注册用户趋势</div>
            <div ref={regRef} className="h-[300px] w-full" />
            {!loading && (!metrics?.registrationTrend?.trend?.length) && (
              <div className="text-center text-muted-foreground py-8">暂无数据</div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 xl:col-span-2">
          <CardContent className="pt-6">
            <div className="text-base font-medium mb-3">课程学习人数 Top</div>
            <div ref={courseRef} className="h-[420px] w-full" />
            {!loading && (!metrics?.courseLearningMetrics || metrics.courseLearningMetrics.length === 0) && (
              <div className="text-center text-muted-foreground py-8">暂无数据</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
