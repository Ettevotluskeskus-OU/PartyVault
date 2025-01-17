import React from 'react';
import { LogOut, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onLogout: () => void;
}

export default function Header({ onLogout }: HeaderProps) {
  const navigate = useNavigate();
  
  // Calculate party countdown with hours, minutes, seconds
  const [timeLeft, setTimeLeft] = React.useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  React.useEffect(() => {
    const calculateTimeLeft = () => {
      const partyDate = new Date();
      partyDate.setDate(partyDate.getDate() + 7);
      const difference = partyDate.getTime() - new Date().getTime();
      
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* App Name */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            PartyVault
          </h1>
        </div>

        {/* Right Side Content */}
        <div className="flex items-center gap-4">
          {/* Party Countdown */}
          <div className="flex items-center gap-2 bg-purple-100 px-3 py-1 rounded-full">
            <Timer className="w-4 h-4 text-purple-600" />
            <div className="flex gap-2 text-sm text-purple-600 font-medium">
              <span>{timeLeft.days}d</span>
              <span>{timeLeft.hours}h</span>
              <span>{timeLeft.minutes}m</span>
              <span>{timeLeft.seconds}s</span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="p-2 hover:bg-purple-100 rounded-full transition-colors"
          >
            <LogOut className="w-5 h-5 text-purple-600" />
          </button>
        </div>
      </div>
    </div>
  );
} 