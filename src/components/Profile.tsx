import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Store, 
  Loader2, 
  BadgeCheck, 
  ShieldAlert, 
  CreditCard, 
  RefreshCw, 
  ChevronRight, 
  X, 
  Settings, 
  Wallet as WalletIcon, 
  Camera, 
  MapPin, 
  Phone, 
  BookOpen, 
  LogOut,
  Bell,
  Lock,
  ArrowUpRight,
  Sparkles,
  Zap,
  Activity,
  Award,
  Crown,
  Plus
} from 'lucide-react';
import { api } from '../services/api';
import VendorProfileManagement from './VendorProfileManagement';
import MyRequests from './MyRequests';

interface UserProfile {
  id: string;
  email: string;
  role: 'user' | 'vendor' | 'admin';
  name: string;
  location: string;
  photoUrl?: string;
  phoneNumber?: string;
  matricNumber?: string;
  department?: string;
  faculty?: string;
  nin?: string;
  homeAddress?: string;
  hasHostel?: boolean;
  paymentMethod?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  billingAddress?: string;
  isVerified?: boolean;
}

interface ProfileProps {
  currentMode: 'user' | 'vendor';
  onModeChange: (mode: 'user' | 'vendor') => void;
  onTabChange: (tab: any) => void;
  userId: string;
}

