export interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  timestamp: number;
  tags: string[];
  mood?: string;
  dominantColor?: string;
  creator: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface Party {
  name: string;
  password: string;
  createdAt: number;
  expiresAt?: number;
}

export type SortingCriteria = 'mood' | 'color' | 'date' | 'type';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}