import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Trash2, AlertTriangle, Timer } from 'lucide-react';
import { auth } from '../utils/auth';
import { Party } from '../types';
import { storage } from '../utils/storage';

export default function PartySettings() {
  const navigate = useNavigate();
  const [party, setParty] = useState<Party | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) {
      navigate('/');
      return;
    }

    const parties = storage.get('parties') || [];
    const userParty = parties.find((p: Party) => p.name === currentUser.username);
    setParty(userParty || null);
  }, [navigate]);

  useEffect(() => {
    if (party?.expiresAt) {
      const updateTimeLeft = () => {
        const now = Date.now();
        const timeRemaining = party.expiresAt! - now;
        
        if (timeRemaining <= 0) {
          setTimeLeft(null);
          auth.deleteParty(party.name);
          navigate('/');
          return;
        }

        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      };

      updateTimeLeft();
      const interval = setInterval(updateTimeLeft, 1000); // Update every second
      return () => clearInterval(interval);
    }
  }, [party, navigate]);

  const handleDeleteParty = () => {
    if (!party) return;
    auth.deleteParty(party.name);
    navigate('/');
  };

  if (!party) return null;

  return (
    <div className="max-w-lg mx-auto space-y-8 p-6">
      {/* Countdown Timer */}
      <div className="bg-black/20 backdrop-blur-xl rounded-xl p-6 border border-yellow-500/20">
        <h2 className="text-xl font-bold text-gradient-gold mb-4 flex items-center gap-2">
          <Timer className="w-6 h-6" />
          Party Countdown
        </h2>
        {timeLeft ? (
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-500">{timeLeft.days}</div>
              <div className="text-xs text-white/70">Days</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-500">{timeLeft.hours}</div>
              <div className="text-xs text-white/70">Hours</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-500">{timeLeft.minutes}</div>
              <div className="text-xs text-white/70">Minutes</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-500">{timeLeft.seconds}</div>
              <div className="text-xs text-white/70">Seconds</div>
            </div>
          </div>
        ) : (
          <div className="text-center text-red-500">
            Party has expired
          </div>
        )}
      </div>

      {/* Current Status */}
      <div className="bg-black/20 backdrop-blur-xl rounded-xl p-6 border border-white/10">
        <h2 className="text-xl font-bold text-gradient-gold mb-4">Party Status</h2>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-white/70">Party Name:</span>
            <span className="text-white font-medium">{party.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/70">Created:</span>
            <span className="text-white font-medium">
              {new Date(party.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/70">Expires:</span>
            <span className="text-white font-medium">
              {new Date(party.expiresAt!).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Delete Party */}
      <div className="bg-black/20 backdrop-blur-xl rounded-xl p-6 border border-red-500/20">
        <h2 className="text-xl font-bold text-red-500 mb-4">Danger Zone</h2>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full px-6 py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500/20 transform-gpu transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Delete Party Now
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="w-5 h-5" />
              <p className="text-sm">This action cannot be undone!</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteParty}
                className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transform-gpu transition-all duration-300 hover:scale-105"
              >
                Yes, Delete Party
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transform-gpu transition-all duration-300 hover:scale-105"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}