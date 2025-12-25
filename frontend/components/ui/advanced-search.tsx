import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon, CalendarIcon, MapPinIcon, CurrencyDollarIcon, UserGroupIcon, StarIcon, BoltIcon } from '@heroicons/react/24/solid';

interface SearchFilters {
  query: string;
  category: string;
  location: string;
  budget: string;
  experience: string;
  availability: string;
  rating: number;
  verified: boolean;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onSearch, onClose, isOpen }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    location: '',
    budget: '',
    experience: '',
    availability: '',
    rating: 0,
    verified: false
  });

  const categories = [
    'Development', 'Design', 'Marketing', 'Writing', 'Data Science', 'AI/ML', 'Blockchain', 'Mobile'
  ];

  const budgetRanges = [
    'Under $1,000', '$1,000 - $5,000', '$5,000 - $10,000', '$10,000 - $25,000', '$25,000+'
  ];

  const experienceLevels = ['Entry Level', 'Intermediate', 'Expert', 'Senior'];

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    onSearch(filters);
    onClose();
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      category: '',
      location: '',
      budget: '',
      experience: '',
      availability: '',
      rating: 0,
      verified: false
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-none border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8 pb-4 border-b-4 border-slate-900">
              <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tighter">
                <FunnelIcon className="w-8 h-8 text-emerald-600" />
                Advanced Search
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-none border-2 border-transparent hover:border-slate-900 transition-all"
              >
                <XMarkIcon className="w-6 h-6 text-slate-900" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Search Query */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">
                  Search Keywords
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    value={filters.query}
                    onChange={(e) => handleFilterChange('query', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-none bg-white text-slate-900 focus:ring-0 focus:border-slate-900 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-slate-400 font-medium"
                    placeholder="Enter keywords, skills, or job titles..."
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-none bg-white text-slate-900 focus:ring-0 focus:border-slate-900 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-medium appearance-none"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-none bg-white text-slate-900 focus:ring-0 focus:border-slate-900 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-slate-400 font-medium"
                    placeholder="City, State, or Remote"
                  />
                </div>
              </div>

              {/* Budget Range */}
              <div>
                <label className="block text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">
                  Budget Range
                </label>
                <select
                  value={filters.budget}
                  onChange={(e) => handleFilterChange('budget', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-none bg-white text-slate-900 focus:ring-0 focus:border-slate-900 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-medium appearance-none"
                >
                  <option value="">Any Budget</option>
                  {budgetRanges.map(range => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">
                  Experience Level
                </label>
                <select
                  value={filters.experience}
                  onChange={(e) => handleFilterChange('experience', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-none bg-white text-slate-900 focus:ring-0 focus:border-slate-900 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-medium appearance-none"
                >
                  <option value="">Any Level</option>
                  {experienceLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">
                  Minimum Rating
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => handleFilterChange('rating', rating)}
                      className={`p-2 rounded-none border-2 transition-all ${filters.rating >= rating
                          ? 'border-yellow-500 bg-yellow-50 text-yellow-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                          : 'border-slate-200 text-slate-300 hover:border-yellow-400 hover:text-yellow-400'
                        }`}
                    >
                      <StarIcon className="w-6 h-6" />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-bold text-slate-600">
                    {filters.rating > 0 ? `${filters.rating}+ stars` : 'Any rating'}
                  </span>
                </div>
              </div>

              {/* Verified Only */}
              <div className="md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={filters.verified}
                      onChange={(e) => handleFilterChange('verified', e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 border-2 border-slate-900 transition-all ${filters.verified ? 'bg-emerald-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white'}`}>
                      {filters.verified && <BoltIcon className="w-5 h-5 text-white" />}
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-900 flex items-center gap-2 group-hover:text-emerald-700">
                    <BoltIcon className="w-4 h-4 text-emerald-600" />
                    Verified professionals only
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t-4 border-slate-900">
              <button
                onClick={clearFilters}
                className="px-6 py-3 text-slate-500 font-bold hover:text-slate-900 hover:underline decoration-2 transition-colors uppercase tracking-wide"
              >
                Clear All Filters
              </button>
              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  className="px-6 py-3 border-2 border-slate-900 text-slate-900 font-bold uppercase tracking-wide rounded-none hover:bg-slate-100 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleSearch}
                  className="px-8 py-3 bg-emerald-600 border-2 border-slate-900 text-white font-black uppercase tracking-wide rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-emerald-500 transition-all"
                  whileTap={{ scale: 0.98 }}
                >
                  Apply Filters
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};