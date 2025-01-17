import React, { useState, useRef, useCallback } from 'react';
import { Camera, Share2, Hash, Copy, Check, X } from 'lucide-react';

interface PhotoCaptureProps {
  onPhotoTaken: (photo: string) => void;
  mood?: string;
}

interface MediaItem {
  id: string;
  url: string;
  type: 'photo' | 'video';
  timestamp: number;
  hashtags?: string[];
}

export default function PhotoCapture({ onPhotoTaken, mood }: PhotoCaptureProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customHashtag, setCustomHashtag] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera
  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please ensure you have granted camera permissions.');
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Take photo
  const capturePhoto = useCallback(() => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Mirror the image for front camera
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0);
        
        const photoData = canvas.toDataURL('image/jpeg');
        setPhoto(photoData);
        onPhotoTaken(photoData);
        
        // Generate hashtags and save to gallery
        const generatedHashtags = [
          '#partycollage',
          '#memories',
          `#party${new Date().getFullYear()}`,
          mood ? `#${mood.toLowerCase()}vibes` : '',
        ].filter(Boolean);
        
        setHashtags(generatedHashtags);
        saveToGallery(photoData, generatedHashtags);
        stopCamera();
      }
    }
  }, [onPhotoTaken, stopCamera, mood]);

  const saveToGallery = (photoData: string, hashtags: string[]) => {
    const newItem: MediaItem = {
      id: Date.now().toString(),
      url: photoData,
      type: 'photo',
      timestamp: Date.now(),
      hashtags: hashtags
    };

    // Get existing items
    const existingItems = localStorage.getItem('partyMediaItems');
    const items: MediaItem[] = existingItems ? JSON.parse(existingItems) : [];

    // Add new item
    items.unshift(newItem); // Add to beginning of array

    // Save back to localStorage
    localStorage.setItem('partyMediaItems', JSON.stringify(items));
  };

  const addCustomHashtag = () => {
    if (customHashtag) {
      const formatted = customHashtag.startsWith('#') ? 
        customHashtag : `#${customHashtag}`;
      setHashtags([...hashtags, formatted]);
      setCustomHashtag('');
    }
  };

  const removeHashtag = (index: number) => {
    setHashtags(hashtags.filter((_, i) => i !== index));
  };

  const copyHashtags = async () => {
    try {
      await navigator.clipboard.writeText(hashtags.join(' '));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy hashtags:', error);
    }
  };

  const handleShare = async () => {
    if (photo) {
      try {
        if (navigator.share) {
          const blob = await (await fetch(photo)).blob();
          const file = new File([blob], 'party-moment.jpg', { type: 'image/jpeg' });
          
          await navigator.share({
            title: 'My Party Moment',
            text: hashtags.join(' '),
            files: [file]
          });
        } else {
          setShowShareOptions(true);
        }
      } catch (error) {
        console.error('Error sharing:', error);
        setShowShareOptions(true);
      }
    }
  };

  return (
    <div className="space-y-4">
      {!photo ? (
        <div className="relative">
          {isCameraActive ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg scale-x-[-1]"
                style={{ maxHeight: '80vh' }}
              />
              
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                <button
                  onClick={capturePhoto}
                  className="p-6 rounded-full bg-white/20 backdrop-blur-lg hover:bg-white/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full border-4 border-white" />
                </button>
                
                <button
                  onClick={stopCamera}
                  className="p-4 rounded-full bg-white/20 backdrop-blur-lg hover:bg-white/30 transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </>
          ) : (
            <div className="text-center p-8">
              <button
                onClick={startCamera}
                className="p-4 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <Camera className="w-8 h-8" />
              </button>
              <p className="mt-4 text-white/70">Tap to start camera</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img src={photo} alt="Captured moment" className="rounded-lg shadow-lg" />
            <button
              onClick={() => {
                setPhoto(null);
                setHashtags([]);
                startCamera();
              }}
              className="absolute top-2 right-2 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          
          {/* Hashtag Section */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Hashtags</h3>
              <button
                onClick={copyHashtags}
                className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy All'}
              </button>
            </div>
            
            {/* Hashtag Pills */}
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => removeHashtag(index)}
                    className="hover:text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            
            {/* Add Custom Hashtag */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customHashtag}
                onChange={(e) => setCustomHashtag(e.target.value)}
                placeholder="Add custom hashtag"
                className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:border-white/40"
              />
              <button
                onClick={addCustomHashtag}
                className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:opacity-90 transition-opacity"
          >
            <Share2 className="w-5 h-5" />
            Share Moment
          </button>
        </div>
      )}

      {/* Fallback Share Options Modal */}
      {showShareOptions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-xl font-semibold text-white">Share Options</h3>
            {/* Add your preferred sharing options here */}
            <button
              onClick={() => setShowShareOptions(false)}
              className="w-full py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 