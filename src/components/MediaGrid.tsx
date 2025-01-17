import React, { useState } from 'react';
import { storage } from '../utils/storage';
import { MediaItem, SortingCriteria } from '../types';
import { Image, Film, Trash2 } from 'lucide-react';

export default function MediaGrid() {
  const [media, setMedia] = React.useState<MediaItem[]>([]);
  const [sortBy, setSortBy] = React.useState<SortingCriteria>('date');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  React.useEffect(() => {
    const storedMedia = storage.get('media') || [];
    setMedia(storedMedia);
  }, []);

  const getSortedMedia = () => {
    return [...media].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.timestamp - a.timestamp;
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });
  };

  const handleDelete = (id: string) => {
    const updatedMedia = storage.deleteItem('media', id);
    if (updatedMedia) {
      setMedia(updatedMedia);
    }
    setShowDeleteConfirm(null);
  };

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortingCriteria)}
          className="px-3 py-2 rounded-lg border border-gray-300"
        >
          <option value="date">Date</option>
          <option value="type">Type</option>
          <option value="mood">Mood</option>
          <option value="color">Color</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {getSortedMedia().map((item) => (
          <div
            key={item.id}
            className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100"
          >
            {item.type === 'photo' ? (
              <img
                src={item.url}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={item.url}
                className="w-full h-full object-cover"
                controls
              />
            )}
            <div className="absolute top-2 right-2">
              {item.type === 'photo' ? (
                <Image className="w-5 h-5 text-white" />
              ) : (
                <Film className="w-5 h-5 text-white" />
              )}
            </div>

            {/* Delete Button */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {showDeleteConfirm === item.id ? (
                <div className="bg-white p-4 rounded-lg shadow-lg">
                  <p className="text-sm text-gray-800 mb-3">Delete this item?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(item.id)}
                  className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transform hover:scale-110 transition-transform"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}