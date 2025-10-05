import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface VideoPlayerProps {
  src: string;                    // 视频源 URL
  poster?: string;                // 封面图片 URL
  autoPlay?: boolean;             // 自动播放，默认 false
  className?: string;             // 自定义样式类
  onReady?: () => void;          // 视频就绪回调
  onError?: (error: string) => void; // 错误回调
}

export interface VideoPlayerRef {
  videoElement: HTMLVideoElement | null;
}

/**
 * 视频播放器组件
 * 基于 HTML5 video 元素，提供基本的播放控制
 */
export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>((props, ref) => {
  const {
    src,
    poster,
    autoPlay = false,
    className,
    onReady,
    onError
  } = props;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<number | null>(null);

  // 暴露 video element 给父组件
  useImperativeHandle(ref, () => ({
    get videoElement() {
      return videoRef.current;
    }
  }));

  // 格式化时间（秒 -> mm:ss）
  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 播放/暂停切换
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(err => {
        console.error('播放失败', err);
        onError?.('播放失败');
      });
    }
  };

  // 静音切换
  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // 全屏切换
  const toggleFullscreen = () => {
    if (!videoRef.current) return;

    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // 进度条拖动
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newTime = parseFloat(e.target.value);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // 控制条自动隐藏
  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    if (isPlaying) {
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  // 监听视频事件
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => {
      setDuration(video.duration);
      onReady?.();
    };
    const handleError = () => {
      console.error('视频加载失败');
      onError?.('视频加载失败');
    };
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('error', handleError);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('error', handleError);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [onReady, onError]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        window.clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={cn(
        'relative bg-black rounded-lg overflow-hidden group',
        className
      )}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* 视频元素 */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        className="w-full h-full object-contain"
        playsInline
        onClick={togglePlay}
      />

      {/* 控制条 */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300',
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        )}
      >
        {/* 进度条 */}
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={handleProgressChange}
          className="w-full h-1 mb-3 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-honey-500"
        />

        {/* 控制按钮 */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            {/* 播放/暂停 */}
            <button
              onClick={togglePlay}
              className="hover:text-honey-400 transition-colors"
              aria-label={isPlaying ? '暂停' : '播放'}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>

            {/* 音量 */}
            <button
              onClick={toggleMute}
              className="hover:text-honey-400 transition-colors"
              aria-label={isMuted ? '取消静音' : '静音'}
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>

            {/* 时间显示 */}
            <div className="text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 全屏 */}
            <button
              onClick={toggleFullscreen}
              className="hover:text-honey-400 transition-colors"
              aria-label="全屏"
            >
              <Maximize className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 中央播放按钮（仅在暂停时显示） */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-honey-500/90 hover:bg-honey-600 rounded-full flex items-center justify-center transition-colors shadow-lg"
          aria-label="播放"
        >
          <Play className="h-8 w-8 text-white ml-1" />
        </button>
      )}
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
