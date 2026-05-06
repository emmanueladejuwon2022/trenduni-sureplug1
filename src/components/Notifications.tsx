import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, MessageCircle, ShieldCheck, Star, CreditCard, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'message' | 'escrow' | 'rating' | 'wallet' | 'system';
  read: boolean;
  createdAt: any;
  link?: string;
}

export default function Notifications({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    let unmounted = false;
    const unsub = api.notifications.subscribe(userId, data => {
      if (unmounted) return;
      setNotifications(data);
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

  const markAsRead = async (id: string) => {
    try {
      await api.notifications.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    try {
      await Promise.all(unread.map(n => api.notifications.markAsRead(n.id)));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'message': return <MessageCircle size={18} className="text-blue-500" />;
      case 'escrow': return <ShieldCheck size={18} className="text-emerald-500" />;
      case 'rating': return <Star size={18} className="text-amber-500" />;
      case 'wallet': return <CreditCard size={18} className="text-indigo-500" />;
      default: return <Bell size={18} className="text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications</h2>
          <p className="text-sm text-slate-500">Stay updated with your activities.</p>
        </div>
        {notifications.some(n => !n.read) && (
          <button 
            onClick={markAllAsRead}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <CheckCircle2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="text-slate-300" size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">All caught up!</h3>
          <p className="text-sm text-slate-500">No new notifications for you right now.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {notifications.map((n) => (
              <motion.div
                key={n.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`group relative bg-white p-4 rounded-3xl border transition-all hover:shadow-md ${
                  n.read ? 'border-slate-100 opacity-75' : 'border-indigo-100 shadow-sm ring-1 ring-indigo-50'
                }`}
              >
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    n.read ? 'bg-slate-50' : 'bg-indigo-50'
                  }`}>
                    {getIcon(n.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className={`text-sm font-bold truncate pr-4 ${n.read ? 'text-slate-700' : 'text-slate-900'}`}>
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mb-3">
                      {n.message}
                    </p>
                    
                    <div className="flex items-center gap-3">
                      {!n.read && (
                        <button 
                          onClick={() => markAsRead(n.id)}
                          className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:text-indigo-700"
                        >
                          Mark as read
                        </button>
                      )}
                      <button 
                        onClick={() => deleteNotification(n.id)}
                        className="text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
                
                {!n.read && (
                  <div className="absolute top-4 right-4 w-2 h-2 bg-indigo-600 rounded-full" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
