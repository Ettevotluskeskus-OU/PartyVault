import React, { useState } from 'react';
import { Search, Smile, Heart, Clock, Palette, Camera, Users, ArrowLeft, ChevronLeft } from 'lucide-react';
import { categories } from '../utils/categories';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  onSortingChange: (criteria: string) => void;
  onBack?: () => void;
}

interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
  options: string[];
  gradient: string;
  background: string;
  optionImages?: Record<string, string>;
  action?: () => void;
}

// For now, let's create a simple wrapper component that uses TagInput
export default function Moods() {
  const [tags, setTags] = useState<string[]>([]);

  const handleTagsChange = (newTags: string[]) => {
    setTags(newTags);
  };

  const handleSortingChange = (criteria: string) => {
    console.log('Sorting by:', criteria);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 pt-16 pb-20">
      <TagInput 
        tags={tags}
        onChange={handleTagsChange}
        onSortingChange={handleSortingChange}
      />
    </div>
  );
}

function TagInput({ tags, onChange, onSortingChange, onBack }: TagInputProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);

  const handleTagClick = (tag: string) => {
    if (tags.includes(tag)) {
      onChange(tags.filter(t => t !== tag));
    } else {
      onChange([...tags, tag]);
    }
  };

  const handleCategoryClick = (category: Category) => {
    if (category.action) {
      category.action();
    } else {
      setSelectedCategory(selectedCategory === category.id ? null : category.id);
      setIsFlipped(true);
    }
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setIsFlipped(false);
  };

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.options.some(option => option.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);

  return (
    <div className="h-full bg-dark p-3">
      {/* Search Bar */}
      <div className="mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search categories or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-700 bg-gray-800/50 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      <div className="h-[calc(100%-48px)] space-y-3 overflow-hidden">
        {/* Categories List */}
        <div className="flex flex-col gap-2">
          {selectedCategory ? (
            <button
              onClick={handleBack}
              className="relative group h-16 rounded-xl overflow-hidden transition-all duration-300"
            >
              <img 
                src={selectedCategoryData?.background}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${selectedCategoryData?.gradient} opacity-60`} />
              <div className="absolute inset-0 flex items-center p-3">
                <ChevronLeft className="w-5 h-5 text-white" />
                <span className="ml-3 text-sm font-medium text-white">Back to Categories</span>
              </div>
            </button>
          ) : (
            filteredCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className="relative group h-16 rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-[1.02]"
              >
                <img 
                  src={category.background}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-r ${category.gradient} opacity-60`} />
                <div className="absolute inset-0 flex items-center p-3">
                  <category.icon 
                    className={`w-5 h-5 text-white transition-transform duration-300 ${
                      isFlipped ? 'rotate-180' : ''
                    }`}
                  />
                  <span className="ml-3 text-sm font-medium text-white">{category.name}</span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Selected category options */}
        {selectedCategory && selectedCategoryData?.optionImages && (
          <div className="p-2 bg-gray-800/50 rounded-xl shadow-sm animate-fadeIn">
            <div className="grid grid-cols-2 gap-2">
              {selectedCategoryData.options.map((option, index) => (
                <button
                  key={option}
                  onClick={() => handleTagClick(option)}
                  className={`relative group aspect-[1.2] rounded-lg overflow-hidden transition-all duration-300 transform hover:scale-[1.02] ${
                    tags.includes(option)
                      ? 'ring-2 ring-primary'
                      : ''
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <img 
                    src={selectedCategoryData.optionImages[option]} 
                    alt={option}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/0" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <span className="text-xs font-medium text-white">
                      {option}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Selected tags */}
        {tags.length > 0 && (
          <div className="p-2 bg-gray-800/50 rounded-xl shadow-sm animate-fadeIn">
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag, index) => (
                <span
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className="px-2.5 py-1 bg-primary text-white rounded-full text-[10px] font-medium cursor-pointer hover:bg-[#ff9800] transition-all duration-300 transform hover:scale-105"
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 