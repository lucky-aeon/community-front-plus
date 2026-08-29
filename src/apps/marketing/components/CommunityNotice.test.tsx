// @vitest-environment jsdom

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CommunityNotice } from './CommunityNotice';

describe('CommunityNotice', () => {
  it('explains the payment closure without promising permanent discontinuation', () => {
    render(<CommunityNotice />);

    expect(screen.getByRole('heading', { name: '敲鸭社区已停止新增付费' })).toBeTruthy();
    expect(screen.getByText('从即日起，敲鸭社区不再接受会员、课程及相关服务的新付款。')).toBeTruthy();
    expect(screen.getByText(/目前没有固定的更新计划/)).toBeTruthy();
    expect(screen.getByText(/未来如果有值得补充的新内容，仍可能继续更新/)).toBeTruthy();

    const bilibiliLink = screen.getByRole('link', { name: '前往 B 站' }) as HTMLAnchorElement;
    expect(bilibiliLink.href).toBe('https://space.bilibili.com/152686439');
    expect(bilibiliLink.target).toBe('_blank');
  });
});
