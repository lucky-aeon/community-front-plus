// @vitest-environment jsdom

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Hero } from './Hero';
import { showToast } from '@shared/utils/toast';
import { apiClient, PublicCoursesService, PublicStatsService } from '@shared/services/api';

vi.mock('@shared/services/api', async () => {
  const actual = await vi.importActual<typeof import('@shared/services/api')>('@shared/services/api');
  return {
    ...actual,
    PublicCoursesService: {
      getPublicCoursesList: vi.fn(),
    },
    PublicStatsService: {
      getUsersTotalCount: vi.fn(),
    },
    apiClient: {
      get: vi.fn(),
    },
  };
});

vi.mock('@shared/utils/toast', () => ({
  showToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Hero', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(PublicCoursesService.getPublicCoursesList).mockResolvedValue({ total: 14 } as Awaited<ReturnType<typeof PublicCoursesService.getPublicCoursesList>>);
    vi.mocked(PublicStatsService.getUsersTotalCount).mockResolvedValue(1234);
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        data: {
          installCommand: 'curl -fsSL https://code.xhyovo.cn/install | sh',
          installCommands: {
            macosLinux: 'curl -fsSL https://code.xhyovo.cn/install | sh',
            windows: 'irm https://code.xhyovo.cn/install.ps1 | iex',
          },
        },
      },
    });
  });

  it('renders the qiaoya command card and copies the command', async () => {
    const user = userEvent.setup();

    render(<Hero />);

    expect(await screen.findByText('也可以让 AI 先替你逛一圈敲鸭社区')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'macOS / Linux' }));
    expect(screen.getByText('curl -fsSL https://code.xhyovo.cn/install | sh')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Windows' })).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Windows' }));
    expect(screen.getByText('irm https://code.xhyovo.cn/install.ps1 | iex')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: '复制 Windows qiaoya 一键安装命令' }));

    await waitFor(() => {
      expect(showToast.success).toHaveBeenCalledWith('命令已复制');
      expect(screen.getByRole('button', { name: '复制 Windows qiaoya 一键安装命令' }).textContent).toContain('已复制');
    });
  });
});
