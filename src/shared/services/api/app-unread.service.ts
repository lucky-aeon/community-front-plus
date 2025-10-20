import type { UnreadSummaryDTO, UnreadChannel } from '@shared/types';
import { UnreadService } from './unread.service';

/**
 * App 层未读小红点轮询/状态服务
 * - 负责：导航红点汇总拉取、前后台切换暂停/恢复、事件广播
 * - 事件：window.dispatchEvent(new CustomEvent('unread:summary', { detail }))
 */
class AppUnreadServiceImpl {
  private timer: number | undefined;
  private intervalMs = 60_000;
  private running = false;
  private latest: UnreadSummaryDTO = { postsUnread: 0, questionsUnread: 0, chaptersUnread: 0 };

  /** 最近一次汇总值（内存缓存） */
  getSnapshot(): UnreadSummaryDTO {
    return this.latest;
  }

  /** 立即刷新一次，并广播变化 */
  async refresh(): Promise<UnreadSummaryDTO> {
    const summary = await UnreadService.getSummary();
    this.latest = summary;
    try { window.dispatchEvent(new CustomEvent('unread:summary', { detail: summary })); } catch { /* no-op */ }
    return summary;
  }

  /** 启动轮询（可重复调用，内部去重） */
  start(options?: { intervalMs?: number; pauseWhenHidden?: boolean }): void {
    if (options?.intervalMs && options.intervalMs > 0) this.intervalMs = options.intervalMs;
    if (this.running) return;
    this.running = true;

    const tick = async () => {
      try { await this.refresh(); } catch { /* 静默失败 */ }
      if (!this.running) return;
      this.timer = window.setTimeout(tick, this.intervalMs);
    };

    // 首次立即刷新一次
    void tick();

    if (options?.pauseWhenHidden) {
      const onVisibility = async () => {
        if (document.hidden) {
          if (this.timer) window.clearTimeout(this.timer);
          this.timer = undefined;
        } else {
          // 回到前台：立即刷新一次并恢复节拍
          try { await this.refresh(); } catch { /* ignore */ }
          if (this.running && !this.timer) this.timer = window.setTimeout(tick, this.intervalMs);
        }
      };
      window.addEventListener('visibilitychange', onVisibility);
      // 保存移除器在 window 上，避免重复注册
      (this as unknown as { __off?: () => void }).__off = () => {
        window.removeEventListener('visibilitychange', onVisibility);
      };
    }
  }

  /** 停止轮询并清理监听 */
  stop(): void {
    this.running = false;
    if (this.timer) window.clearTimeout(this.timer);
    this.timer = undefined;
    try { (this as unknown as { __off?: () => void }).__off?.(); } catch { /* ignore */ }
  }

  /** 清零指定频道并同步刷新汇总 */
  async visit(channel: UnreadChannel): Promise<void> {
    await UnreadService.visit(channel);
    // 成功后刷新一次汇总，保持导航同步
    try { await this.refresh(); } catch { /* ignore */ }
  }
}

export const AppUnreadService = new AppUnreadServiceImpl();
