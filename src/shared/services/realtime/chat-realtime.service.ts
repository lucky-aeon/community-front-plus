/*
 * 轻量聊天室 WS 客户端
 * - 连接地址：/ws/chat?token=...
 * - 协议：发送 JSON 帧，例如 { type: 'SUBSCRIBE', roomId }
 */

type WsEvent = 'open' | 'close' | 'error' | 'message' | 'subscribed' | 'pong' | 'room_closed';

class ChatRealtimeServiceImpl {
  private ws: WebSocket | null = null;
  private connecting: Promise<void> | null = null;
  private listeners = new Map<WsEvent, Set<(payload?: any) => void>>();
  private subscribed = new Set<string>();
  private heartbeatTimer: number | undefined;

  on(event: WsEvent, handler: (payload?: any) => void) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(handler);
    return () => this.listeners.get(event)!.delete(handler);
  }

  private emit(event: WsEvent, payload?: any) {
    const set = this.listeners.get(event);
    set?.forEach((fn) => {
      try { fn(payload); } catch { /* ignore */ }
    });
  }

  private buildUrl(): string {
    const proto = (location.protocol === 'https:') ? 'wss' : 'ws';
    // 走前端代理：/ws -> http://127.0.0.1:8520（vite.config.ts 配置 ws: true）
    const base = `${proto}://${location.host}/ws/chat`;
    const token = localStorage.getItem('auth_token') || '';
    const q = token ? `?token=${encodeURIComponent(token)}` : '';
    return `${base}${q}`;
  }

  async ensureConnected(): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;
    if (this.connecting) return this.connecting;
    this.connecting = new Promise<void>((resolve, reject) => {
      try {
        const ws = new WebSocket(this.buildUrl());
        this.ws = ws;
        ws.onopen = () => {
          try { console.debug('[WS] open /ws/chat'); } catch { /* ignore */ }
          this.emit('open');
          // 启动心跳（30s）
          this.startHeartbeat();
          resolve();
          this.connecting = null;
        };
        ws.onclose = () => {
          try { console.debug('[WS] close /ws/chat'); } catch { /* ignore */ }
          this.emit('close');
          this.stopHeartbeat();
          this.ws = null;
        };
        ws.onerror = () => {
          try { console.debug('[WS] error /ws/chat'); } catch { /* ignore */ }
          this.emit('error');
        };
        ws.onmessage = (ev) => {
          let data: any = null;
          try { data = JSON.parse(String(ev.data)); } catch { /* ignore */ }
          if (data && typeof data === 'object') {
            const t = String(data.type || '').toLowerCase();
            try {
              if (t === 'room_closed') console.debug('[WS] recv room_closed:', data);
            } catch { /* ignore */ }
            if (t === 'pong') this.emit('pong', data);
            if (t === 'subscribed') this.emit('subscribed', data);
            // 同步按具体事件名称广播（如 room_closed）
            if (t === 'room_closed') this.emit('room_closed', data);
            this.emit('message', data);
          }
        };
      } catch (err) {
        this.connecting = null;
        reject(err);
      }
    });
    return this.connecting;
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = window.setInterval(() => {
      this.send({ type: 'HEARTBEAT' });
    }, 30_000);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) window.clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = undefined;
  }

  send(frame: unknown) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    try { this.ws.send(JSON.stringify(frame)); } catch { /* ignore */ }
  }

  async subscribe(roomId: string): Promise<void> {
    await this.ensureConnected();
    this.send({ type: 'SUBSCRIBE', roomId });
    this.subscribed.add(roomId);
  }

  async unsubscribe(roomId: string): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.send({ type: 'UNSUBSCRIBE', roomId });
    this.subscribed.delete(roomId);
  }
}

export const ChatRealtimeService = new ChatRealtimeServiceImpl();
