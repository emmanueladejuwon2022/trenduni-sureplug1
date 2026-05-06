import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, User, Loader2, ShieldCheck } from 'lucide-react';

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  otherUserName: string;
}

export default function CallModal({ isOpen, onClose, otherUserName }: CallModalProps) {
  const [status, setStatus] = useState<'calling' | 'connected' | 'ended'>('calling');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(true);

  useEffect(() => {
    if (!isOpen) {
      setStatus('calling');
      setDuration(0);
      return;
    }

    const timer = setTimeout(() => {
      setStatus('connected');
    }, 2500);

    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (status !== 'connected') return;

    const interval = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setStatus('ended');
    setTimeout(onClose, 800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950 z-[200] flex flex-col items-center justify-between p-12 text-white overflow-hidden"
        >
          {/* Animated Background Gradients */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
               animate={{ 
                 scale: [1, 1.2, 1],
                 opacity: [0.1, 0.2, 0.1]
               }}
               transition={{ duration: 4, repeat: Infinity }}
               className="absolute -top-1/4 -right-1/4 w-[80%] h-[80%] bg-indigo-500/20 blur-[120px] rounded-full"
            />
            <motion.div 
               animate={{ 
                 scale: [1.2, 1, 1.2],
                 opacity: [0.1, 0.2, 0.1]
               }}
               transition={{ duration: 5, repeat: Infinity }}
               className="absolute -bottom-1/4 -left-1/4 w-[80%] h-[80%] bg-purple-500/10 blur-[120px] rounded-full"
            />
          </div>

          <div className="relative z-10 text-center mt-12">
            <div className="relative mb-8">
              {status === 'calling' && (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-indigo-500/30 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 2], opacity: [0.3, 0] }}
                    transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                    className="absolute inset-0 bg-indigo-500/20 rounded-full"
                  />
                </>
              )}
              <div className="w-40 h-40 rounded-[3rem] bg-slate-900 border-4 border-slate-800/50 flex items-center justify-center mx-auto relative overflow-hidden shadow-2xl">
                <User size={80} className="text-slate-700" />
                {!isVideoOff && status === 'connected' && (
                   <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                      <Video size={48} className="text-slate-600 animate-pulse" />
                   </div>
                )}
              </div>
            </div>
            <h2 className="text-4xl font-black mb-3 tracking-tight">{otherUserName}</h2>
            <div className="flex items-center justify-center gap-2">
               {status === 'connected' && <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
               <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">
                 {status === 'calling' ? 'Securely Dialing...' : status === 'connected' ? `Live • ${formatDuration(duration)}` : 'Call Ended'}
               </p>
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-10 mb-12">
            <div className="flex items-center gap-8">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMuted(!isMuted)}
                className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all ${isMuted ? 'bg-white text-slate-900' : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-xl'}`}
              >
                {isMuted ? <MicOff size={28} strokeWidth={2.5} /> : <Mic size={28} strokeWidth={2.5} />}
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleEndCall}
                className="w-20 h-20 rounded-[2.5rem] bg-rose-500 flex items-center justify-center hover:bg-rose-600 transition-all shadow-[0_0_50px_rgba(244,63,94,0.3)] group"
              >
                <PhoneOff size={32} strokeWidth={3} className="group-hover:rotate-12 transition-transform" />
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all ${!isVideoOff ? 'bg-white text-slate-900' : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-xl'}`}
              >
                {!isVideoOff ? <Video size={28} strokeWidth={2.5} /> : <VideoOff size={28} strokeWidth={2.5} />}
              </motion.button>
            </div>
            
            <div className="flex items-center gap-2 px-6 py-2.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/5">
               <ShieldCheck size={14} className="text-emerald-500" />
               <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">End-to-End Encrypted Peer Connection</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
