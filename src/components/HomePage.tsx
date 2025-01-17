import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Film, Play, Upload } from 'lucide-react';
import { openDB } from 'idb';
import { categories } from '../utils/categories';

interface MediaItem {
  id: string;
  url: string;
  type: 'photo' | 'video';
  timestamp: number;
  hashtags?: string[];
}

// Initialize IndexedDB
const initDB = async () => {
  return await openDB('partyCollageDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('mediaItems')) {
        db.createObjectStore('mediaItems', { keyPath: 'id' });
      }
    },
  });
};

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, hashtags: string[]) => void;
  type: 'photo' | 'video';
}

function UploadModal({ isOpen, onClose, onUpload, type }: UploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get all possible hashtags from categories
  const allHashtags = categories.flatMap(category => 
    category.options.map(option => `#${option}`)
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile, selectedTags);
      onClose();
    }
  };

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center ${isOpen ? '' : 'hidden'}`}>
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Upload {type}</h2>
        
        <input
          ref={fileInputRef}
          type="file"
          accept={type === 'photo' ? 'image/*' : 'video/*'}
          onChange={handleFileSelect}
          className="mb-4"
        />

        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Add hashtags</h3>
          <div className="flex flex-wrap gap-2">
            {allHashtags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTags(prev => 
                  prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                )}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedTags.includes(tag)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg"
            disabled={!selectedFile}
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HomePage({ onPhotoTaken }: { onPhotoTaken: (photo: string) => void }) {
  const navigate = useNavigate();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<'photo' | 'video'>('photo');

  // Load media items from IndexedDB
  useEffect(() => {
    const loadMediaItems = async () => {
      try {
        const db = await initDB();
        const items = await db.getAll('mediaItems');
        setMediaItems(items.sort((a, b) => b.timestamp - a.timestamp));
      } catch (error) {
        console.error('Error loading media items:', error);
      }
    };
    loadMediaItems();
  }, []);

  // Save media item to IndexedDB
  const saveMediaItem = async (item: MediaItem) => {
    try {
      const db = await initDB();
      await db.put('mediaItems', item);
      const allItems = await db.getAll('mediaItems');
      setMediaItems(allItems.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Error saving media item:', error);
      alert('Failed to save media. The file might be too large.');
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Compress the image before saving
        const compressedImage = await compressImage(file);
        const reader = new FileReader();
        reader.onloadend = async () => {
          const photoData = reader.result as string;
          onPhotoTaken(photoData);
          
          const newItem: MediaItem = {
            id: Date.now().toString(),
            url: photoData,
            type: 'photo',
            timestamp: Date.now()
          };
          
          await saveMediaItem(newItem);
        };
        reader.readAsDataURL(compressedImage);
      } catch (error) {
        console.error('Error handling photo upload:', error);
        alert('Failed to upload photo. Please try a smaller file.');
      }
    }
  };

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Compress video if possible
        const reader = new FileReader();
        reader.onloadend = async () => {
          const videoData = reader.result as string;
          
          const newItem: MediaItem = {
            id: Date.now().toString(),
            url: videoData,
            type: 'video',
            timestamp: Date.now()
          };
          
          await saveMediaItem(newItem);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error handling video upload:', error);
        alert('Failed to upload video. Please try a smaller file.');
      }
    }
  };

  // Image compression utility
  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Calculate new dimensions (max 1200px width/height)
        const maxSize = 1200;
        let width = img.width;
        let height = img.height;
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Could not compress image'));
            }
          },
          'image/jpeg',
          0.7 // compression quality
        );
      };
      img.onerror = () => reject(new Error('Could not load image'));
    });
  };

  useEffect(() => {
    if (isPlaying && mediaItems.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlideIndex((prev) => 
          prev === mediaItems.length - 1 ? 0 : prev + 1
        );
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isPlaying, mediaItems.length]);

  const toggleSlideshow = () => {
    setIsPlaying(!isPlaying);
  };

  const handleUpload = async (file: File, hashtags: string[]) => {
    try {
      const fileData = await (uploadType === 'photo' ? compressImage(file) : file);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const newItem: MediaItem = {
          id: Date.now().toString(),
          url: reader.result as string,
          type: uploadType,
          timestamp: Date.now(),
          hashtags
        };
        await saveMediaItem(newItem);
      };
      reader.readAsDataURL(fileData);
    } catch (error) {
      console.error('Error handling upload:', error);
      alert('Failed to upload. Please try again.');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      {/* Background animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 animate-pulse"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center min-h-screen p-4">
        {/* Slideshow/Video Collage Section */}
        <div className="w-full max-w-md aspect-square mb-8 rounded-2xl overflow-hidden shadow-2xl relative">
          {mediaItems.length > 0 ? (
            <>
              {mediaItems[currentSlideIndex].type === 'video' ? (
                <video
                  src={mediaItems[currentSlideIndex].url}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img 
                  src={mediaItems[currentSlideIndex].url}
                  alt="Slideshow"
                  className="w-full h-full object-cover"
                />
              )}
              <button
                onClick={toggleSlideshow}
                className="absolute bottom-4 right-4 p-4 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              >
                {isPlaying ? (
                  <Film className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white" />
                )}
              </button>
              <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
                {currentSlideIndex + 1} / {mediaItems.length}
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-black/20 backdrop-blur-lg"></div>
          )}
        </div>

        {/* Hidden file inputs */}
        <input
          type="file"
          ref={photoInputRef}
          onChange={handlePhotoUpload}
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={videoInputRef}
          onChange={handleVideoUpload}
          accept="video/*"
          className="hidden"
        />

        {/* Action Buttons */}
        <div className="space-y-4 w-full max-w-md">
          <button
            onClick={() => {
              setUploadType('photo');
              setShowUploadModal(true);
            }}
            className="w-full group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full"
          >
            <Upload className="w-6 h-6 mr-2" />
            Upload Photo
          </button>

          <button
            onClick={() => {
              setUploadType('video');
              setShowUploadModal(true);
            }}
            className="w-full group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
          >
            <Upload className="w-6 h-6 mr-2" />
            Upload Video
          </button>

          <button
            onClick={() => navigate('/slideshow')}
            className="w-full group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-full overflow-hidden shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            <Play className="w-6 h-6 mr-2" />
            View Slideshow
            <div className="absolute inset-0 bg-white/20 group-hover:animate-shine"></div>
          </button>
        </div>
      </div>

      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
        type={uploadType}
      />
    </div>
  );
} 