export default function Profile({ currentMode, onModeChange, onTabChange, userId }: ProfileProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showUpgradeForm, setShowUpgradeForm] = useState(false);
  
  // Form states
  const [nin, setNin] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [hasHostel, setHasHostel] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.users.get(userId);
        setProfile(data as UserProfile);
        if (data && (data as any).nin) setNin((data as any).nin);
        if (data && (data as any).homeAddress) setHomeAddress((data as any).homeAddress);
        if (data && (data as any).hasHostel) setHasHostel((data as any).hasHostel);
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [userId]);

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !profile) return;
    setSaving(true);
    try {
      await api.users.update(userId, {
        role: 'vendor',
        nin,
        homeAddress,
        hasHostel,
        upgradedAt: new Date().toISOString()
      });
      setProfile(prev => prev ? { ...prev, role: 'vendor' as const, nin, homeAddress, hasHostel } : null);
      setShowUpgradeForm(false);
      onModeChange('vendor');
    } catch (error) {
      console.error('Error upgrading:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={40} strokeWidth={2.5} />
        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] animate-pulse text-center">Architecting your experience</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      {/* Immersive Header Section */}
      <div className="relative h-64 bg-slate-900 overflow-hidden">
         {/* Abstract background blobs */}
         <motion.div 
            animate={{ 
               scale: [1, 1.2, 1],
               rotate: [0, 90, 0],
               opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[10%] -right-[10%] w-[80%] h-[80%] bg-indigo-500 blur-[120px] rounded-full" 
         />
         <motion.div 
            animate={{ 
               scale: [1, 1.1, 1],
               rotate: [0, -90, 0],
               opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[20%] -left-[10%] w-[80%] h-[80%] bg-purple-500 blur-[120px] rounded-full" 
         />
         <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
      </div>

      {/* Profile Central Card */}
      <div className="px-6 -mt-32 relative z-10">
         <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-[40px] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.08)] border border-white/50"
         >
            <div className="flex flex-col items-center">
               <div className="relative">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="w-28 h-28 rounded-[38px] bg-slate-50 flex items-center justify-center p-1 border-4 border-white shadow-2xl overflow-hidden"
                  >
                     {profile?.photoUrl ? (
                        <img src={profile.photoUrl} alt="" className="w-full h-full object-cover rounded-[34px]" />
                     ) : (
                        <div className="w-full h-full bg-indigo-50 rounded-[34px] flex items-center justify-center text-indigo-400">
                           <User size={48} strokeWidth={1.5} />
                        </div>
                     )}
                  </motion.div>
                  <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-xl hover:scale-110 transition-transform">
                     <Camera size={16} />
                  </button>
               </div>

               <div className="mt-6 text-center space-y-1">
                  <div className="flex items-center justify-center gap-2">
                     <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{profile?.name}</h2>
                     {profile?.isVerified && (
                        <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                           <BadgeCheck size={14} className="text-white fill-white" />
                        </div>
                     )}
                  </div>
                  <p className="text-sm font-bold text-slate-400">{profile?.email}</p>
                  
                  <div className="flex items-center justify-center gap-2 pt-4">
                     <div className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-slate-200">
                        {profile?.role === 'admin' ? 'System Curator' : (profile?.role === 'vendor' ? 'Service Plug' : 'Member')}
                     </div>
                     <div className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border border-indigo-100 flex items-center gap-1.5">
                        <Sparkles size={12} className="fill-indigo-600" /> Platinum
                     </div>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-slate-50">
               <div className="text-center group cursor-pointer">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-2 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                     <Activity size={18} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Orders</p>
                  <p className="text-xl font-black text-slate-900 tracking-tighter">0</p>
               </div>
               <div className="text-center group cursor-pointer border-x border-slate-50">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-2 text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                     <Award size={18} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Rating</p>
                  <p className="text-xl font-black text-slate-900 tracking-tighter">5.0</p>
               </div>
               <div className="text-center group cursor-pointer">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-2 text-slate-400 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                     <Crown size={18} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Level</p>
                  <p className="text-xl font-black text-slate-900 tracking-tighter">1</p>
               </div>
            </div>
         </motion.div>
      </div>

      {/* Financial Hub Card - Prominent Access to Wallet */}
      <div className="px-6 mt-8">
         <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTabChange('wallet')}
            className="w-full relative group overflow-hidden bg-white rounded-[32px] p-1 border border-slate-100 shadow-[0_20px_40px_rgba(0,0,0,0.03)]"
         >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-white rounded-[31px] p-6 flex items-center justify-between">
               <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-[24px] bg-slate-900 flex items-center justify-center text-white shadow-2xl shadow-indigo-200">
                     <WalletIcon size={28} strokeWidth={2.5} />
                  </div>
                  <div className="text-left">
                     <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] bg-indigo-50 px-2 py-0.5 rounded-md">Finance Secure</span>
                     </div>
                     <h4 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                        Campus Wallet <ArrowUpRight size={18} className="text-slate-300" />
                     </h4>
                     <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Manage escrow & payouts</p>
                  </div>
               </div>
               <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <ChevronRight size={20} />
               </div>
            </div>
         </motion.button>
      </div>

      {/* Main Sections Grid */}
      <div className="px-6 mt-8 space-y-6">
         
         {/* Vendor Upsell if User */}
         {profile?.role === 'user' && (
            <div className="relative group">
               <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[32px] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
               <button 
                  onClick={() => setShowUpgradeForm(true)}
                  className="relative w-full bg-white border border-emerald-100 rounded-[32px] p-6 flex items-center justify-between shadow-sm hover:shadow-emerald-100 transition-all"
               >
                  <div className="flex items-center gap-5">
                     <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Zap size={28} className="fill-emerald-600" />
                     </div>
                     <div className="text-left">
                        <h4 className="text-lg font-black text-slate-900 tracking-tight">Earning Portal</h4>
                        <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">Start plugging services</p>
                     </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                     <Plus size={20} />
                  </div>
               </button>
            </div>
         )}

         {/* Settings Groups */}
         <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
               <Settings size={12} /> System Configuration
            </h3>
            
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] overflow-hidden">
               <div className="divide-y divide-slate-50">
                  <button className="w-full p-6 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                           <Lock size={20} strokeWidth={2.5} />
                        </div>
                        <div className="text-left">
                           <h4 className="text-sm font-black text-slate-900 tracking-tight">Biometric Verification</h4>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Matric & Phone Secured</p>
                        </div>
                     </div>
                     <BadgeCheck size={20} className="text-blue-500 fill-blue-50" />
                  </button>

                  <button className="w-full p-6 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                           <Phone size={20} strokeWidth={2.5} />
                        </div>
                        <div className="text-left">
                           <h4 className="text-sm font-black text-slate-900 tracking-tight">Notification Engine</h4>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Push & WhatsApp Sync</p>
                        </div>
                     </div>
                     <ChevronRight size={18} className="text-slate-200 group-hover:text-slate-400 transition-all" />
                  </button>

                  <button className="w-full p-6 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                           <ShieldAlert size={20} strokeWidth={2.5} />
                        </div>
                        <div className="text-left">
                           <h4 className="text-sm font-black text-slate-900 tracking-tight">Integrity Support</h4>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dispute Resolution Hub</p>
                        </div>
                     </div>
                     <ChevronRight size={18} className="text-slate-200 group-hover:text-slate-400 transition-all" />
                  </button>
               </div>
            </div>
         </div>

         {/* Campus Metadata */}
         <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
               <BookOpen size={12} /> Academic Context
            </h3>
            <div className="grid grid-cols-2 gap-3">
               <div className="bg-white p-5 rounded-[28px] border border-slate-100 flex flex-col gap-3 shadow-sm">
                  <MapPin className="text-indigo-400" size={18} />
                  <div>
                     <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Hall Status</p>
                     <p className="text-sm font-black text-slate-900 truncate">{profile?.hasHostel ? "Verified On-Campus" : "Off-Campus Hub"}</p>
                  </div>
               </div>
               <div className="bg-white p-5 rounded-[28px] border border-slate-100 flex flex-col gap-3 shadow-sm">
                  <Phone className="text-emerald-400" size={18} />
                  <div>
                     <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Communication</p>
                     <p className="text-sm font-black text-slate-900 truncate">{profile?.phoneNumber || "Not Bound"}</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Mode Switcher if Vendor */}
         {profile?.role === 'vendor' && (
            <div className="pt-4">
               <button 
                  onClick={() => onModeChange(currentMode === 'user' ? 'vendor' : 'user')}
                  className="w-full bg-indigo-50 text-indigo-700 py-6 rounded-[32px] font-black text-sm uppercase tracking-[0.2em] border-2 border-dashed border-indigo-200 hover:bg-indigo-100 transition-all flex items-center justify-center gap-3"
               >
                  <RefreshCw size={18} className="animate-spin-slow" />
                  Switch to {currentMode === 'user' ? 'Plug Management' : 'Buyer Experience'}
               </button>
            </div>
         )}

         {/* Logout / Exit */}
         <div className="pt-10 pb-8 text-center">
            <motion.button 
               whileHover={{ scale: 1.05 }}
               className="inline-flex items-center gap-3 text-rose-500 font-black text-[10px] uppercase tracking-[0.3em] px-8 py-4 bg-rose-50 rounded-2xl hover:bg-rose-100 transition-all"
            >
               <LogOut size={14} /> Exit Campus Hub
            </motion.button>
            <p className="mt-8 text-[9px] font-bold text-slate-300 tracking-[0.1em] uppercase">SurePlug Protocol v2.4.0 • Secured by Campus Ledger</p>
         </div>
      </div>

      {/* Upgrade Modal */}
      <AnimatePresence>
         {showUpgradeForm && (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[100] flex items-end sm:items-center justify-center p-4"
               onClick={(e) => e.target === e.currentTarget && setShowUpgradeForm(false)}
            >
               <motion.div 
                  initial={{ y: 200, scale: 0.95 }}
                  animate={{ y: 0, scale: 1 }}
                  exit={{ y: 200, scale: 0.95 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="bg-white w-full max-w-md rounded-[40px] p-8 space-y-8"
                  onClick={e => e.stopPropagation()}
               >
                  <div className="flex justify-between items-start">
                     <div className="space-y-1">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-xl shadow-indigo-200">
                           <Crown size={24} className="fill-white" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Plug Status.</h3>
                        <p className="text-sm font-medium text-slate-500">Upgrade to verified campus merchant status.</p>
                     </div>
                     <button onClick={() => setShowUpgradeForm(false)} className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors">
                        <X size={20} className="text-slate-400" />
                     </button>
                  </div>

                  <form onSubmit={handleUpgrade} className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">NIN Identification (11 Digits)</label>
                        <input 
                           required
                           type="text"
                           value={nin}
                           onChange={e => setNin(e.target.value)}
                           placeholder="0000 0000 000"
                           className="w-full bg-slate-50 border-none rounded-3xl py-5 px-6 font-black text-slate-900 placeholder:text-slate-200 focus:ring-4 focus:ring-indigo-100 transition-all text-xl tracking-widest"
                        />
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2">Campus Residence Address</label>
                        <textarea 
                           required 
                           value={homeAddress} 
                           onChange={e => setHomeAddress(e.target.value)} 
                           className="w-full bg-slate-50 border-none rounded-3xl py-5 px-6 font-bold text-slate-900 placeholder:text-slate-200 focus:ring-4 focus:ring-indigo-100 transition-all min-h-[120px]" 
                           placeholder="Enter your hall name, block and room number..."
                        />
                     </div>

                     <div className="bg-slate-50/50 p-6 rounded-[32px] flex items-center gap-4 border border-slate-100">
                        <div className="flex-shrink-0">
                           <input 
                              type="checkbox" 
                              id="hostel-check" 
                              checked={hasHostel} 
                              onChange={e => setHasHostel(e.target.checked)} 
                              className="w-6 h-6 rounded-lg border-slate-200 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer" 
                           />
                        </div>
                        <label htmlFor="hostel-check" className="text-xs font-bold text-slate-600 leading-snug cursor-pointer">
                           I confirm that the address provided is my primary residence for the current academic session.
                        </label>
                     </div>

                     <button 
                        type="submit"
                        disabled={saving}
                        className="w-full bg-indigo-600 text-white py-6 rounded-3xl font-black text-lg shadow-2xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                     >
                        {saving ? <Loader2 className="animate-spin" size={24} /> : <div className="p-1 bg-white/20 rounded-lg"><Sparkles size={16} fill="white" /></div>}
                        Complete Protocol
                     </button>
                  </form>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Dynamic Sub-Components */}
      {currentMode === 'vendor' && (
         <div className="px-6 mt-10">
            <VendorProfileManagement userId={userId} />
         </div>
      )}
    </div>
  );
}
