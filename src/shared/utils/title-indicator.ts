// 轻量浏览器标题新消息指示器
// - 第一次触发时缓存原标题（包含应用名后缀）
// - 每次 bump() 将标题更新为 `(n) 原标题`
// - clear() 还原原标题并重置计数

export class TitleIndicator {
  private static baseTitle: string | null = null;
  private static count = 0;

  static bump(delta = 1) {
    if (typeof document === 'undefined') return;
    if (!this.baseTitle) this.baseTitle = document.title;
    this.count = Math.max(1, this.count + delta);
    this.apply();
  }

  static set(count: number) {
    if (typeof document === 'undefined') return;
    if (count <= 0) {
      this.clear();
      return;
    }
    if (!this.baseTitle) this.baseTitle = document.title;
    this.count = Math.max(1, Math.floor(count));
    this.apply();
  }

  static getCount() {
    return this.count;
  }

  static clear() {
    if (typeof document === 'undefined') return;
    if (this.baseTitle != null) {
      try { document.title = this.baseTitle; } catch { /* ignore */ }
    }
    this.baseTitle = null;
    this.count = 0;
  }

  private static apply() {
    if (typeof document === 'undefined') return;
    const base = this.baseTitle ?? document.title;
    try {
      document.title = `(${this.count}) ${base}`;
    } catch { /* ignore */ }
  }
}

export default TitleIndicator;

