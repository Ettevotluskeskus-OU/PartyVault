export const storage = {
  save: (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      // Create backup for media
      if (key === 'media') {
        localStorage.setItem('media_backup', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Error saving to storage:', err);
    }
  },
  
  get: (key: string) => {
    try {
      const data = localStorage.getItem(key);
      // If media is missing but backup exists, restore from backup
      if (!data && key === 'media') {
        const backup = localStorage.getItem('media_backup');
        if (backup) {
          localStorage.setItem('media', backup);
          return JSON.parse(backup);
        }
      }
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error('Error reading from storage:', err);
      return null;
    }
  },
  
  append: (key: string, item: any) => {
    try {
      const existing = storage.get(key) || [];
      const updated = [...existing, item];
      storage.save(key, updated);
    } catch (err) {
      console.error('Error appending to storage:', err);
    }
  },

  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
      // Don't remove media backup when removing media
      if (key !== 'media') {
        localStorage.removeItem(key + '_backup');
      }
    } catch (err) {
      console.error('Error removing from storage:', err);
    }
  },

  deleteItem: (key: string, id: string) => {
    try {
      const items = storage.get(key) || [];
      const updatedItems = items.filter((item: any) => item.id !== id);
      storage.save(key, updatedItems);
      return updatedItems;
    } catch (err) {
      console.error('Error deleting item:', err);
      return null;
    }
  },

  addPartyContent: () => {
    const partyContent = [
      // Party Photos
      {
        id: `liz-party-${Date.now()}-1`,
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce',
        timestamp: Date.now() - 100000,
        tags: ['party', 'champagne', 'celebration', 'friends'],
        creator: 'Liz'
      },
      {
        id: `liz-party-${Date.now()}-2`,
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77',
        timestamp: Date.now() - 200000,
        tags: ['party', 'friends', 'celebration', 'dancing'],
        creator: 'Liz'
      },
      {
        id: `liz-party-${Date.now()}-3`,
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
        timestamp: Date.now() - 300000,
        tags: ['party', 'food', 'gourmet', 'celebration'],
        creator: 'Liz'
      },
      // Party Videos
      {
        id: `liz-party-video-${Date.now()}-1`,
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-friends-with-colored-smoke-bombs-4556-large.mp4',
        timestamp: Date.now() - 900000,
        tags: ['party', 'friends', 'celebration', 'fun'],
        creator: 'Liz'
      },
      {
        id: `liz-party-video-${Date.now()}-2`,
        type: 'video',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-group-of-friends-partying-happily-4640-large.mp4',
        timestamp: Date.now() - 1000000,
        tags: ['party', 'dancing', 'celebration', 'friends'],
        creator: 'Liz'
      }
    ];

    const existingMedia = storage.get('media') || [];
    const combinedMedia = [...existingMedia, ...partyContent];
    storage.save('media', combinedMedia);
    return combinedMedia;
  },

  init: () => {
    // Try to restore from backup first
    const mediaBackup = localStorage.getItem('media_backup');
    if (mediaBackup) {
      localStorage.setItem('media', mediaBackup);
    }

    // Only initialize if no data exists
    const existingParties = storage.get('parties');
    const existingMedia = storage.get('media');
    
    if (!existingParties || !existingMedia) {
      // Initialize Liz's party with 7-day expiration
      storage.save('parties', [{
        name: 'Liz',
        password: '123',
        createdAt: Date.now(),
        expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days from now
      }]);

      // Add party content
      storage.addPartyContent();
    }
  }
};