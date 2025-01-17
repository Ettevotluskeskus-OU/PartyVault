import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Crown, ArrowRight, Loader, Clock } from 'lucide-react';

interface CreatePartyProps {
  onCreateParty: (partyName: string, password: string, expiresInDays?: number) => Promise<void>;
  error?: string;
}

export default function CreateParty({ onCreateParty, error }: CreatePartyProps) {
  const [partyName, setPartyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [expiresInDays, setExpiresInDays] = useState<number>(7); // Default to 7 days
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!partyName.trim() || !password.trim()) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (expiresInDays < 1) {
      setLocalError('Expiration days must be at least 1');
      return;
    }

    setLocalError('');
    setIsLoading(true);
    
    try {
      await onCreateParty(partyName.trim(), password.trim(), expiresInDays);
    } catch (err) {
      setLocalError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-blue-900 via-indigo-900 to-black perspective">
      {/* ... existing JSX code ... */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ... other form fields ... */}
        
        <div className="transform-gpu hover:translate-z-2 transition-transform duration-300">
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Clock className="w-5 h-5 text-white/30" />
            </div>
            <input
              type="number"
              min="1"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 shadow-inner-xl focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent transform-gpu transition-all duration-300 hover:bg-white/10"
              placeholder="Auto-delete after days"
            />
          </div>
          <p className="mt-1 text-sm text-white/50">Party will be automatically deleted after this many days</p>
        </div>

        {/* ... rest of the form ... */}
      </form>
    </div>
  );
}