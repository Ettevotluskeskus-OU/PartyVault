import { Smile, Heart, Clock, Palette, Camera, Users } from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
  options: string[];
  gradient: string;
  background: string;
  optionImages?: Record<string, string>;
  action?: () => void;
}

export const categories: Category[] = [
  {
    id: 'mood',
    name: 'Mood',
    icon: Smile,
    options: ['happy', 'romantic', 'silly', 'serious'],
    gradient: 'from-yellow-400 to-orange-500',
    background: 'https://images.unsplash.com/photo-1531747056595-07f6cbbe10ad?w=400',
    optionImages: {
      happy: 'https://images.unsplash.com/photo-1545315003-c5ad6226c272?w=400',
      romantic: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=400',
      silly: 'https://images.unsplash.com/photo-1534551767192-78b8dd45b51b?w=400',
      serious: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400'
    }
  },
  // ... rest of your categories ...
]; 