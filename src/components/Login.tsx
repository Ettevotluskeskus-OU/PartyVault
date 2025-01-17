import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, ArrowRight, Loader } from 'lucide-react';

interface LoginProps {
  onLogin: (partyName: string, password: string) => Promise<void>;
  error?: string;
}

export default function Login({ onLogin, error }: LoginProps) {
  const navigate = useNavigate();
  const [partyName, setPartyName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!partyName.trim()) {
      setLocalError('Please enter a party name');
      return;
    }
    
    if (!password.trim()) {
      setLocalError('Please enter a password');
      return;
    }

    setLocalError('');
    setIsLoading(true);
    
    try {
      await onLogin(partyName.trim(), password.trim());
      navigate('/home');
    } catch (err) {
      setLocalError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-blue-900 via-indigo-900 to-black perspective">
      <div className="relative w-full max-w-md transform-gpu transition-transform duration-700 hover:rotate-y-2 hover:scale-105">
        {/* Background layers for 3D effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl transform-gpu -rotate-y-3 translate-z-12 blur-xl"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl transform-gpu rotate-y-3 translate-z-8 blur-lg"></div>
        
        {/* Main card */}
        <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden transform-gpu transition-transform duration-500">
          {/* Animated gradient border */}
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/50 via-purple-500/50 to-yellow-500/50 animate-gradient-x"></div>
          
          {/* Content container */}
          <div className="relative m-[1px] bg-black/40 backdrop-blur-xl rounded-2xl p-8">
            <div className="text-center mb-8 relative">
              {/* Crown with 3D effect */}
              <div className="relative inline-block transform-gpu hover:scale-110 transition-transform duration-300">
                <div className="absolute inset-0 bg-yellow-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <div className="relative w-20 h-20 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-xl transform-gpu hover:translate-z-4 transition-transform duration-300">
                  <Crown className="w-10 h-10 text-white drop-shadow-2xl" />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold mt-6 mb-2 bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-300 text-transparent bg-clip-text">
                Join Party
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Party name input */}
              <div className="transform-gpu hover:translate-z-2 transition-transform duration-300">
                <input
                  type="text"
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 shadow-inner-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent transform-gpu transition-all duration-300 hover:bg-white/10"
                  placeholder="Enter party name"
                  autoFocus
                />
              </div>

              {/* Password input */}
              <div className="transform-gpu hover:translate-z-2 transition-transform duration-300">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 shadow-inner-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent transform-gpu transition-all duration-300 hover:bg-white/10"
                  placeholder="Enter password"
                />
              </div>

              {(error || localError) && (
                <div className="text-red-300 text-sm text-center p-3 bg-red-500/10 rounded-xl border border-red-500/20 shadow-xl">
                  {localError || error}
                </div>
              )}

              <div className="space-y-4 pt-2">
                {/* Join Party button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl text-white bg-gradient-to-br from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 transform-gpu transition-all duration-300 hover:translate-z-4 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Join Party</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                {/* Create New Party button */}
                <button
                  type="button"
                  onClick={() => navigate('/create')}
                  className="w-full py-4 px-6 rounded-xl text-white border border-white/10 hover:bg-white/5 transform-gpu transition-all duration-300 hover:translate-z-2 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white/20 shadow-lg"
                >
                  Create New Party
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}