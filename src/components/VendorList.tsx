import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, MapPin, Loader2, BadgeCheck, Search, TrendingUp, Sparkles, Filter, ChevronRight } from 'lucide-react';
import { api } from '../services/api';

interface Vendor {
  id: string;
  name?: string;
  photoUrl?: string;
  category: string;
  description: string;
  contact: string;
  isVerified?: boolean;
  isFeatured?: boolean;
  averageRating?: string;
  reviewCount?: number;
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  'Food': 'from-orange-100 via-amber-50 to-amber-100 border-amber-200 text-orange-700',
  'Laundry': 'from-blue-100 via-cyan-50 to-cyan-100 border-cyan-200 text-blue-700',
  'Logistics': 'from-indigo-100 via-purple-50 to-purple-100 border-indigo-200 text-indigo-700',
  'Tutoring': 'from-emerald-100 via-teal-50 to-teal-100 border-emerald-200 text-emerald-700',
  'Tech': 'from-slate-100 via-gray-50 to-gray-200 border-slate-300 text-slate-700',
  'Fashion': 'from-pink-100 via-rose-50 to-rose-100 border-pink-200 text-pink-700',
  'All': 'from-indigo-600 to-purple-600 text-white border-transparent'
};

const DEFAULT_GRADIENT = 'from-gray-100 via-slate-50 to-slate-100 border-gray-200 text-gray-700';

