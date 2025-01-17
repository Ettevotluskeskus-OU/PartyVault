import React, { useState, useRef, useEffect } from 'react';
import { Share2, Trash2, Download, Camera, Play, Film, Image as ImageIcon, Check, X, Layers, Pause, SkipBack, SkipForward, Minimize2, Maximize2 } from 'lucide-react';
import { openDB } from 'idb';

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

export default function MediaGallery() {
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

  console.log('Filtered media:', filteredMedia);

  const slideshowMedia = selectionMode === 'auto' 
    ? filteredMedia 
    : filteredMedia.filter(item => selectedMedia.includes(item.id));

  const currentMedia = slideshowMedia[currentIndex];

  useEffect(() => {
    if (isPlaying) {
      const duration = currentMedia?.type === 'photo' ? 3000 : undefined;
      
      if (duration) {
        const timer = setTimeout(() => {
          handleNext();
        }, duration);
        return () => clearTimeout(timer);
      }
    }
  }, [isPlaying, currentIndex, currentMedia]);

  const handleShare = async (item: MediaItem) => {
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
        // Fallback for browsers that don't support Web Share API
        const shareUrl = item.url;
        window.open(shareUrl, '_blank');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      const db = await initDB();
      await db.delete('mediaItems', itemId);
      const updatedItems = await db.getAll('mediaItems');
      setMediaItems(updatedItems.sort((a, b) => b.timestamp - a.timestamp));
      setSelectedMedia(prev => prev.filter(id => id !== itemId));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleDownload = async (item: MediaItem) => {
    try {
      const response = await fetch(item.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `party-moment-${new Date(item.timestamp).toISOString()}.${
        item.type === 'photo' ? 'jpg' : 'mp4'
      }`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading:', error);
    }
  };

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
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-black p-4">
      {/* Media Type Selection */}
      <div className="flex justify-center gap-4 mb-6">
        {mediaTypeButtons.map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            onClick={() => setMediaType(type as any)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              mediaType === type
                ? 'bg-white/20 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/15'
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
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            selectionMode === 'auto'
              ? 'bg-white/20 text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/15'
          }`}
        >
          <Play className="w-5 h-5" />
          Play All
        </button>
        <button
          onClick={() => setSelectionMode('manual')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            selectionMode === 'manual'
              ? 'bg-white/20 text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/15'
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
            className={`relative aspect-square rounded-xl overflow-hidden group cursor-pointer ${
              selectionMode === 'manual' && selectedMedia.includes(item.id)
                ? 'ring-4 ring-white/50'
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
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare(item);
                }}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30"
              >
                <Share2 className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(item);
                }}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30"
              >
                <Download className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(item.id);
                }}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30"
              >
                <Trash2 className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Start Button */}
      <div className="fixed bottom-20 right-4">
        <button
          onClick={handleStartSlideshow}
          disabled={selectionMode === 'manual' && selectedMedia.length === 0}
          className="p-4 rounded-full bg-gradient-to-r from-yellow-400 to-pink-500 text-white shadow-lg hover:scale-110 transition-transform disabled:opacity-50 disabled:hover:scale-100"
        >
          <Play className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
} 