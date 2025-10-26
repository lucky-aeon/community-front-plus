import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageCircle, Plus, Users as UsersIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChatRoomsService, UserService, ChatMessagesService } from '@shared/services/api';
import type { ChatRoomDTO, PageResponse, ChatMessageDTO, ChatRoomMemberDTO, ChatUnreadInfoDTO, ChatRoomAudience } from '@shared/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@shared/utils/cn';
import { ChatRealtimeService } from '@shared/services/realtime/chat-realtime.service';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { showToast } from '@shared/utils/toast';
import { MarkdownEditor, type MarkdownEditorHandle } from '@shared/components/ui/MarkdownEditor';
import { SharedMarkdownRenderer } from '@shared/components/ui/SharedMarkdownRenderer';

export const ChatRoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<ChatRoomDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  // 默认：仅付费用户
  const [selectedAudience, setSelectedAudience] = useState<ChatRoomAudience>('PAID_ONLY');
  const [page, setPage] = useState<PageResponse<ChatRoomDTO> | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeRoom, setActiveRoom] = useState<ChatRoomDTO | null>(null);
  const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');
  // 引用回复：右键消息 -> 设置待引用消息
  const [quotedForSend, setQuotedForSend] = useState<ChatMessageDTO | null>(null);
  // 右键上下文菜单
  const [ctxMenu, setCtxMenu] = useState<{ open: boolean; x: number; y: number; message: ChatMessageDTO | null }>({ open: false, x: 0, y: 0, message: null });
  const { user } = useAuth();
  const [members, setMembers] = useState<ChatRoomMemberDTO[]>([]);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const wsOffRef = useRef<Array<() => void>>([]);
  const msgIdSetRef = useRef<Set<string>>(new Set());
  const refreshingMembersRef = useRef(false);
  const msgRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  // 聊天滚动容器（Radix ScrollArea.Root），用于上滑加载更多
  const msgScrollMobileRef = useRef<HTMLDivElement | null>(null);
  const msgScrollDesktopRef = useRef<HTMLDivElement | null>(null);
  // 顶部观察哨兵：进入可视区即尝试加载更早消息
  const topSentinelMobileRef = useRef<HTMLDivElement | null>(null);
  const topSentinelDesktopRef = useRef<HTMLDivElement | null>(null);
  // 消息分页（后端“最新在前”的分页），进入房间后按“升序”展示
  const [msgPageNum, setMsgPageNum] = useState(1);
  const [msgTotalPages, setMsgTotalPages] = useState(1);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const loadingOlderRef = useRef(false);
  const msgPageNumRef = useRef(1);
  const msgTotalPagesRef = useRef(1);
  const [unreadInfo, setUnreadInfo] = useState<ChatUnreadInfoDTO | null>(null);
  const [showUnreadPill, setShowUnreadPill] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // 输入（Markdown 编辑器）
  const inputRefMobile = useRef<MarkdownEditorHandle | null>(null);
  const inputRefDesktop = useRef<MarkdownEditorHandle | null>(null);
  // @ 提及（仅聊天室使用）
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartIdx, setMentionStartIdx] = useState<number | null>(null);
  const [mentionActiveIndex, setMentionActiveIndex] = useState(0);
  // 解析时使用，发送时再从文本提取，不单独维护选择集合
  const lastTextRef = useRef('');

  // 允许作为用户名的字符（中英文、数字、下划线、连字符）
  const mentionCharRe = /[A-Za-z0-9_\-\u4e00-\u9fa5]/;
  const isMentionChar = useCallback((ch: string) => mentionCharRe.test(ch), []);

  // 依据当前输入文本解析是否存在激活中的 @ 提及片段（仅在末尾激活，简化实现）
  const detectMention = useCallback((val: string) => {
    // 查找最近的 @（当前行）
    const at = val.lastIndexOf('@');
    if (at < 0) return { open: false } as const;
    // @ 前为起始或非“字母/数字/中文”的字符
    const prev = at > 0 ? val[at - 1] : '';
    if (at > 0 && /[\w\u4e00-\u9fa5]/.test(prev)) return { open: false } as const;
    // 仅检查本行的 @ 片段，遇到换行即视为结束
    const tail = val.slice(at + 1);
    const eol = tail.search(/[\r\n]/);
    const seg = eol >= 0 ? tail.slice(0, eol) : tail;
    for (let i = 0; i < seg.length; i++) {
      if (!isMentionChar(seg[i])) {
        return { open: false } as const;
      }
    }
    return { open: true, start: at, query: seg } as const;
  }, [isMentionChar]);

  // 供发送时从文本中提取所有 @ 的用户ID（多选）
  const extractMentionedUserIds = useCallback((val: string) => {
    const ids = new Set<string>();
    // 匹配 @后的一串允许字符
    const re = /@([A-Za-z0-9_\-\u4e00-\u9fa5]+)/g;
    let m: RegExpExecArray | null;
    const membersByLowerName = new Map<string, string>(); // nameLower -> userId
    members.forEach(mem => {
      if (mem.name) membersByLowerName.set(mem.name.toLowerCase(), mem.userId);
    });
    while ((m = re.exec(val)) !== null) {
      const name = (m[1] || '').toLowerCase();
      const id = membersByLowerName.get(name);
      if (id) ids.add(id);
    }
    const selfId = user?.id ? String(user.id) : '';
    if (selfId) ids.delete(selfId);
    return Array.from(ids);
  }, [members, user?.id]);

  // 根据当前 query 过滤成员
  const mentionCandidates = useMemo(() => {
    const q = (mentionQuery || '').trim().toLowerCase();
    if (!mentionOpen) return [] as ChatRoomMemberDTO[];
    const selfId = user?.id ? String(user.id) : '';
    const list = (members || []).filter(m => {
      if (selfId && m.userId === selfId) return false;
      const nm = (m.name || '').toLowerCase();
      return q ? nm.includes(q) : true;
    });
    // 在线优先
    return list.sort((a, b) => Number(!!b.online) - Number(!!a.online)).slice(0, 20);
  }, [mentionOpen, mentionQuery, members, user?.id]);

  // 文本变更：驱动 @ 检测
  const handleTextChange = useCallback((val: string) => {
    setText(val);
    const det = detectMention(val);
    if (det.open) {
      setMentionOpen(true);
      setMentionStartIdx(det.start!);
      setMentionQuery(det.query || '');
      setMentionActiveIndex(0);
    } else {
      setMentionOpen(false);
      setMentionStartIdx(null);
      setMentionQuery('');
      setMentionActiveIndex(0);
    }
    lastTextRef.current = val;
  }, [detectMention]);

  const selectMention = useCallback((mem: ChatRoomMemberDTO) => {
    if (!mentionOpen || mentionStartIdx == null) return;
    const name = mem.name || '匿名用户';
    const start = mentionStartIdx;
    const end = start + 1 + (mentionQuery?.length || 0);
    // 通过编辑器 API 在原位置替换，避免光标跳到首行
    try {
      const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;
      const inst = (isDesktop ? inputRefDesktop.current : inputRefMobile.current);
      inst?.replaceRangeByIndex(start, end, `@${name} `);
      inst?.focus();
    } catch {
      // 兜底：字符串替换
      const next = `${text.slice(0, start)}@${name} ${text.slice(end)}`;
      setText(next);
    }
    setMentionOpen(false);
    setMentionStartIdx(null);
    setMentionQuery('');
    setMentionActiveIndex(0);
  }, [mentionOpen, mentionStartIdx, mentionQuery, text]);

  // 轮询移除：成员与消息由 WebSocket 推送更新

  const sendMessage = async () => {
    if (!activeRoom) return;
    if (!text.trim()) {
      // 本地校验：允许弹 toast
      showToast.error('请输入消息内容');
      return;
    }
    try {
      setSending(true);
      const mentionedUserIds = extractMentionedUserIds(text);
      await ChatMessagesService.sendMessage(activeRoom.id, {
        content: text.trim(),
        clientMessageId: String(Date.now()),
        quotedMessageId: quotedForSend?.id,
        mentionedUserIds: mentionedUserIds.length > 0 ? mentionedUserIds : undefined,
      });
      setText('');
      setQuotedForSend(null);
      setMentionOpen(false);
      setMentionStartIdx(null);
      setMentionQuery('');
      setMentionActiveIndex(0);
    } catch (e) {
      console.error('发送消息失败', e);
    } finally {
      setSending(false);
    }
  };

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent) => {
    // 发送：Shift+Enter
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      void sendMessage();
      return;
    }
    if (!mentionOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setMentionActiveIndex((i) => Math.min((mentionCandidates.length || 1) - 1, i + 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setMentionActiveIndex((i) => Math.max(0, i - 1));
      return;
    }
    if (e.key === 'Enter' || e.key === 'Tab') {
      if (mentionCandidates.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        selectMention(mentionCandidates[Math.max(0, Math.min(mentionActiveIndex, mentionCandidates.length - 1))]);
      }
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setMentionOpen(false);
      setMentionStartIdx(null);
      setMentionQuery('');
      setMentionActiveIndex(0);
    }
  }, [mentionOpen, mentionCandidates, mentionActiveIndex, sendMessage, selectMention]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      const pageData = await ChatRoomsService.listRooms({ pageNum: 1, pageSize: 20 });
      setPage(pageData);
      setRooms(pageData?.records || []);
    } catch (e) {
      console.error('加载聊天室列表失败', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRooms();
  }, []);

  // 检查是否为管理员（显示房间受众选择）
  useEffect(() => {
    let cancelled = false;
    const fetchRole = async () => {
      try {
        const u = await UserService.getCurrentUser();
        if (!cancelled) setIsAdmin(u?.role === 'ADMIN');
      } catch { /* 静默失败 */ }
    };
    void fetchRole();
    return () => { cancelled = true; };
  }, []);

  const resetCreateForm = () => {
    setName('');
    setDescription('');
    setSelectedAudience(undefined);
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      // 本地校验错误：允许在组件层弹 toast
      showToast.error('请输入房间名称');
      return;
    }
    try {
      setCreating(true);
      await ChatRoomsService.createRoom({
        name: name.trim(),
        description: description.trim() || undefined,
        audience: isAdmin ? selectedAudience : undefined,
      });
      // 成功提示交由拦截器统一展示
      setIsCreateOpen(false);
      resetCreateForm();
      void loadRooms();
    } catch (e) {
      console.error('创建房间失败', e);
    } finally {
      setCreating(false);
    }
  };

  const headerTitle = useMemo(() => '聊天室', []);

  // 消息追加后自动滚动到底部
  useEffect(() => {
    if (!isChatOpen) return;
    try { bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); } catch { /* ignore */ }
  }, [messages.length, isChatOpen]);

  // 全局监听：房间被删除/解散（room_closed）
  useEffect(() => {
    let off: (() => void) | null = null;
    let offFallback: (() => void) | null = null;
    (async () => {
      try { await ChatRealtimeService.ensureConnected(); } catch { /* ignore */ }
      off = ChatRealtimeService.on('room_closed', async (frame) => {
        const p = (frame && frame.payload) || {};
        const payload = typeof p === 'string' ? (() => { try { return JSON.parse(p); } catch { return {}; } })() : p;
        const closedRoomId = String((payload as any).roomId || '');
        try { console.debug('[Chat] room_closed(global) recv payload=', payload, 'closedRoomId=', closedRoomId, 'activeRoomId=', activeRoom?.id, 'isChatOpen=', isChatOpen); } catch { /* ignore */ }
        if (!closedRoomId) return;
        if (isChatOpen && activeRoom && activeRoom.id === closedRoomId) {
          showToast.warning('房间已被删除');
          try { await ChatRealtimeService.unsubscribe(closedRoomId); } catch { /* ignore */ }
          setIsChatOpen(false);
        }
        setRooms((prev) => prev.filter((r) => r.id !== closedRoomId));
      });
      // 兜底：部分后端可能只发到通道 message
      offFallback = ChatRealtimeService.on('message', async (frame) => {
        try {
          if (!frame || String(frame.type || '').toLowerCase() !== 'room_closed') return;
          const p2 = frame.payload || {};
          const payload2 = typeof p2 === 'string' ? (() => { try { return JSON.parse(p2); } catch { return {}; } })() : p2;
          const closedRoomId2 = String((payload2 as any).roomId || '');
          if (!closedRoomId2) return;
          if (isChatOpen && activeRoom && activeRoom.id === closedRoomId2) {
            showToast.warning('房间已被删除');
            try { await ChatRealtimeService.unsubscribe(closedRoomId2); } catch { /* ignore */ }
            setIsChatOpen(false);
          }
          setRooms((prev) => prev.filter((r) => r.id !== closedRoomId2));
        } catch { /* ignore */ }
      });
    })();
    return () => { if (off) off(); if (offFallback) offFallback(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChatOpen, activeRoom?.id]);

  const openRoomChat = async (room: ChatRoomDTO) => {
    try {
      // 未加入先加入
      if (!room.joined) {
        await ChatRoomsService.joinRoom(room.id);
        // 刷新列表标记
        await loadRooms();
      }
      try { console.debug('[Chat] openRoomChat -> roomId=', room.id); } catch { /* ignore */ }
      setActiveRoom(room);
      setIsChatOpen(true);
      // 建立 WS 并订阅房间：用于在线判定与实时消息
      try {
        await ChatRealtimeService.ensureConnected();
        await ChatRealtimeService.subscribe(room.id);
        try { console.debug('[Chat] subscribed roomId=', room.id); } catch { /* ignore */ }
        // 清理旧监听
        wsOffRef.current.forEach((off) => { try { off(); } catch { /* ignore */ } });
        wsOffRef.current = [];
        // 监听消息推送
        const offMsg = ChatRealtimeService.on('message', (frame) => {
          if (!frame || String(frame.type).toLowerCase() !== 'message') return;
          const p = frame.payload || {};
          if (!p || p.roomId !== room.id) return;
          const incoming: ChatMessageDTO = {
            id: String(p.id || ''),
            roomId: String(p.roomId || ''),
            senderId: String(p.senderId || ''),
            content: String(p.content || ''),
            quotedMessageId: p.quotedMessageId || undefined,
            mentionedUserIds: p.mentionedUserIds || [],
            createTime: String(p.occurredAt || ''),
            senderName: p.senderName,
            senderAvatar: p.senderAvatar,
            senderTags: Array.isArray(p.senderTags) ? p.senderTags : [],
          };
          if (!incoming.id || msgIdSetRef.current.has(incoming.id)) return;
          msgIdSetRef.current.add(incoming.id);
          setMessages((prev) => [...prev, incoming]);
        });
        wsOffRef.current.push(offMsg);

        // 监听成员在线/离线
        const offPresence = ChatRealtimeService.on('message', async (frame) => {
          if (!frame || String(frame.type).toLowerCase() !== 'presence') return;
          const p = frame.payload || {};
          if (!p || p.roomId !== room.id || !p.userId) return;
          const uid = String(p.userId);
          const online = Boolean(p.online);
          setMembers((prev) => {
            const exists = prev.find((m) => m.userId === uid);
            if (exists) {
              return prev.map((m) => (m.userId === uid ? { ...m, online } : m));
            }
            return prev;
          });
          // 若该成员不在列表中，做一次兜底刷新成员列表（避免没有姓名/头像）
          try {
            if (!refreshingMembersRef.current) {
              refreshingMembersRef.current = true;
              const list = await ChatRoomsService.listMembers(room.id);
              setMembers(list);
            }
          } finally {
            refreshingMembersRef.current = false;
          }
        });
        wsOffRef.current.push(offPresence);

        // 监听被 @ 提及提醒（仅当前房间内提示）
        const offMention = ChatRealtimeService.on('message', (frame) => {
          if (!frame || String(frame.type).toLowerCase() !== 'mention') return;
          const p = frame.payload || {};
          if (!p || p.roomId !== room.id) return;
          try {
            const selfId = user?.id ? String(user.id) : '';
            if (p.mentionedUserId && selfId && String(p.mentionedUserId) !== selfId) return;
          } catch { /* ignore */ }
          const sender = (p.senderName || '有人') as string;
          const preview: string = String(p.content || '提到了你');
          const text = `@${sender} 提到了你：${preview}`.slice(0, 120);
          showToast.mention(text);
        });
        wsOffRef.current.push(offMention);
        // 房间关闭推送（与该订阅相关），直接在订阅上下文监听，避免时序与全局监听问题
        const offClosed = ChatRealtimeService.on('room_closed', async (frame) => {
          const raw = frame?.payload ?? {};
          const payload = typeof raw === 'string' ? (() => { try { return JSON.parse(raw); } catch { return {}; } })() : raw;
          const closedRoomId = String(payload?.roomId || '');
          try { console.debug('[Chat] room_closed(sub) recv payload=', payload, 'closedRoomId=', closedRoomId, 'currentRoomId=', room.id); } catch { /* ignore */ }
          if (!closedRoomId || closedRoomId !== room.id) return;
          showToast.warning('房间已被删除');
          try { await ChatRealtimeService.unsubscribe(closedRoomId); } catch { /* ignore */ }
          setIsChatOpen(false);
          setRooms((prev) => prev.filter((r) => r.id !== closedRoomId));
        });
        wsOffRef.current.push(offClosed);
      } catch (e) {
        console.error('聊天室 WS 连接/订阅失败', e);
      }
      // 不在入房时调用 visitRoom，先展示未读提示，待用户点击后再清零
      // 入房未读信息 + 消息加载（消息接口为纯分页，最新在前）
      setLoadingMessages(true);
      try {
        const info = await ChatRoomsService.getUnreadInfo(room.id);
        setUnreadInfo(info);
        // 先取第1页（最新）- 使用较大的 pageSize 减少请求次数
        let cur = await ChatMessagesService.pageMessages(room.id, { pageNum: 1, pageSize: 20 });
        let all: ChatMessageDTO[] = cur.records || [];
        // 若有未读锚点但不在当前页，继续翻页直到找到或到达上限（最多 10 页）
        const anchorId = info.firstUnreadId || undefined;
        if ((info.count || 0) > 0) setShowUnreadPill(true);
        let pageNum = 1;
        const maxPages = Math.min(10, Number(cur.pages || 1));
        while (anchorId && !all.some(m => m.id === anchorId) && pageNum < maxPages) {
          pageNum += 1;
          cur = await ChatMessagesService.pageMessages(room.id, { pageNum, pageSize: 20 });
          all = all.concat(cur.records || []);
        }
        // 后端按最新在前，这里按时间升序渲染，保持“底部是最新”的体验
        const asc = [...all].sort((a, b) => (new Date(a.createTime || 0).getTime() - new Date(b.createTime || 0).getTime()) || a.id.localeCompare(b.id));
        setMessages(asc);
        msgIdSetRef.current = new Set(asc.map((m) => m.id));
        // 记录当前已加载到第几页与总页数，用于上滑加载历史消息
        const totalPages = Number(cur.pages || 1);
        setMsgPageNum(pageNum);
        setMsgTotalPages(totalPages);
        msgPageNumRef.current = pageNum;
        msgTotalPagesRef.current = totalPages;
      } finally {
        setLoadingMessages(false);
      }
      // 加载成员列表（在线人数）
      try {
        const list = await ChatRoomsService.listMembers(room.id);
        setMembers(list);
      } catch (e) {
        console.error('加载房间成员失败', e);
      }
    } catch (e) {
      console.error('进入房间失败', e);
    }
  };

  // 轮询移除：成员与消息由 WebSocket 推送更新

  // 上滑加载更多历史消息：使用 IntersectionObserver 监听顶部哨兵
  useEffect(() => {
    // 等待消息加载完成，确保哨兵元素已渲染
    if (!isChatOpen || !activeRoom || loadingMessages) return;

    const observers: IntersectionObserver[] = [];
    let lastLoadTime = 0; // 防抖：记录上次加载时间
    const LOAD_THROTTLE_MS = 500; // 500ms 内不重复触发(增加防抖,避免快速滚动重复请求)

    // 延迟创建 Observer，确保 DOM 完全稳定
    const timerId = setTimeout(() => {
      const roots: Array<{ root: HTMLElement | null; sentinel: HTMLElement | null }> = [
        { root: msgScrollMobileRef.current as HTMLElement | null, sentinel: topSentinelMobileRef.current as HTMLElement | null },
        { root: msgScrollDesktopRef.current as HTMLElement | null, sentinel: topSentinelDesktopRef.current as HTMLElement | null },
      ];

      const makeObserver = (rootEl: HTMLElement | null, sentinelEl: HTMLElement | null) => {
        if (!rootEl || !sentinelEl) return;

        // 获取 Radix ScrollArea 的 viewport
        let viewport: HTMLElement | null = rootEl.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement | null;
        if (!viewport) viewport = (rootEl.firstElementChild as HTMLElement | null) || null;
        if (!viewport) return;

        const io = new IntersectionObserver(async (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;

            try {
              // 防抖检查
              const now = Date.now();
              if (now - lastLoadTime < LOAD_THROTTLE_MS) return;
              if (loadingOlderRef.current) return;

              const pn = msgPageNumRef.current;
              const tp = msgTotalPagesRef.current;
              if (!tp || pn >= tp) return; // 没有更多页

              lastLoadTime = now;
              loadingOlderRef.current = true;
              setLoadingOlder(true);

              // 记录滚动位置（用于恢复）
              const prevHeight = viewport!.scrollHeight;
              const prevTop = viewport!.scrollTop;

              const nextPage = pn + 1;
              const resp = await ChatMessagesService.pageMessages(activeRoom.id, { pageNum: nextPage, pageSize: 20 });
              const older = (resp.records || []).slice();

              // 按时间升序排列
              const olderAsc = older.sort((a, b) =>
                (new Date(a.createTime || 0).getTime() - new Date(b.createTime || 0).getTime()) ||
                a.id.localeCompare(b.id)
              );

              // 更新消息列表（去重并前置旧消息）
              setMessages((prev) => {
                const existing = new Set(prev.map(m => m.id));
                const newOlder = olderAsc.filter(m => !existing.has(m.id));
                // 同步更新去重 Set
                newOlder.forEach(m => msgIdSetRef.current.add(m.id));
                return [...newOlder, ...prev];
              });

              // 更新分页状态
              msgPageNumRef.current = nextPage;
              setMsgPageNum(nextPage);
              const totalPages = Number(resp.pages || msgTotalPagesRef.current || 1);
              msgTotalPagesRef.current = totalPages;
              setMsgTotalPages(totalPages);

              // 使用双重 RAF 确保 DOM 完全渲染后恢复滚动位置
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  try {
                    if (!viewport) return;
                    const delta = viewport.scrollHeight - prevHeight;
                    viewport.scrollTop = prevTop + delta;
                  } catch { /* ignore */ }
                });
              });
            } catch (error) {
              console.error('[Chat] 加载历史消息失败', error);
            } finally {
              loadingOlderRef.current = false;
              setLoadingOlder(false);
            }
          }
        }, {
          root: viewport,
          // rootMargin 向上扩展 500px，提前触发加载(用户滚动到消息列表约 1/3 位置时预加载)
          rootMargin: '500px 0px 0px 0px',
          threshold: 0.01
        });

        io.observe(sentinelEl);
        observers.push(io);
      };

      makeObserver(roots[0].root, roots[0].sentinel);
      makeObserver(roots[1].root, roots[1].sentinel);
    }, 150); // 延迟 150ms，确保 DOM 完全稳定

    return () => {
      clearTimeout(timerId);
      observers.forEach(o => {
        try { o.disconnect(); }
        catch { /* ignore */ }
      });
    };
  }, [isChatOpen, activeRoom?.id, loadingMessages]);

  // 提及候选浮层
  const renderMentionOverlay = () => {
    if (!mentionOpen || mentionCandidates.length === 0) return null;
    return (
      <div className="absolute bottom-[56px] left-2 z-[60] w-64 max-h-56 overflow-auto rounded-lg border bg-white shadow-lg">
        {mentionCandidates.map((mem, idx) => {
          const name = mem.name || '匿名用户';
          const active = idx === mentionActiveIndex;
          const initial = name.slice(0, 1).toUpperCase();
          return (
            <button
              key={mem.userId}
              className={cn('w-full flex items-center gap-2 px-2 py-1.5 text-left text-sm', active ? 'bg-emerald-50' : '')}
              onMouseDown={(e) => { e.preventDefault(); }}
              onClick={() => selectMention(mem)}
            >
              <Avatar size="sm">
                <AvatarImage src={mem.avatar || undefined} alt={name} />
                <AvatarFallback>{initial}</AvatarFallback>
              </Avatar>
              <span className="truncate">{name}</span>
              {mem.online && <span className="ml-auto h-2 w-2 rounded-full bg-emerald-500" />}
            </button>
          );
        })}
      </div>
    );
  };

  // 关闭/退出前，将已看到的最新消息作为锚点推进 lastSeen，避免退房后仍显示未读
  const markReadUpToEnd = async () => {
    try {
      if (!activeRoom) return;
      const last = messages[messages.length - 1];
      if (!last) return;
      await ChatRoomsService.visitRoom(activeRoom.id, { anchorId: last.id });
      setRooms((prev) => prev.map((r) => (r.id === activeRoom.id ? { ...r, unreadCount: 0 } : r)));
    } catch { /* ignore */ }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" onClick={() => setCtxMenu(s => ({ ...s, open: false }))}>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-6 w-6 text-honey-600" />
          <h2 className="text-xl font-semibold text-gray-900">{headerTitle}</h2>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          创建房间
        </Button>
      </div>

      {/* Room List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && (
          <div className="col-span-full text-sm text-warm-gray-500">加载中...</div>
        )}
        {!loading && rooms.length === 0 && (
          <div className="col-span-full text-sm text-warm-gray-500">暂时没有房间，快来创建一个吧～</div>
        )}
        {rooms.map((room) => (
          <Card
            key={room.id}
            className={cn(
              "hover:shadow-md transition-shadow h-full",
              room.joined ? "cursor-pointer" : "cursor-default"
            )}
            onClick={room.joined ? () => openRoomChat(room) : undefined}
          >
            <CardHeader>
              <CardTitle className="text-base">{room.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-warm-gray-600 space-y-2">
              {/* 预留简介区域高度，确保底部对齐 */}
              <div className="min-h-[60px]">
                {room.description && <p className="line-clamp-3">{room.description}</p>}
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-warm-gray-500">
                <span className="inline-flex items-center gap-1">
                  <UsersIcon className="h-3.5 w-3.5" />
                  成员 {Math.max(0, Number(room.memberCount || 0))}
                </span>
                <span className="inline-flex items-center">
                  {Number(room.unreadCount || 0) > 0 && room.joined && (
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-white bg-honey-500 text-[11px] min-w-[1.25rem]">
                      {Number(room.unreadCount) > 99 ? '99+' : String(room.unreadCount)}
                    </span>
                  )}
                  {!(Number(room.unreadCount || 0) > 0) && room.joined && (
                    <span className="text-emerald-600">已加入</span>
                  )}
                  {!room.joined && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); openRoomChat(room); }}
                      className="ml-1"
                    >
                      加入房间
                    </Button>
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Room Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetCreateForm(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>创建聊天室</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="room-name">房间名称</Label>
              <Input id="room-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="请输入房间名称" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="room-desc">房间简介</Label>
              <Textarea id="room-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="选填，简单描述房间主题" rows={3} />
            </div>

            {isAdmin && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>房间权限</Label>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <Select value={selectedAudience} onValueChange={(v) => setSelectedAudience(v as ChatRoomAudience)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="data-[state=open]:animate-none data-[state=closed]:animate-none">
                      <SelectItem value="PAID_ONLY">仅付费订阅用户</SelectItem>
                      <SelectItem value="FREE_ONLY">免费房间（有订阅即可进入）</SelectItem>
                      <SelectItem value="ALL_USERS">所有用户</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)} disabled={creating}>取消</Button>
            <Button onClick={handleCreate} disabled={creating}>{creating ? '创建中...' : '创建'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      <Dialog open={isChatOpen} onOpenChange={async (open) => {
        setIsChatOpen(open);
        if (!open) {
          // 退场时推进 lastSeen 到当前可见最后一条
          await markReadUpToEnd();
          if (activeRoom) {
            try { await ChatRealtimeService.unsubscribe(activeRoom.id); } catch { /* ignore */ }
          }
          // 清理 WS 监听
          wsOffRef.current.forEach((off) => { try { off(); } catch { /* ignore */ } });
          wsOffRef.current = [];
          setActiveRoom(null);
          setMessages([]);
        }
      }}>
        <DialogContent
          className="w-screen h-screen max-w-none max-h-none p-2 sm:p-4 flex flex-col"
          // 禁止按 ESC 关闭
          onEscapeKeyDown={(e) => { e.preventDefault(); }}
          // 禁止点击背景关闭
          onInteractOutside={(e) => { e.preventDefault(); }}
        >
          {/* Mobile: tabs layout */}
          <div className="md:hidden flex-1 flex flex-col overflow-hidden">
            <Tabs defaultValue="chat" className="h-full flex flex-col">
              <TabsList className="w-full flex-shrink-0">
                <TabsTrigger value="chat" className="flex-1">聊天</TabsTrigger>
                <TabsTrigger value="members" className="flex-1">成员</TabsTrigger>
              </TabsList>
              <TabsContent value="chat" className="flex-1 flex flex-col gap-3 overflow-hidden mt-0 data-[state=active]:flex min-h-0">
              <ScrollArea ref={msgScrollMobileRef} className="flex-1 rounded-md border bg-white/50 px-3 pb-3 pt-0 min-h-0">
                {/* Room name header inside chat window */}
                <div className="sticky top-0 z-10 -mx-3 px-3 py-2 bg-white/80 backdrop-blur-sm border-b border-gray-200 flex items-center justify-between">
                  <div className="text-sm font-medium truncate">{activeRoom?.name || '聊天室'}</div>
                </div>
                {/* 未读提示气泡（入房时） */}
                {showUnreadPill && unreadInfo && unreadInfo.count > 0 && (
                  <div className="sticky top-2 z-10 flex justify-center">
                    <button
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm text-sm"
                      onClick={() => {
                        const id = unreadInfo.firstUnreadId || '';
                        const el = msgRefs.current.get(id);
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          setShowUnreadPill(false);
                          // 点击后清零未读
                          (async () => {
                            try {
                              const last = messages[messages.length - 1];
                              await ChatRoomsService.visitRoom(activeRoom!.id, { anchorId: last?.id });
                              setRooms((prev) => prev.map((r) => (r.id === activeRoom!.id ? { ...r, unreadCount: 0 } : r)));
                            } catch { /* ignore */ }
                          })();
                        }
                      }}
                    >
                      <span className="rotate-180">^</span>
                      <span className="font-medium">{unreadInfo.count} 条新消息</span>
                    </button>
                  </div>
                )}
                    {loadingMessages ? (
                      <div className="text-sm text-warm-gray-500">加载中...</div>
                    ) : messages.length === 0 ? (
                      <div className="text-sm text-warm-gray-500">还没有消息，来说点什么吧～</div>
                    ) : (
                      <>
                      <div ref={topSentinelMobileRef} className="h-12 w-full" />
                      {loadingOlder && (
                        <div className="flex items-center justify-center py-2 text-xs text-warm-gray-400">
                          <span className="animate-pulse">正在加载历史消息...</span>
                        </div>
                      )}
                      <div className="space-y-4" onClick={() => setCtxMenu((s) => ({ ...s, open: false }))}>
                        {messages.map((m) => {
                          const name = m.senderName || '匿名用户';
                          const initial = name.slice(0, 1).toUpperCase();
                          const ts = m.createTime ? new Date(m.createTime).toLocaleString('zh-CN') : '';
                          // 不在消息内展示 tags，保持简洁；仅右侧成员列表展示
                          const isSelf = user?.id && m.senderId === user.id;
                          const isHighlighted = !!(ctxMenu.open && ctxMenu.message && ctxMenu.message.id === m.id);
                          return (
                            <div
                              key={m.id}
                              ref={(el) => { if (el) msgRefs.current.set(m.id, el); }}
                              className={cn('flex items-start gap-3', isSelf && 'flex-row-reverse')}
                            >
                              <Avatar size="sm">
                                <AvatarImage src={m.senderAvatar || undefined} alt={name} />
                                <AvatarFallback>{initial}</AvatarFallback>
                              </Avatar>
                              <div className={cn('flex-1 min-w-0 flex flex-col', isSelf && 'items-end')}>
                                <div className={cn('flex items-center gap-2', isSelf ? 'justify-end' : '')}>
                                  {!isSelf && (
                                    <span className="text-[13px] font-medium text-gray-900">{name}</span>
                                  )}
                                  <span className="text-[11px] text-warm-gray-400 ml-2">{ts}</span>
                                </div>
                                <div
                                  className={cn(
                                    'mt-1 inline-block px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words max-w-[85%] transition-all',
                                    isSelf ? 'bg-honey-500 text-white self-end' : 'bg-gray-50 text-gray-900 self-start',
                                    isHighlighted && 'ring-2 ring-emerald-300 shadow-sm'
                                  )}
                                  onContextMenu={(e) => { e.preventDefault(); setCtxMenu({ open: true, x: e.clientX, y: e.clientY, message: m }); }}
                                  onMouseEnter={(e) => { (e.currentTarget.classList as any).add('ring-1','ring-emerald-200'); }}
                                  onMouseLeave={(e) => { (e.currentTarget.classList as any).remove('ring-1','ring-emerald-200'); }}
                                >
                                  {!!m.quotedMessageId && (
                                    (() => {
                                      const refMsg = messages.find(mm => mm.id === m.quotedMessageId);
                                      const refName = refMsg?.senderName || '引用';
                                      const refText = (refMsg?.content || '查看引用消息');
                                      return (
                                        <div
                                          className={cn('mb-1 px-2 py-1 rounded-md text-xs border', isSelf ? 'bg-white/20 border-white/40' : 'bg-white/60 border-gray-200')}
                                          onClick={(ev) => {
                                            ev.stopPropagation();
                                            const el = msgRefs.current.get(m.quotedMessageId!);
                                            if (el) try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch { /* ignore */ }
                                          }}
                                        >
                                          <span className="opacity-70 mr-1">{refName}:</span>
                                          <span className="opacity-90 line-clamp-2 align-middle">{refText}</span>
                                        </div>
                                      );
                                    })()
                                  )}
                                  <SharedMarkdownRenderer
                                    content={m.content || ''}
                                    className={cn('prose-content chat-md', isSelf ? 'text-white' : 'text-gray-900')}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div ref={bottomRef} />
                      </>
                    )}
              </ScrollArea>

              {/* 引用提示条 */}
              {quotedForSend && (
                <div className="px-3 py-2 rounded-md border-l-4 border-emerald-400 bg-emerald-50 text-emerald-900 text-xs flex items-center justify-between gap-2 flex-shrink-0">
                  <div className="truncate">
                    <span className="opacity-80 mr-1">回复</span>
                    <span className="font-medium">{quotedForSend.senderName || '匿名'}</span>
                    <span className="opacity-60 mx-1">·</span>
                    <span className="truncate inline-block max-w-[50vw] align-middle">{(quotedForSend.content || '').slice(0, 80)}{(quotedForSend.content || '').length > 80 ? '…' : ''}</span>
                  </div>
                  <button className="shrink-0 text-emerald-700 hover:underline" onClick={() => setQuotedForSend(null)}>取消</button>
                </div>
              )}

              <div className="relative flex flex-col gap-2 flex-shrink-0">
                <MarkdownEditor
                  ref={inputRefMobile}
                  value={text}
                  onChange={handleTextChange}
                  height={120}
                  placeholder="输入消息，支持 Markdown"
                  toolbar={false}
                  enableFullscreen={false}
                  enableToc={false}
                  onKeyDown={handleInputKeyDown}
                  className="!rounded-md chat-toolbar-hidden"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {(activeRoom && activeRoom.joined) && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowLeaveConfirm(true)}
                        disabled={leaving}
                      >退出房间</Button>
                    )}
                    {(activeRoom && activeRoom.creatorId === user?.id) && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={deleting}
                      >删除房间</Button>
                    )}
                  </div>
                  <Button onClick={sendMessage} disabled={sending || !activeRoom}>发送</Button>
                </div>
                {renderMentionOverlay()}
              </div>
              </TabsContent>
              <TabsContent value="members" className="flex-1 flex flex-col overflow-hidden mt-0 data-[state=active]:flex min-h-0">
                <div className="min-h-0 rounded-md border bg-white/50 p-3 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-2 flex-shrink-0">
                    <div className="text-sm font-medium">成员</div>
                    <div className="text-xs text-warm-gray-500">在线 {members.filter(m => m.online).length} / 总 {members.length}</div>
                  </div>
                  <Separator className="mb-2 flex-shrink-0" />
                  <ScrollArea className="flex-1 min-h-0">
                    <div className="space-y-2 pr-2">
                      {members.map((mem) => {
                        const name = mem.name || '匿名用户';
                        const initial = name.slice(0, 1).toUpperCase();
                        const isOwner = mem.role === 'OWNER';
                        const online = !!mem.online;
                        return (
                          <div key={mem.userId} className="flex items-center gap-3 py-1">
                            <span className={cn('h-2 w-2 rounded-full', online ? 'bg-emerald-500' : 'bg-gray-300')} />
                            <Avatar size="sm">
                              <AvatarImage src={mem.avatar || undefined} alt={name} />
                              <AvatarFallback>{initial}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium truncate">{name}</div>
                              <div className="text-[11px] text-warm-gray-500">{isOwner ? '房主' : '成员'}</div>
                            </div>
                          </div>
                        );
                      })}
                      {members.length === 0 && (
                        <div className="text-xs text-warm-gray-500">暂无成员</div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Desktop: side-by-side layout */}
          <div className="hidden md:grid md:grid-cols-[1fr_300px] gap-4 flex-1 overflow-hidden">
            {/* Messages column */}
            <div className="flex flex-col gap-3 min-h-0">
              <ScrollArea ref={msgScrollDesktopRef} className="flex-1 rounded-md border bg-white/50 px-3 pb-3 pt-0 min-h-0">
                {/* Room name header inside chat window */}
                <div className="sticky top-0 z-10 -mx-3 px-3 py-2 bg-white/80 backdrop-blur-sm border-b border-gray-200 flex items-center justify-between">
                  <div className="text-sm font-medium truncate">{activeRoom?.name || '聊天室'}</div>
                </div>
                {/* 未读提示气泡（入房时，桌面同样显示） */}
                {showUnreadPill && unreadInfo && unreadInfo.count > 0 && (
                  <div className="sticky top-2 z-10 flex justify-center">
                    <button
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm text-sm"
                      onClick={() => {
                        const id = unreadInfo.firstUnreadId || '';
                        const el = msgRefs.current.get(id);
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          setShowUnreadPill(false);
                          // 点击后清零未读
                          (async () => {
                            try {
                              const last = messages[messages.length - 1];
                              await ChatRoomsService.visitRoom(activeRoom!.id, { anchorId: last?.id });
                              setRooms((prev) => prev.map((r) => (r.id === activeRoom!.id ? { ...r, unreadCount: 0 } : r)));
                            } catch { /* ignore */ }
                          })();
                        }
                      }}
                    >
                      <span className="rotate-180">^</span>
                      <span className="font-medium">{unreadInfo.count} 条新消息</span>
                    </button>
                  </div>
                )}
                    {loadingMessages ? (
                      <div className="text-sm text-warm-gray-500">加载中...</div>
                    ) : messages.length === 0 ? (
                      <div className="text-sm text-warm-gray-500">还没有消息，来说点什么吧～</div>
                    ) : (
                      <>
                      <div ref={topSentinelDesktopRef} className="h-12 w-full" />
                      {loadingOlder && (
                        <div className="flex items-center justify-center py-2 text-xs text-warm-gray-400">
                          <span className="animate-pulse">正在加载历史消息...</span>
                        </div>
                      )}
                      <div className="space-y-4" onClick={() => setCtxMenu((s) => ({ ...s, open: false }))}>
                        {messages.map((m) => {
                      const name = m.senderName || '匿名用户';
                      const initial = name.slice(0, 1).toUpperCase();
                      const ts = m.createTime ? new Date(m.createTime).toLocaleString('zh-CN') : '';
                      // 不在消息内展示 tags，保持简洁；仅右侧成员列表展示
                      const isSelf = user?.id && m.senderId === user.id;
                      const isHighlighted = !!(ctxMenu.open && ctxMenu.message && ctxMenu.message.id === m.id);
                      return (
                        <div
                          key={m.id}
                          ref={(el) => { if (el) msgRefs.current.set(m.id, el); }}
                          className={cn('flex items-start gap-3', isSelf && 'flex-row-reverse')}
                        > 
                          <Avatar size="sm">
                            <AvatarImage src={m.senderAvatar || undefined} alt={name} />
                            <AvatarFallback>{initial}</AvatarFallback>
                          </Avatar>
                          <div className={cn('flex-1 min-w-0 flex flex-col', isSelf && 'items-end')}> 
                            <div className={cn('flex items-center gap-2', isSelf ? 'justify-end' : '')}>
                              {!isSelf && (
                                <span className="text-[13px] font-medium text-gray-900">{name}</span>
                              )}
                              <span className="text-[11px] text-warm-gray-400 ml-2">{ts}</span>
                            </div>
                            <div
                              className={cn(
                                'mt-1 inline-block px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words max-w-[75%] transition-all',
                                isSelf ? 'bg-honey-500 text-white self-end' : 'bg-gray-50 text-gray-900 self-start',
                                isHighlighted && 'ring-2 ring-emerald-300 shadow-sm'
                              )}
                              onContextMenu={(e) => { e.preventDefault(); setCtxMenu({ open: true, x: e.clientX, y: e.clientY, message: m }); }}
                              onMouseEnter={(e) => { (e.currentTarget.classList as any).add('ring-1','ring-emerald-200'); }}
                              onMouseLeave={(e) => { (e.currentTarget.classList as any).remove('ring-1','ring-emerald-200'); }}
                            >
                              {!!m.quotedMessageId && (
                                (() => {
                                  const refMsg = messages.find(mm => mm.id === m.quotedMessageId);
                                  const refName = refMsg?.senderName || '引用';
                                  const refText = (refMsg?.content || '查看引用消息');
                                  return (
                                    <div
                                      className={cn('mb-1 px-2 py-1 rounded-md text-xs border', isSelf ? 'bg-white/20 border-white/40' : 'bg-white/60 border-gray-200')}
                                      onClick={(ev) => {
                                        ev.stopPropagation();
                                        const el = msgRefs.current.get(m.quotedMessageId!);
                                        if (el) try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch { /* ignore */ }
                                      }}
                                    >
                                      <span className="opacity-70 mr-1">{refName}:</span>
                                      <span className="opacity-90 line-clamp-2 align-middle">{refText}</span>
                                    </div>
                                  );
                                })()
                              )}
                              <div className={cn('prose-content chat-md', isSelf ? 'text-white' : 'text-gray-900')}>
                                <MarkdownEditor
                                  value={m.content || ''}
                                  onChange={() => {}}
                                  previewOnly
                                  height="auto"
                                  toolbar={false}
                                  enableFullscreen={false}
                                  enableToc={false}
                                  className="!border-none !shadow-none !bg-transparent p-0"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                      </div>
                      <div ref={bottomRef} />
                      </>
                    )}
              </ScrollArea>

              {/* 引用提示条 */}
              {quotedForSend && (
                <div className="mt-2 mb-1 px-3 py-2 rounded-md border-l-4 border-emerald-400 bg-emerald-50 text-emerald-900 text-xs flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="opacity-80 mr-1">回复</span>
                    <span className="font-medium">{quotedForSend.senderName || '匿名'}</span>
                    <span className="opacity-60 mx-1">·</span>
                    <span className="truncate inline-block max-w-[50vw] align-middle">{(quotedForSend.content || '').slice(0, 80)}{(quotedForSend.content || '').length > 80 ? '…' : ''}</span>
                  </div>
                  <button className="shrink-0 text-emerald-700 hover:underline" onClick={() => setQuotedForSend(null)}>取消</button>
                </div>
              )}
              <div className="relative flex flex-col gap-2">
                <MarkdownEditor
                  ref={inputRefDesktop}
                  value={text}
                  onChange={handleTextChange}
                  height={140}
                  placeholder="输入消息，支持 Markdown"
                  toolbar={false}
                  enableFullscreen={false}
                  enableToc={false}
                  onKeyDown={handleInputKeyDown}
                  className="!rounded-md chat-toolbar-hidden"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {(activeRoom && activeRoom.joined) && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowLeaveConfirm(true)}
                        disabled={leaving}
                      >退出房间</Button>
                    )}
                    {(activeRoom && activeRoom.creatorId === user?.id) && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={deleting}
                      >删除房间</Button>
                    )}
                  </div>
                  <Button onClick={sendMessage} disabled={sending || !activeRoom}>发送</Button>
                </div>
                {renderMentionOverlay()}
              </div>
            </div>

            {/* Members column */}
            <div className="min-h-0 rounded-md border bg-white/50 p-3 flex flex-col">
              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                <div className="text-sm font-medium">成员</div>
                <div className="text-xs text-warm-gray-500">在线 {members.filter(m => m.online).length} / 总 {members.length}</div>
              </div>
              <Separator className="mb-2 flex-shrink-0" />
              <ScrollArea className="flex-1 min-h-0">
                <div className="space-y-2 pr-2">
                  {members.map((mem) => {
                    const name = mem.name || '匿名用户';
                    const initial = name.slice(0, 1).toUpperCase();
                    const isOwner = mem.role === 'OWNER';
                    const online = !!mem.online;
                    return (
                      <div key={mem.userId} className="flex items-center gap-3 py-1">
                        <span className={cn('h-2 w-2 rounded-full', online ? 'bg-emerald-500' : 'bg-gray-300')} />
                        <Avatar size="sm">
                          <AvatarImage src={mem.avatar || undefined} alt={name} />
                          <AvatarFallback>{initial}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">{name}</div>
                          <div className="flex flex-wrap items-center gap-1 text-[11px] text-warm-gray-500">
                            <span>{isOwner ? '房主' : '成员'}</span>
                            {(Array.isArray(mem.tags) ? mem.tags : []).slice(0, 3).map((t, idx) => (
                              <Badge key={idx} variant="secondary" size="sm">{t}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {members.length === 0 && (
                    <div className="text-xs text-warm-gray-500">暂无成员</div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
      </DialogContent>
      </Dialog>

      {/* 退出房间二次确认 */}
      <AlertDialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认退出该房间？</AlertDialogTitle>
            <AlertDialogDescription>
              退出后你将不再接收该房间的实时消息，也不会统计未读。你仍可在列表中点击再次加入。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={leaving}>取消</AlertDialogCancel>
            <AlertDialogAction
              disabled={leaving}
              onClick={async () => {
                if (!activeRoom) return;
                try {
                  setLeaving(true);
                  // 退出前推进 lastSeen，避免退出即产生未读
                  await markReadUpToEnd();
                  try { await ChatRealtimeService.unsubscribe(activeRoom.id); } catch { /* ignore */ }
                  await ChatRoomsService.leaveRoom(activeRoom.id);
                  setRooms((prev) => prev.map((r) => (r.id === activeRoom.id ? { ...r, joined: false, unreadCount: 0 } : r)));
                  setShowLeaveConfirm(false);
                  setIsChatOpen(false);
                } finally {
                  setLeaving(false);
                }
              }}
            >
              确认退出
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 删除房间二次确认（仅房主可见） */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除该房间？</AlertDialogTitle>
            <AlertDialogDescription>
              删除后所有成员将无法再进入该房间，历史消息可能不再对成员可见。此操作仅房主可执行，请谨慎确认
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={async () => {
                if (!activeRoom) return;
                try {
                  setDeleting(true);
                  try { await ChatRealtimeService.unsubscribe(activeRoom.id); } catch { /* ignore */ }
                  await ChatRoomsService.deleteRoom(activeRoom.id);
                  setRooms((prev) => prev.filter((r) => r.id !== activeRoom.id));
                  setShowDeleteConfirm(false);
                  setIsChatOpen(false);
                } finally {
                  setDeleting(false);
                }
              }}
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 右键上下文菜单（仅：引用回复） - 使用 Portal 置顶 */}
      {ctxMenu.open && ctxMenu.message && createPortal(
        <div
          className="fixed z-[1000] min-w-[140px] rounded-xl border bg-white shadow-lg overflow-hidden"
          style={{ top: Math.max(8, Math.min(window.innerHeight - 120, ctxMenu.y + 4)), left: Math.max(8, Math.min(window.innerWidth - 160, ctxMenu.x + 4)) }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="block w-full px-4 py-2 text-left text-sm cursor-pointer transition-colors hover:bg-emerald-50 active:bg-emerald-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-300"
            onClick={() => {
              // 设置引用对象
              if (ctxMenu.message) setQuotedForSend(ctxMenu.message);
              // 先关闭菜单
              setCtxMenu({ open: false, x: 0, y: 0, message: null });
              // 聚焦可见的输入框
              try {
                // 与 tailwind md 断点保持一致（min-width: 768px）
                const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;
                const inst = (isDesktop ? inputRefDesktop.current : inputRefMobile.current);
                // 等一帧，等菜单关闭后的布局稳定再聚焦
                requestAnimationFrame(() => {
                  try { inst?.focus(); } catch { /* ignore */ }
                });
              } catch { /* ignore */ }
            }}
          >
            引用回复
          </button>
        </div>,
        document.body
      )}
    </div>
  );
};
