import React, { useState, useRef, useEffect } from 'react';
import { Share2, Trash2, Download, Camera, Play, Film, Image as ImageIcon, Check, X, Layers, Pause, SkipBack, SkipForward, Minimize2, Maximize2 } from 'lucide-react';
import { openDB } from 'idb';
import Header from './Header';
import { useAuth } from '../hooks/useAuth';

interface MediaItem {
  id: string;
  url: string;
  type: 'photo' | 'video';
  timestamp: number;
  hashtags?: string[];
}

const initDB = async () => {
  return await openDB('partyCollageDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('mediaItems')) {
        db.createObjectStore('mediaItems', { keyPath: 'id' });
      }
    },
  });
};

export default function Slideshow() {
  const { logout } = useAuth();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState<'auto' | 'manual'>('auto');
  const [mediaType, setMediaType] = useState<'all' | 'photos' | 'videos'>('all');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [viewMode, setViewMode] = useState<'contain' | 'cover'>('contain');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const loadMediaItems = async () => {
      try {
        const db = await initDB();
        const items = await db.getAll('mediaItems');
        console.log('Loaded media items:', items);
        setMediaItems(items.sort((a, b) => b.timestamp - a.timestamp));
      } catch (error) {
        console.error('Error loading media items:', error);
      }
    };
    loadMediaItems();
  }, []);

  const filteredMedia = mediaItems.filter(item => {
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

  if (showSlideshow) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-200/30 to-blue-200/30 transform-gpu -rotate-y-3 translate-z-12 blur-xl animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/30 to-orange-200/30 transform-gpu rotate-y-3 translate-z-8 blur-lg animate-pulse" style={{ animationDelay: '1s' }}></div>
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
                  controls
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
                {currentMedia?.type === 'photo' && (
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-4 rounded-full bg-white/20 hover:bg-white/30 transform-gpu transition-all duration-300 hover:scale-110"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-white" />
                    ) : (
                      <Play className="w-8 h-8 text-white" />
                    )}
                  </button>
                )}
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
    <>
      <Header onLogout={logout} />
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 pt-16 pb-20 px-6">
        {/* Media Type Selection */}
        <div className="flex justify-center gap-4 mb-6">
          {mediaTypeButtons.map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => setMediaType(type as any)}
              className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 ${
                mediaType === type
                  ? 'bg-white shadow-lg text-purple-600 font-medium'
                  : 'bg-white/50 text-purple-500/70 hover:bg-white/70'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </div>

        {/* Selection Mode */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setSelectionMode('auto')}
            className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 ${
              selectionMode === 'auto'
                ? 'bg-white shadow-lg text-purple-600 font-medium'
                : 'bg-white/50 text-purple-500/70 hover:bg-white/70'
            }`}
          >
            <Play className="w-5 h-5" />
            Play All
          </button>
          <button
            onClick={() => setSelectionMode('manual')}
            className={`px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300 ${
              selectionMode === 'manual'
                ? 'bg-white shadow-lg text-purple-600 font-medium'
                : 'bg-white/50 text-purple-500/70 hover:bg-white/70'
            }`}
          >
            <Check className="w-5 h-5" />
            Select Items
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              onClick={() => selectionMode === 'manual' && toggleMediaSelection(item.id)}
              className={`relative aspect-square rounded-xl overflow-hidden group cursor-pointer transform-gpu transition-all duration-300 hover:scale-105 ${
                selectionMode === 'manual' && selectedMedia.includes(item.id)
                  ? 'ring-4 ring-purple-400'
                  : ''
              }`}
            >
              {item.type === 'photo' ? (
                <img
                  src={item.url}
                  alt="Party moment"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="relative w-full h-full">
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    onMouseOver={(e) => e.currentTarget.play()}
                    onMouseOut={(e) => e.currentTarget.pause()}
                  />
                  <div className="absolute top-2 right-2 bg-black/50 p-1 rounded-md">
                    <Film className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
              
              {/* Overlay */}
              <div className={`absolute inset-0 flex items-center justify-center ${
                selectionMode === 'manual'
                  ? selectedMedia.includes(item.id)
                    ? 'bg-purple-400/20'
                    : 'bg-black/20 group-hover:bg-black/10'
                  : 'bg-black/20'
              } transition-colors`}>
                {selectionMode === 'manual' && selectedMedia.includes(item.id) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="w-12 h-12 text-purple-400" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Start Button */}
        <div className="fixed bottom-20 right-4">
          <button
            onClick={handleStartSlideshow}
            disabled={selectionMode === 'manual' && selectedMedia.length === 0}
            className="p-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-lg hover:scale-110 transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            <Play className="w-6 h-6" />
          </button>
        </div>
      </div>
    </>
  );
} 