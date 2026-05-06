import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, X, Loader2, Send, Verified } from 'lucide-react';
import { api } from '../services/api';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendorId: string;
  userId: string;
  requestId: string;
  vendorName: string;
}

export default function RatingModal({ isOpen, onClose, vendorId, userId, requestId, vendorName }: RatingModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      await api.reviews.create({
        vendorId,
        userId,
        requestId,
        rating,
        comment: comment.trim()
      });
      onClose();
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="bg-white w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl relative z-10 p-10 text-center border border-white"
          >
            <div className="absolute top-6 right-6">
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-all">
                <X size={20} strokeWidth={3} />
              </button>
            </div>

            <div className="w-24 h-24 bg-amber-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 relative">
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Star size={48} className="text-amber-500" fill="currentColor" />
              </motion.div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-amber-100">
                 <Verified size={16} className="text-amber-500" />
              </div>
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">How was the deal?</h2>
            <p className="text-slate-500 text-sm font-medium mb-10 px-4">
              Your feedback for <span className="text-indigo-600 font-black">@{vendorName}</span> helps keep our campus safe.
            </p>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                    className="group transition-transform hover:scale-125 active:scale-95"
                  >
                    <Star
                      size={40}
                      className={`${
                        (hoveredRating || rating) >= star ? 'text-amber-400' : 'text-slate-100'
                      } transition-all duration-300 transform group-hover:drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]`}
                      fill={(hoveredRating || rating) >= star ? 'currentColor' : 'none'}
                      strokeWidth={2.5}
                    />
                  </button>
                ))}
              </div>

              <div className="relative">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you loved about this vendor..."
                  className="w-full bg-slate-50 border-2 border-transparent rounded-[24px] p-5 text-sm font-bold focus:bg-white focus:border-amber-500/10 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all resize-none shadow-inner h-24 placeholder:text-slate-300"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black shadow-2xl shadow-slate-900/20 hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <>
                    <Send size={20} strokeWidth={3} />
                    <span>Post Review</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
