import React from 'react';
import { Smile, Music, Star, Heart } from 'lucide-react';

interface MoodSelectorProps {
  onMoodSelect: (mood: string) => void;
}

export default function MoodSelector({ onMoodSelect }: MoodSelectorProps) {
  const moods = [
    { icon: <Smile className="w-6 h-6" />, label: 'Happy', color: 'bg-yellow-400' },
    { icon: <Music className="w-6 h-6" />, label: 'Party', color: 'bg-purple-400' },
    { icon: <Heart className="w-6 h-6" />, label: 'Love', color: 'bg-red-400' },
    { icon: <Star className="w-6 h-6" />, label: 'Special', color: 'bg-blue-400' },
  ];

  return (
    <div className="flex gap-4 p-4">
      {moods.map((mood) => (
        <button
          key={mood.label}
          onClick={() => onMoodSelect(mood.label)}
          className={`${mood.color} p-3 rounded-full hover:scale-110 transition-transform`}
        >
          {mood.icon}
        </button>
      ))}
    </div>
  );
} 