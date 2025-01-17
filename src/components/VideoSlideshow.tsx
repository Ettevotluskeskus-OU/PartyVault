import React, { useState, useEffect, useCallback, useRef } from 'react';
import { storage } from '../utils/storage';
import { MediaItem } from '../types';
import { Play, Pause, SkipForward, SkipBack, Loader, Image as ImageIcon, Film, Layers, Trash2, Maximize2, Minimize2 } from 'lucide-react';

type MediaFilter = 'all' | 'photos' | 'videos';
type ViewMode = 'contain' | 'cover';

export default function VideoSlideshow() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('contain');
  const mediaRef = useRef<HTMLVideoElement | HTMLImageElement>(null);
  const controlsTimeoutRef = useRef<number>();
  const autoplayIntervalRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  // Load media from storage or from selected media if in slideshow mode
  useEffect(() => {
    try {
      const slideshowMedia = storage.get('slideshowMedia');
      const allMedia = slideshowMedia || storage.get('media') || [];
      if (allMedia.length === 0) {
        setError('No media found. Please add some photos or videos.');
      } else {
        setMedia(allMedia);
      }
    } catch (err) {
      setError('Failed to load media');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filteredMedia = media.filter(item => {
    switch (mediaFilter) {
      case 'photos':
        return item.type === 'photo';
      case 'videos':
        return item.type === 'video';
      default:
        return true;
    }
  });

  const currentMedia = filteredMedia[currentIndex];

  const handleNext = useCallback(() => {
    if (filteredMedia.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % filteredMedia.length);
    }
  }, [filteredMedia.length]);

  const handlePrevious = () => {
    if (filteredMedia.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + filteredMedia.length) % filteredMedia.length);
    }
  };

  const startAutoplay = () => {
    setCountdown(3);
    let count = 3;
    countdownIntervalRef.current = window.setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        setCountdown(null);
        clearInterval(countdownIntervalRef.current!);
        
        if (autoplayIntervalRef.current) {
          clearInterval(autoplayIntervalRef.current);
        }
        
        const interval = window.setInterval(() => {
          handleNext();
        }, 3000);
        
        autoplayIntervalRef.current = interval;
        setIsPlaying(true);
      }
    }, 1000);
  };

  const stopAutoplay = () => {
    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current);
      autoplayIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdown(null);
    setIsPlaying(false);
  };

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        window.clearTimeout(controlsTimeoutRef.current);
      }
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-luxury-dark flex items-center justify-center">
        <div className="relative transform-gpu hover:scale-105 transition-all duration-300">
          <div className="absolute inset-0 bg-luxury-gold opacity-20 rounded-full blur-xl animate-pulse"></div>
          <div className="relative p-8">
            <Loader className="w-12 h-12 text-white animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-luxury-dark flex items-center justify-center p-4">
        <div className="relative w-full max-w-md transform-gpu hover:scale-105 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl blur-xl"></div>
          <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-red-500/20">
            <div className="text-center text-white">
              <p className="mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-luxury-gold text-black rounded-xl hover:bg-yellow-400 transform-gpu transition-all duration-300 hover:scale-105 shadow-gold"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-luxury-dark perspective"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Animated luxury background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10 transform-gpu -rotate-y-3 translate-z-12 blur-xl animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 transform-gpu rotate-y-3 translate-z-8 blur-lg animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute inset-0 bg-party-gradient animate-gradient-x"></div>
      </div>

      {/* Countdown overlay */}
      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="relative">
            <div className="absolute inset-0 bg-luxury-gold rounded-full blur-3xl opacity-20 animate-pulse"></div>
            <div className="relative text-8xl font-bold text-gradient-gold transform-gpu transition-all duration-300 animate-bounce">
              {countdown}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="h-full flex flex-col relative z-10">
        {/* Media display */}
        <div className="flex-1 relative">
          {currentMedia && (
            <div className="absolute inset-0 flex items-center justify-center">
              {currentMedia.type === 'video' ? (
                <video
                  ref={mediaRef as React.RefObject<HTMLVideoElement>}
                  src={currentMedia.url}
                  className={`max-w-full max-h-full object-${viewMode}`}
                  autoPlay
                  onEnded={handleNext}
                  playsInline
                />
              ) : (
                <img
                  ref={mediaRef as React.RefObject<HTMLImageElement>}
                  src={currentMedia.url}
                  alt=""
                  className={`max-w-full max-h-full object-${viewMode}`}
                />
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <div 
          className={`absolute bottom-0 left-0 right-0 transition-transform duration-300 ${
            showControls ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6">
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={handlePrevious}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 transform-gpu transition-all duration-300 hover:scale-110"
                >
                  <SkipBack className="w-6 h-6 text-white" />
                </button>
                
                <button
                  onClick={() => isPlaying ? stopAutoplay() : startAutoplay()}
                  className="p-4 rounded-full bg-luxury-gold hover:bg-yellow-400 transform-gpu transition-all duration-300 hover:scale-110 shadow-gold"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-black" />
                  ) : (
                    <Play className="w-8 h-8 text-black" />
                  )}
                </button>
                
                <button
                  onClick={handleNext}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 transform-gpu transition-all duration-300 hover:scale-110"
                >
                  <SkipForward className="w-6 h-6 text-white" />
                </button>

                <button
                  onClick={() => setViewMode(prev => prev === 'contain' ? 'cover' : 'contain')}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 transform-gpu transition-all duration-300 hover:scale-110"
                >
                  {viewMode === 'contain' ? (
                    <Maximize2 className="w-6 h-6 text-white" />
                  ) : (
                    <Minimize2 className="w-6 h-6 text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}