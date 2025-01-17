import React from 'react';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-blue-900 via-indigo-900 to-black">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 animate-pulse"></div>
        <div className="confetti-container absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            >
              <div
                className="w-2 h-2 rotate-45 bg-white opacity-60"
                style={{
                  backgroundColor: ['#FFD700', '#FF69B4', '#00CED1', '#FFA500'][
                    Math.floor(Math.random() * 4)
                  ],
                }}
              ></div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 animate-fade-in">
          Create Amazing Party Collages
        </h1>
        
        <div className="space-y-4">
          <button
            onClick={() => navigate('/login')}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full overflow-hidden shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl animate-bounce-subtle"
          >
            <Sparkles className="w-5 h-5 mr-2 animate-sparkle" />
            Join Existing Party
            <div className="absolute inset-0 bg-white/20 group-hover:animate-shine"></div>
          </button>

          <button
            onClick={() => navigate('/create')}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-br from-purple-500 to-pink-500 rounded-full overflow-hidden shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            Create New Party
            <div className="absolute inset-0 bg-white/20 group-hover:animate-shine"></div>
          </button>
        </div>

        <p className="mt-6 text-xl text-white/90 max-w-md animate-fade-in-delayed">
          Create amazing collages effortlessly – just snap, share, and enjoy!
        </p>
      </div>
    </div>
  );
} 