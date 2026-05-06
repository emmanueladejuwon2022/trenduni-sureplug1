import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { Clock, MapPin, Loader2, MessageSquare, TrendingUp, Users, ShieldCheck, Search, BadgeCheck, Sparkles, Filter, Activity, Zap, Star } from 'lucide-react';

interface Request {
  id: string;
  title: string;
  category: string;
  description: string;
  urgency: 'Urgent' | 'Today' | 'Flexible';
  userId: string;
  createdAt: any;
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

export default function DemandFeed({ 
  onStartChat, 
  onSelectVendor,
  userId
}: { 
  onStartChat?: (chatId: string, otherUserId: string, contextRequest?: Request) => void,
  onSelectVendor?: (vendor: any) => void,
  userId?: string
}) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [featuredVendors, setFeaturedVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [startingChat, setStartingChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    let unmounted = false;
    let reqLoaded = false;
    let venLoaded = false;
    
    const checkSubLoaded = () => {
      if (reqLoaded && venLoaded && !unmounted) {
        setLoading(false);
        setLoadingFeatured(false);
      }
    };

    const unsubRequests = api.requests.subscribe((data) => {
      if (unmounted) return;
      setRequests((data as any[]).sort((a,b) => {
         const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
         const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
         return tb - ta;
      }));
      reqLoaded = true;
      checkSubLoaded();
    });

    const unsubVendors = api.vendors.subscribe((data) => {
      if (unmounted) return;
      setFeaturedVendors((data as any[]).filter((v: any) => v.isFeatured));
      venLoaded = true;
      checkSubLoaded();
    });

    const to = setTimeout(() => {
      if (!unmounted && loading) {
        setLoading(false);
        setLoadingFeatured(false);
      }
    }, 3000);

    return () => {
      unmounted = true;
      window.removeEventListener('scroll', handleScroll);
      unsubRequests();
      unsubVendors();
      clearTimeout(to);
    };
  }, [userId]);

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          req.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || req.urgency === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleMessageClick = (requestUserId: string, request: Request, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!userId || !onStartChat) return;
    onStartChat('', requestUserId, request);
  };

  if (loading && requests.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
          <p className="text-slate-400 font-semibold text-sm animate-pulse tracking-wide uppercase">Connecting to campus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans text-slate-900">
      {/* Sticky Header Section */}
      <div className={`sticky top-0 z-30 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-white/20 pt-4 pb-4 scale-y-100' : 'bg-transparent pt-6 pb-2'}`}>
        <div className="px-4 md:px-8 max-w-7xl mx-auto flex flex-col gap-5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-1"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                  <Activity size={12} strokeWidth={3} /> Live Campus Network
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 font-display">
                Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Demands.</span>
              </h1>
              <p className="text-sm md:text-base text-slate-500 font-medium max-w-sm">
                See what students are requesting on campus right now in real-time.
              </p>
            </motion.div>

            {/* Global Search */}
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
                placeholder="Search demands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white pl-11 pr-4 py-3.5 rounded-2xl border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] ring-1 ring-inset ring-slate-100 focus:ring-2 focus:ring-inset focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400 font-medium text-sm"
              />
            </motion.div>
          </div>
          
           {/* Filters */}
           <div className="flex gap-2 w-full overflow-x-auto pb-2 pt-1 hide-scrollbar scroll-smooth snap-x">
              {['All', 'Urgent', 'Today', 'Flexible'].map(filter => {
                const isActive = activeFilter === filter;
                const gradClass = isActive 
                  ? (filter === 'Urgent' ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md shadow-red-200/50 scale-105' :
                     filter === 'Today' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-200/50 scale-105' :
                     filter === 'Flexible' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-200/50 scale-105' :
                     'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-200/50 scale-105')
                  : 'bg-white border text-slate-600 hover:bg-slate-50 border-slate-200 hover:scale-[1.02]';
                
                return (
                  <motion.button 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={filter} 
                    onClick={() => setActiveFilter(filter)}
                    className={`snap-start px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${gradClass}`}
                  >
                    {filter}
                  </motion.button>
                );
              })}
            </div>
        </div>
      </div>

      <main className="px-4 md:px-8 max-w-7xl mx-auto mt-6">
        {/* Top Quick Stats Row */}
        <motion.div 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="grid grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-white p-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center justify-center text-center group hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Zap size={20} className={requests.length > 0 ? 'fill-current' : ''} />
            </div>
            <span className="text-2xl font-black text-slate-900">{requests.length > 1000 ? (requests.length / 1000).toFixed(1) + 'k' : requests.length}</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">Live Requests</span>
          </div>
          <div className="bg-white p-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center justify-center text-center group hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Users size={20} className="fill-current" />
            </div>
            <span className="text-2xl font-black text-slate-900">1.2k+</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">Active Users</span>
          </div>
          <div className="bg-white p-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col items-center justify-center text-center group hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <ShieldCheck size={20} className="fill-current" />
            </div>
            <span className="text-2xl font-black text-slate-900">100%</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">Escrow Safe</span>
          </div>
        </motion.div>

        {/* Featured Plugs Section */}
        {!loadingFeatured && featuredVendors.length > 0 && (
          <div className="mb-10 relative bg-white p-6 rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Star size={20} className="text-amber-400 fill-amber-400" />
                Featured Plugs
              </h3>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
              {featuredVendors.map((vendor, index) => {
                const gradient = CATEGORY_GRADIENTS[vendor.category] || CATEGORY_GRADIENTS['Tech'];
                
                return (
                  <motion.div
                    key={vendor.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => onSelectVendor?.(vendor)}
                    className="snap-start flex-shrink-0 w-[240px] bg-slate-50/50 rounded-[24px] hover:bg-slate-50 border border-slate-100/50 overflow-hidden relative group cursor-pointer transition-all duration-300 flex flex-col"
                  >
                    <div className={`h-16 w-full bg-gradient-to-br ${gradient} p-4 relative`}>
                      <div className="absolute top-3 right-3 bg-white/80 backdrop-blur rounded-full p-1 shadow-sm">
                        <BadgeCheck size={14} className="text-blue-500 flex-shrink-0" />
                      </div>
                    </div>
                    
                    <div className="px-5 pb-5 flex-1 flex flex-col -mt-8 relative z-10">
                      <div className="w-16 h-16 bg-white rounded-[16px] p-1 shadow-md mb-3">
                        {vendor.photoUrl ? (
                           <img src={vendor.photoUrl} alt="Vendor" className="w-full h-full object-cover rounded-[12px]" />
                        ) : (
                          <div className={`w-full h-full rounded-[12px] bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-xl`}>
                            {vendor.category.substring(0,2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      
                      <h4 className="font-bold text-slate-900 truncate mb-1 text-lg group-hover:text-indigo-600 transition-colors">
                        {vendor.name || `${vendor.category} Expert`}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-4 flex-1">
                        {vendor.description}
                      </p>
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); onStartChat?.('', vendor.id); }}
                        className="w-full py-2.5 bg-white border border-slate-200 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                      >
                        Contact Plug
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Requests Masonry Grid */}
        <AnimatePresence mode='popLayout'>
          {filteredRequests.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-10 flex flex-col items-center justify-center p-12 bg-white rounded-[32px] border border-dashed border-slate-200 shadow-sm min-h-[30vh]"
            >
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Search size={32} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No demands match your filters</h3>
              <p className="text-slate-500 text-center max-w-md">Try adjusting your search terms or urgency to see active requests.</p>
              <button 
                onClick={() => { setSearchQuery(''); setActiveFilter('All'); }}
                className="mt-6 px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full font-semibold hover:bg-indigo-100 transition-colors"
              >
                Clear Filters
              </button>
            </motion.div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {filteredRequests.map((request, index) => {
                const urgencyTheme = 
                  request.urgency === 'Urgent' ? { border: 'border-t-red-500 hover:shadow-red-500/10', badge: 'bg-red-50 text-red-600 border-red-100/50' } : 
                  request.urgency === 'Today' ? { border: 'border-t-amber-500 hover:shadow-amber-500/10', badge: 'bg-amber-50 text-amber-600 border-amber-100/50' } : 
                  { border: 'border-t-emerald-500 hover:shadow-emerald-500/10', badge: 'bg-emerald-50 text-emerald-600 border-emerald-100/50' };

                return (
                  <motion.div
                    layout
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`break-inside-avoid bg-white p-6 rounded-[28px] shadow-sm border border-slate-100 border-t-4 ${urgencyTheme.border} hover:shadow-xl transition-all duration-300 flex flex-col group relative`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100/50">
                        {request.category}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border ${urgencyTheme.badge}`}>
                        {request.urgency}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-black text-slate-900 mb-3 leading-snug group-hover:text-indigo-600 transition-colors">
                      {request.title || request.description}
                    </h3>
                    
                    <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-1 font-medium bg-slate-50/80 border border-slate-100/50 p-4 rounded-2xl">
                      "{request.description}"
                    </p>

                    <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mt-auto pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1.5 rounded-md">
                          <MapPin size={12} className="text-slate-400" />
                          <span>UNILAG</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Clock size={12} className="text-slate-400" />
                          <span>{request.createdAt ? new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}</span>
                        </div>
                      </div>
                      
                      {userId && request.userId !== userId && (
                        <button 
                          onClick={(e) => handleMessageClick(request.userId, request, e)}
                          disabled={startingChat === request.userId}
                          className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors border border-indigo-100"
                          title="Message User"
                        >
                          {startingChat === request.userId ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <MessageSquare size={16} className="fill-current opacity-20" />
                          )}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
