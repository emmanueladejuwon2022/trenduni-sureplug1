import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, ChevronRight, Loader2, Search, Filter, Sparkles, Zap, Package, Utensils, Scissors, GraduationCap, Truck, ShoppingBag, Clock } from 'lucide-react';
import { api } from '../services/api';

interface Chat {
  id: string;
  participants: string[];
  lastMessage?: string;
  updatedAt: any;
  lastReadAt?: { [uid: string]: any };
  contextRequestId?: string;
  contextRequestCategory?: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Food': <Utensils size={14} />,
  'Laundry': <Scissors size={14} />,
  'Logistics': <Truck size={14} />,
  'Tutoring': <GraduationCap size={14} />,
  'Tech': <Zap size={14} />,
  'Fashion': <ShoppingBag size={14} />,
  'General': <Package size={14} />
};

function formatTimeAgo(date: any) {
  if (!date) return '';
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return then.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function ChatList({ onSelectChat, userId }: { onSelectChat: (chatId: string, otherUserId: string) => void, userId: string }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let unmounted = false;
    const unsub = api.chats.subscribe(userId, data => {
      if (unmounted) return;
      // Sort chats by updatedAt desc
      const sorted = [...data].sort((a, b) => {
        const tA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const tB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return tB - tA;
      });
      setChats(sorted);
      setLoading(false);
    });

    const to = setTimeout(() => {
      if (!unmounted && loading) setLoading(false);
    }, 3000);

    return () => {
      unmounted = true;
      unsub();
      clearTimeout(to);
    };
  }, [userId]);

  const filteredChats = chats.filter(chat => {
    const otherUserId = chat.participants.find(id => id !== userId);
    return otherUserId?.toLowerCase().includes(searchQuery.toLowerCase()) || 
           chat.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-3xl border border-slate-50 animate-pulse">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-100 rounded w-1/3" />
              <div className="h-3 bg-slate-50 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Search Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">Messages</h2>
            <div className="flex items-center gap-1.5 text-slate-500">
               <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full">
                 {chats.length} active threads
               </span>
            </div>
          </div>
          <button className="p-3 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all active:scale-90">
             <Filter size={20} />
          </button>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold focus:ring-2 focus:ring-slate-900 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {filteredChats.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 px-10 bg-white rounded-[32px] border border-slate-100 shadow-sm"
        >
          <div className="w-20 h-20 bg-indigo-50 rounded-[24px] flex items-center justify-center text-indigo-200 mx-auto mb-6 transform -rotate-12">
            <MessageSquare size={40} strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">No messages yet</h3>
          <p className="text-slate-500 font-medium leading-relaxed mb-8">Your inbox is a blank canvas. Start chatting with plugs to see magic happen here.</p>
          <button className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95">
             Browse Feed
          </button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filteredChats.map((chat, index) => {
            const otherUserId = chat.participants.find(id => id !== userId);
            const displayId = otherUserId || userId;
            const lastRead = chat.lastReadAt?.[userId] ? new Date(chat.lastReadAt[userId]).getTime() : 0;
            const updatedAt = chat.updatedAt ? new Date(chat.updatedAt).getTime() : 0;
            const isUnread = updatedAt > lastRead;
            
            return (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, type: 'spring', damping: 20 }}
                onClick={() => onSelectChat(chat.id, displayId)}
                className={`group p-4 rounded-[28px] border transition-all cursor-pointer flex items-center gap-4 relative overflow-hidden ${
                  isUnread 
                    ? 'bg-white border-indigo-100 shadow-lg shadow-indigo-100/50' 
                    : 'bg-white border-slate-50 hover:border-slate-200 hover:shadow-md'
                }`}
              >
                <div className="relative shrink-0">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden border-2 transition-transform group-hover:scale-105 duration-300 ${
                    isUnread ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-slate-50 border-transparent text-slate-400'
                  }`}>
                    <span className="font-black text-lg">
                      {displayId.substring(0, 1).toUpperCase()}
                    </span>
                  </div>
                  {isUnread && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 rounded-full border-2 border-white animate-pulse" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <h3 className={`text-base font-black truncate tracking-tight transition-colors ${
                        isUnread ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'
                      }`}>
                        {otherUserId ? `User ${otherUserId.substring(0, 4)}` : 'Saved Messages'}
                      </h3>
                      {chat.contextRequestCategory && (
                        <div className="text-slate-300 opacity-50 group-hover:opacity-100 transition-opacity">
                           {CATEGORY_ICONS[chat.contextRequestCategory] || <Sparkles size={12} />}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider tabular-nums">
                      {formatTimeAgo(chat.updatedAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <p className={`text-sm truncate leading-none ${isUnread ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                      {chat.lastMessage || "Started a conversation"}
                    </p>
                  </div>
                </div>
                
                <div className="p-2 text-slate-200 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all shrink-0">
                   <ChevronRight size={18} strokeWidth={3} />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

