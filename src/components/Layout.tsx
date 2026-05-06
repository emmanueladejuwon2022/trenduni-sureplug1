import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, PlusCircle, MessageCircle, LogOut, Store, User, Wallet as WalletIcon, ShieldAlert, ClipboardList, Bell, Plus, Sparkles } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: any;
  onTabChange: (tab: any) => void;
  userRole?: string | null;
  currentMode: 'user' | 'vendor';
  onModeChange: (mode: 'user' | 'vendor') => void;
  unreadCount: number;
  notificationCount: number;
  onLogout?: () => void;
}

export default function Layout({ children, activeTab, onTabChange, userRole, currentMode, onModeChange, unreadCount, notificationCount, onLogout }: LayoutProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showModeConfirm, setShowModeConfirm] = useState(false);

  const handleLogout = () => {
    if (onLogout) onLogout();
    setShowLogoutConfirm(false);
  };

  const handleModeSwitch = () => {
    onModeChange(currentMode === 'user' ? 'vendor' : 'user');
    setShowModeConfirm(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col max-w-md mx-auto shadow-[0_0_100px_rgba(0,0,0,0.05)] relative overflow-hidden font-sans">
      
      {/* Premium Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex justify-between items-center">
        <div 
          onClick={() => onTabChange('feed')}
          className="flex flex-col cursor-pointer group"
        >
          <div className="flex items-center gap-1.5">
             <div className="w-6 h-6 bg-slate-900 rounded-lg flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-6 transition-all">
                <Sparkles size={14} className="fill-white" />
             </div>
             <h1 className="text-xl font-black tracking-tighter text-slate-900 leading-none group-hover:text-indigo-600 transition-colors">Sure<span className="text-indigo-600">Plug.</span></h1>
          </div>
          {userRole === 'vendor' && (
            <button 
              onClick={() => setShowModeConfirm(true)}
              className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.1em] text-indigo-600 mt-1 pl-1"
            >
              <div className={`w-1.5 h-1.5 rounded-full ${currentMode === 'vendor' ? 'bg-indigo-600 animate-pulse' : 'bg-slate-300'}`} />
              {currentMode === 'vendor' ? 'Service Mode Active' : 'Switch to Storefront'}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => onTabChange('chat')}
            className={`relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${activeTab === 'chat' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-400 hover:text-indigo-600'}`}
          >
            <MessageCircle size={18} strokeWidth={2.5} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => onTabChange('notifications')}
            className={`relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${activeTab === 'notifications' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-400 hover:text-indigo-600'}`}
          >
            <Bell size={18} strokeWidth={2.5} />
            {notificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                {notificationCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setShowLogoutConfirm(true)} 
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-all bg-slate-50 hover:bg-rose-50 rounded-2xl"
          >
            <LogOut size={18} strokeWidth={2.5} />
          </button>
          {userRole === 'admin' && (
            <button 
              onClick={() => onTabChange('admin')}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${activeTab === 'admin' ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-amber-50 text-amber-600'}`}
            >
              <ShieldAlert size={18} />
            </button>
          )}
        </div>
      </header>
      
      {/* Modal Overlays */}
      <AnimatePresence>
        {(showModeConfirm || showLogoutConfirm) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowModeConfirm(false);
                setShowLogoutConfirm(false);
              }
            }}
          >
            <motion.div 
              initial={{ y: 100, scale: 1 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 100, scale: 1 }}
              className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl space-y-6"
            >
              <div className="flex flex-col items-center text-center gap-4">
                 <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center ${showLogoutConfirm ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                    {showLogoutConfirm ? <LogOut size={36} /> : (currentMode === 'user' ? <Store size={36} /> : <User size={36} />)}
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                       {showLogoutConfirm ? 'Ready to exit?' : `Switch to ${currentMode === 'user' ? 'Plugging' : 'Buying'}?`}
                    </h3>
                    <p className="text-sm font-medium text-slate-500 max-w-[240px]">
                       {showLogoutConfirm ? 'You\'ll need to sign back in to see new requests and chats.' : (currentMode === 'user' ? 'Unlock vendor tools and start accepting campus jobs.' : 'Browse the live feed and connect with trusted plugs.')}
                    </p>
                 </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={showLogoutConfirm ? handleLogout : handleModeSwitch}
                  className={`w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 ${showLogoutConfirm ? 'bg-rose-600 shadow-rose-200' : 'bg-indigo-600 shadow-indigo-200'}`}
                >
                  {showLogoutConfirm ? 'Yes, Logout' : `Switch to ${currentMode === 'user' ? 'Vendor' : 'User'} Mode`}
                </button>
                <button 
                  onClick={() => { setShowModeConfirm(false); setShowLogoutConfirm(false); }}
                  className="w-full py-4 rounded-2xl font-black text-slate-400 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  Keep Current
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-h-0 pb-32">
        {children}
      </main>
      
      {/* Floating Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-6 pb-6 pointer-events-none z-50">
         <nav className="bg-white px-4 py-3 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 flex justify-between items-center pointer-events-auto relative">
            
            <button 
              onClick={() => onTabChange('feed')}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-2xl transition-all ${activeTab === 'feed' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Home size={22} strokeWidth={activeTab === 'feed' ? 3 : 2} />
              <span className="text-[9px] font-black uppercase tracking-[0.05em]">Feed</span>
            </button>
            
            <button 
              onClick={() => onTabChange('vendors')}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-2xl transition-all ${activeTab === 'vendors' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Store size={22} strokeWidth={activeTab === 'vendors' ? 3 : 2} />
              <span className="text-[9px] font-black uppercase tracking-[0.05em]">Plugs</span>
            </button>

            {/* Center Float Button */}
            <div className="relative -top-10">
               <motion.button 
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 onClick={() => onTabChange('post')}
                 className="w-16 h-16 bg-slate-900 rounded-[24px] flex items-center justify-center text-white shadow-2xl shadow-slate-300 border-4 border-white group transition-all"
               >
                 <Plus size={32} strokeWidth={3} className="transition-transform group-hover:rotate-90" />
               </motion.button>
               <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-[0.1em] text-slate-400">Post</span>
            </div>
            
            <button 
              onClick={() => onTabChange('wallet')}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-2xl transition-all relative ${activeTab === 'wallet' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <WalletIcon size={22} strokeWidth={activeTab === 'wallet' ? 3 : 2} />
              <span className="text-[9px] font-black uppercase tracking-[0.05em]">Wallet</span>
            </button>

            <button 
              onClick={() => onTabChange('profile')}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-2xl transition-all ${activeTab === 'profile' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <User size={22} strokeWidth={activeTab === 'profile' ? 3 : 2} />
              <span className="text-[9px] font-black uppercase tracking-[0.05em]">Profile</span>
            </button>

         </nav>
      </div>

    </div>
  );
}

