import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Camera, Film, Play, User } from 'lucide-react';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/30 backdrop-blur-lg border-t border-white/10">
      <div className="max-w-md mx-auto flex justify-around items-center p-3">
        <button
          onClick={() => navigate('/home')}
          className={`flex flex-col items-center p-2 ${
            isActive('/home') ? 'text-yellow-400' : 'text-white/70 hover:text-white'
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs mt-1">Home</span>
        </button>

        <button
          onClick={() => navigate('/capture')}
          className={`flex flex-col items-center p-2 ${
            isActive('/capture') ? 'text-yellow-400' : 'text-white/70 hover:text-white'
          }`}
        >
          <Camera className="w-6 h-6" />
          <span className="text-xs mt-1">Capture</span>
        </button>

        <button
          onClick={() => navigate('/slideshow')}
          className={`flex flex-col items-center p-2 ${
            isActive('/slideshow') ? 'text-yellow-400' : 'text-white/70 hover:text-white'
          }`}
        >
          <Play className="w-6 h-6" />
          <span className="text-xs mt-1">Slideshow</span>
        </button>

        <button
          onClick={() => navigate('/video')}
          className={`flex flex-col items-center p-2 ${
            isActive('/video') ? 'text-yellow-400' : 'text-white/70 hover:text-white'
          }`}
        >
          <Film className="w-6 h-6" />
          <span className="text-xs mt-1">Video</span>
        </button>

        <button
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center p-2 ${
            isActive('/profile') ? 'text-yellow-400' : 'text-white/70 hover:text-white'
          }`}
        >
          <User className="w-6 h-6" />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
} 