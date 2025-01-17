import React, { useState, useRef, useEffect } from 'react';
import { storage } from '../utils/storage';
import { MediaItem } from '../types';
import { Play, Image as ImageIcon, Film, Check, X, Layers, Pause, SkipBack, SkipForward, Minimize2, Maximize2, Share2, Trash2 } from 'lucide-react';
import { openDB } from 'idb';

// Add initDB function
const initDB = async () => {
  return await openDB('partyCollageDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('mediaItems')) {
        db.createObjectStore('mediaItems', { keyPath: 'id' });
      }
    },
  });
};

export default function SlideshowSelection() {
  const [media, setMedia] = useState<MediaItem[]>(() => storage.get('media') || []);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState<'auto' | 'manual'>('auto');
  const [mediaType, setMediaType] = useState<'all' | 'photos' | 'videos'>('all');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [viewMode, setViewMode] = useState<'contain' | 'cover'>('contain');
  const videoRef = useRef<HTMLVideoElement>(null);
  const autoplayTimerRef = useRef<number>();

  const filteredMedia = media.filter(item => {
    switch (mediaType) {
      case 'photos':
        return item.type === 'photo';
      case 'videos':
        return item.type === 'video';
      default:
        return true;
    }
  });

  const slideshowMedia = selectionMode === 'auto' 
    ? filteredMedia 
    : filteredMedia.filter(item => selectedMedia.includes(item.id));

  const currentMedia = slideshowMedia[currentIndex];

  useEffect(() => {
    if (isPlaying) {
      const duration = currentMedia?.type === 'photo' ? 3000 : undefined;
      
      if (duration) {
        autoplayTimerRef.current = window.setTimeout(() => {
          handleNext();
        }, duration);
      }
    }

    return () => {
      if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current);
      }
    };
  }, [isPlaying, currentIndex, currentMedia]);

  const handleStartSlideshow = () => {
    if (slideshowMedia.length === 0) return;
    setCurrentIndex(0);
    setShowSlideshow(true);
    setIsPlaying(true);
  };

  const handleNext = () => {
    if (slideshowMedia.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % slideshowMedia.length);
    }
  };

  const handlePrevious = () => {
    if (slideshowMedia.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + slideshowMedia.length) % slideshowMedia.length);
    }
  };

  const toggleMediaSelection = (id: string) => {
    setSelectedMedia(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const mediaTypeButtons = [
    { type: 'all', icon: Layers, label: 'All Media' },
    { type: 'photos', icon: ImageIcon, label: 'Photos Only' },
    { type: 'videos', icon: Film, label: 'Videos Only' }
  ] as const;

  const handleShare = async (item: MediaItem, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      if (navigator.share) {
        const blob = await fetch(item.url).then(r => r.blob());
        const file = new File([blob], `party-moment.${item.type === 'photo' ? 'jpg' : 'mp4'}`, {
          type: item.type === 'photo' ? 'image/jpeg' : 'video/mp4'
        });

        await navigator.share({
          title: 'Party Moment',
          text: item.hashtags?.join(' ') || 'Check out this party moment!',
          files: [file]
        });
      } else {
        const shareUrl = item.url;
        window.open(shareUrl, '_blank');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDelete = async (itemId: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const db = await initDB();
        await db.delete('mediaItems', itemId);
        setMedia(prev => prev.filter(item => item.id !== itemId));
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  if (showSlideshow) {
    return (
      <div className="fixed inset-0 bg-luxury-dark flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10 transform-gpu -rotate-y-3 translate-z-12 blur-xl animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 transform-gpu rotate-y-3 translate-z-8 blur-lg animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute inset-0 bg-party-gradient animate-gradient-x"></div>
        </div>

        <div className="relative w-full h-full flex flex-col">
          {/* Media Display */}
          <div className="flex-1 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              {currentMedia?.type === 'video' ? (
                <video
                  ref={videoRef}
                  src={currentMedia.url}
                  className={`max-w-full max-h-full object-${viewMode}`}
                  autoPlay
                  onEnded={handleNext}
                  playsInline
                />
              ) : (
                <img
                  src={currentMedia?.url}
                  alt=""
                  className={`max-w-full max-h-full object-${viewMode}`}
                />
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6">
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => setShowSlideshow(false)}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 transform-gpu transition-all duration-300 hover:scale-110"
                >
                  <X className="w-6 h-6 text-white" />
                </button>

                <button
                  onClick={handlePrevious}
                  className="p-3 rounded-full bg-white/10 hover:bg-white/20 transform-gpu transition-all duration-300 hover:scale-110"
                >
                  <SkipBack className="w-6 h-6 text-white" />
                </button>
                
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
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
    );
  }

  return (
    <div className="min-h-screen bg-luxury-dark text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Media Type Selection */}
        <div className="flex justify-center gap-4">
          {mediaTypeButtons.map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => setMediaType(type)}
              className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 ${
                mediaType === type
                  ? 'bg-luxury-gold text-black shadow-gold'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </div>

        {/* Selection Mode */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setSelectionMode('auto')}
            className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 ${
              selectionMode === 'auto'
                ? 'bg-luxury-gold text-black shadow-gold'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <Play className="w-5 h-5" />
            Play All
          </button>
          <button
            onClick={() => setSelectionMode('manual')}
            className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 ${
              selectionMode === 'manual'
                ? 'bg-luxury-gold text-black shadow-gold'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <Check className="w-5 h-5" />
            Select Items
          </button>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map(item => (
            <div
              key={item.id}
              onClick={() => selectionMode === 'manual' && toggleMediaSelection(item.id)}
              className={`relative aspect-video rounded-xl overflow-hidden cursor-pointer group transform-gpu transition-all duration-300 hover:scale-105 ${
                selectionMode === 'manual' && selectedMedia.includes(item.id)
                  ? 'ring-4 ring-yellow-500'
                  : ''
              }`}
            >
              {item.type === 'video' ? (
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  playsInline
                />
              ) : (
                <img
                  src={item.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Overlay */}
              <div className={`absolute inset-0 flex items-center justify-center ${
                selectionMode === 'manual'
                  ? selectedMedia.includes(item.id)
                    ? 'bg-yellow-500/20'
                    : 'bg-black/40 group-hover:bg-black/20'
                  : 'bg-black/40'
              } transition-colors`}>
                <div className="absolute top-2 right-2">
                  {item.type === 'photo' ? (
                    <ImageIcon className="w-5 h-5 text-white" />
                  ) : (
                    <Film className="w-5 h-5 text-white" />
                  )}
                </div>
                
                {/* Action buttons */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handleShare(item, e)}
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                      <Share2 className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
                
                {selectionMode === 'manual' && selectedMedia.includes(item.id) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="w-12 h-12 text-yellow-500" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Start Button */}
        <div className="flex justify-center pt-8">
          <button
            onClick={handleStartSlideshow}
            disabled={selectionMode === 'manual' && selectedMedia.length === 0 || filteredMedia.length === 0}
            className="px-8 py-4 bg-luxury-gold text-black rounded-xl flex items-center gap-3 transform-gpu transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-gold"
          >
            <Play className="w-6 h-6" />
            Start Slideshow
            {mediaType !== 'all' && (
              <span className="text-sm">
                ({mediaType === 'photos' ? 'Photos Only' : 'Videos Only'})
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}