export default function VendorList({ onSelectVendor }: { onSelectVendor?: (vendor: Vendor) => void }) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  const categories = ['All', 'Food', 'Laundry', 'Logistics', 'Tutoring', 'Tech', 'Fashion'];

  useEffect(() => {
    let unmounted = false;
    
    // Check if we are scrolled to add shadow to header
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    const unsub = api.vendors.subscribe((data) => {
      if (unmounted) return;
      setVendors(data as Vendor[]);
      setLoading(false);
    });

    const to = setTimeout(() => {
      if (!unmounted && loading) setLoading(false);
    }, 3000);

    return () => {
      unmounted = true;
      window.removeEventListener('scroll', handleScroll);
      unsub();
      clearTimeout(to);
    };
  }, []);

  const filteredVendors = vendors.filter(v => {
    const matchesCategory = activeCategory === 'All' || v.category.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesSearch = v.category.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         v.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Featured at the top within category
  const sortedVendors = [...filteredVendors].sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans text-slate-900">
      
      {/* Dynamic Header Section */}
      <div className={`sticky top-0 z-30 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-white/20 pt-4 pb-4' : 'bg-transparent pt-6 pb-2'}`}>
        <div className="px-4 md:px-8 max-w-7xl mx-auto flex flex-col gap-5">
          
          {/* Header Title Grid */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-1"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <Sparkles size={12} /> The Campus Network
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 font-display">
                Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Experts.</span>
              </h1>
              <p className="text-sm md:text-base text-slate-500 font-medium max-w-sm">
                Connect with the highest-rated service providers on campus.
              </p>
            </motion.div>

            {/* Search Bar - Desktop and Mobile */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative w-full md:w-80 group"
            >
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={18} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Find a service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white pl-11 pr-4 py-3.5 rounded-2xl border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] ring-1 ring-inset ring-slate-100 focus:ring-2 focus:ring-inset focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400 font-medium text-sm"
              />
            </motion.div>
          </div>

          {/* Categories Pill Navigation */}
          <div className="flex gap-2 w-full overflow-x-auto pb-2 pt-1 hide-scrollbar scroll-smooth snap-x">
            {categories.map((cat, i) => {
              const isActive = activeCategory === cat;
              const gradClass = isActive ? CATEGORY_GRADIENTS['All'] : 'bg-white border-transparent text-slate-600 hover:bg-slate-50 ring-1 ring-slate-100 shadow-sm';
              
              return (
                <motion.button
                  key={cat}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setActiveCategory(cat)}
                  className={`snap-start flex items-center gap-2 whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all ${gradClass} ${isActive ? 'shadow-md shadow-indigo-200/50 scale-105' : 'hover:scale-[1.02]'}`}
                >
                  {cat}
                </motion.button>
              );
            })}
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <main className="px-4 md:px-8 max-w-7xl mx-auto mt-6">
        {loading ? (
          <div className="h-[50vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-indigo-500" size={40} />
            <p className="text-slate-400 font-semibold text-sm animate-pulse tracking-wide uppercase">Curating vendors...</p>
          </div>
        ) : (
          <AnimatePresence mode='popLayout'>
            {sortedVendors.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center p-12 mt-10 bg-white rounded-[32px] border border-dashed border-slate-200 shadow-sm min-h-[40vh]"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <Search size={32} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No vendors found</h3>
                <p className="text-slate-500 text-center max-w-md">Try adjusting your filters or search terms to find what you're looking for.</p>
                <button 
                  onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                  className="mt-6 px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full font-semibold hover:bg-indigo-100 transition-colors"
                >
                  Clear Filters
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedVendors.map((vendor, index) => {
                  const gradient = CATEGORY_GRADIENTS[vendor.category] || CATEGORY_GRADIENTS['Tech']; // Fallback
                  
                  return (
                    <motion.div
                      layout
                      key={vendor.id}
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        delay: index * 0.05 
                      }}
                      onClick={() => onSelectVendor?.(vendor)}
                      className="group cursor-pointer bg-white rounded-[28px] overflow-hidden shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-300 border border-slate-100 hover:border-indigo-100 relative flex flex-col"
                    >
                      {/* Top Banner Gradient */}
                      <div className={`h-24 w-full bg-gradient-to-br ${gradient} p-4 relative overflow-hidden`}>
                        {/* Abstract pattern element inside banner */}
                        <div className="absolute right-0 top-0 opacity-20 transform translate-x-1/4 -translate-y-1/4 scale-150">
                          <svg width="100" height="100" viewBox="0 0 100 100" fill="currentColor">
                            <circle cx="50" cy="50" r="50"></circle>
                          </svg>
                        </div>
                        
                        {/* Badges container */}
                        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                          <span className="inline-block bg-white/80 backdrop-blur text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg">
                            {vendor.category}
                          </span>
                          {vendor.isFeatured && (
                            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-1.5 rounded-full shadow-md tooltip" title="Featured Vendor">
                              <TrendingUp size={12} strokeWidth={3} />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Avatar Overlap */}
                      <div className="px-5 pb-5 flex-1 flex flex-col relative">
                        <div className="relative -mt-10 mb-3 flex justify-between items-end">
                          <div className="w-20 h-20 bg-white rounded-[18px] p-1 shadow-md shadow-slate-200/50 z-10">
                            {vendor.photoUrl ? (
                              <img src={vendor.photoUrl} alt="Vendor" className="w-full h-full object-cover rounded-[14px]" />
                            ) : (
                              <div className={`w-full h-full rounded-[14px] bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                                <span className="font-bold text-2xl">{vendor.category.substring(0,2).toUpperCase()}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Rating Pill */}
                          <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-xl mb-1 group-hover:bg-amber-50 group-hover:border-amber-100 transition-colors">
                            <Star size={14} className="text-amber-400 fill-amber-400" />
                            <span className="text-xs font-bold text-slate-700">{vendor.averageRating || 'New'}</span>
                            {vendor.reviewCount ? (
                              <span className="text-[10px] text-slate-400 font-medium">({vendor.reviewCount})</span>
                            ) : null}
                          </div>
                        </div>

                        {/* Text Content */}
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                            {vendor.name || `${vendor.category} Pro`}
                          </h3>
                          {vendor.isVerified && (
                             <BadgeCheck size={18} className="text-blue-500 shrink-0" />
                          )}
                        </div>
                        
                        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-4 flex-1 font-medium">
                          {vendor.description}
                        </p>

                        {/* Footer styling */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold px-2 py-1 bg-slate-50 rounded-md">
                            <MapPin size={12} /> Unilag
                          </div>
                          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors text-slate-400">
                             <ChevronRight size={16} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
