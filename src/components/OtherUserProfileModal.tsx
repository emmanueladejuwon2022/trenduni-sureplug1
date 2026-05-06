import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Phone, Mail, ShieldCheck, Calendar, MapPin, Star, Verified, AlertTriangle } from 'lucide-react';

interface OtherUserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  userName: string;
}

export default function OtherUserProfileModal({ isOpen, onClose, user, userName }: OtherUserProfileModalProps) {
  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-stretch justify-end pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-auto"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-white w-full max-w-sm relative z-10 shadow-2xl pointer-events-auto flex flex-col h-full"
          >
            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Identity Profile</h3>
                 <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-all">
                    <X size={20} strokeWidth={3} />
                 </button>
              </div>

              <div className="text-center mb-10">
                <div className="relative inline-block mb-6">
                  <div className="w-40 h-40 rounded-[3rem] bg-slate-50 border-8 border-white shadow-xl flex items-center justify-center overflow-hidden">
                    {user.photoUrl ? (
                      <img src={user.photoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-slate-900 font-black text-5xl">
                        {userName.substring(0, 1).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {user.role === 'vendor' && (
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border-2 border-indigo-50">
                       <Verified size={24} className="text-indigo-600 fill-indigo-50" />
                    </div>
                  )}
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight mb-2">{userName}</h2>
                <div className="flex items-center justify-center gap-2">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                   <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                     {user.role === 'vendor' ? 'Verified Plug' : 'University Peer'}
                   </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-10">
                 <div className="bg-slate-50 rounded-[24px] p-4 border border-slate-100">
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                       <Star size={14} fill="currentColor" />
                       <span className="text-xs font-black">4.9 / 5</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Reputation</p>
                 </div>
                 <div className="bg-slate-50 rounded-[24px] p-4 border border-slate-100">
                    <div className="flex items-center gap-2 text-emerald-600 mb-1">
                       <ShieldCheck size={14} strokeWidth={3} />
                       <span className="text-xs font-black">100%</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Safe Rate</p>
                 </div>
              </div>

              <div className="space-y-6">
                 <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Contact Gateway</h4>
                    <div className="space-y-3">
                       <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                             <Mail size={18} />
                          </div>
                          <div>
                             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Official Email</p>
                             <p className="text-xs font-bold text-slate-900 truncate">{user.email || 'Confidential'}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                             <Phone size={18} />
                          </div>
                          <div>
                             <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Direct Line</p>
                             <p className="text-xs font-bold text-slate-900">+234 ••••••••</p>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Account Integrity</h4>
                    <div className="grid grid-cols-1 gap-3 px-1">
                       <div className="flex items-center gap-3 text-slate-500">
                          <Calendar size={16} />
                          <span className="text-xs font-bold italic text-slate-400">Joined June 2023</span>
                       </div>
                       <div className="flex items-center gap-3 text-slate-500">
                          <MapPin size={16} />
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Main Campus Hub</span>
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-50 bg-slate-50/30">
               <button className="w-full bg-slate-100 text-slate-400 py-4 rounded-2xl font-black text-sm hover:bg-rose-50 hover:text-rose-500 transition-all flex items-center justify-center gap-2 group">
                  <AlertTriangle size={18} strokeWidth={2.5} className="group-hover:animate-pulse" />
                  Flag Misconduct
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
