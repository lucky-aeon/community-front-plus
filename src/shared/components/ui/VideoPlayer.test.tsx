// @vitest-environment jsdom

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { VideoPlayer } from './VideoPlayer';

describe('VideoPlayer', () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function mockPlay(this: HTMLMediaElement) {
      Object.defineProperty(this, 'paused', {
        configurable: true,
        value: false,
      });
      fireEvent(this, new Event('play'));
      return Promise.resolve();
    });

    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function mockPause(this: HTMLMediaElement) {
      Object.defineProperty(this, 'paused', {
        configurable: true,
        value: true,
      });
      fireEvent(this, new Event('pause'));
    });
  });

  it('supports toggling playback from the player surface by click and space', async () => {
    const user = userEvent.setup();

    render(<VideoPlayer src="https://example.com/demo.mp4" />);

    const surface = screen.getByRole('button', { name: '播放视频' });

    await user.click(surface);

    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);

    surface.focus();
    await user.keyboard('[Space]');

    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(1);
  });
});
