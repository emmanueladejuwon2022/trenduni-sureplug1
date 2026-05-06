import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Store, Loader2, Plus, ChevronRight, Zap, Sparkles } from 'lucide-react';
import { api } from '../services/api';

interface Service {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface ServicePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorId: string;
  onSelect: (service: Service) => void;
}

export default function ServicePickerModal({ isOpen, onClose, vendorId, onSelect }: ServicePickerModalProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isOpen || !vendorId) return;

    const fetchServices = async () => {
      setLoading(true);
      try {
        const data = await api.vendors.get(vendorId) as any;
        setServices(data.services || []);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [isOpen, vendorId]);

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           onClick={onClose}
           className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
        />
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          className="bg-white w-full max-w-lg rounded-t-[3rem] sm:rounded-[3rem] overflow-hidden shadow-2xl relative z-10 max-h-[85vh] flex flex-col border border-white"
        >
          <div className="p-8 border-b border-slate-50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                  <Store size={26} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1.5">Select Service</h3>
                  <div className="flex items-center gap-1.5">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                     <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] leading-none">Verified Vendor Inventory</p>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-2xl hover:bg-slate-50 transition-all active:scale-90">
                <X size={24} strokeWidth={3} />
              </button>
            </div>

            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What do you need?"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-[24px] text-sm font-bold outline-none focus:border-indigo-600/10 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/30">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} strokeWidth={2} />
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Synchronizing Shop...</p>
              </div>
            ) : filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredServices.map(service => (
                  <motion.button
                    key={service.id}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect(service)}
                    className="w-full bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all text-left"
                  >
                    <div className="flex-1 overflow-hidden pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-black text-slate-900 text-base group-hover:text-indigo-600 transition-colors truncate">
                          {service.name}
                        </h4>
                        <Sparkles size={14} className="text-indigo-200 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      {service.description && (
                        <p className="text-xs text-slate-500 font-medium line-clamp-1 mb-3">{service.description}</p>
                      )}
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Pricing</span>
                         <p className="text-lg font-black text-indigo-600 tracking-tighter">₦{service.price.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                      <Plus size={24} strokeWidth={3} />
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 px-10">
                <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6 transform -rotate-6">
                  <Zap size={32} className="text-slate-300" />
                </div>
                <h4 className="text-lg font-black text-slate-900 mb-2">No matches found</h4>
                <p className="text-sm text-slate-400 font-medium">Try searching for something else or contact the vendor directly.</p>
              </div>
            )}
          </div>

          <div className="p-6 bg-white border-t border-slate-50">
             <div className="bg-indigo-50 rounded-2xl p-4 flex items-center gap-4 border border-indigo-100/50">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-500 shadow-sm shrink-0">
                   <Zap size={20} strokeWidth={2.5} />
                </div>
                <p className="text-[11px] text-indigo-800 font-bold leading-relaxed">
                   Select a service to automatically generate a secured <span className="font-black">Escrow</span> link in your conversation.
                </p>
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

