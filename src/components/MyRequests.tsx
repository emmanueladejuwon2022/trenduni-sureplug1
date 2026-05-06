import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Loader2, CheckCircle, Star, Plus } from 'lucide-react';
import { api } from '../services/api';

interface Request {
  id: string;
  category: string;
  description: string;
  status: 'open' | 'matched' | 'closed';
  assignedVendorId?: string;
  createdAt: any;
}

export default function MyRequests({ onPostRequest, onSearch, userId }: { onPostRequest?: () => void, onSearch?: () => void, userId: string }) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [closingRequest, setClosingRequest] = useState<Request | null>(null);
  const [vendorId, setVendorId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    const unsub = api.requests.subscribe((data: any[]) => {
      const myRequests = data.filter((r: any) => r.userId === userId);
      setRequests(myRequests);
      setLoading(false);
    });

    const to = setTimeout(() => setLoading(false), 3000);

    return () => {
      unsub();
      clearTimeout(to);
    };
  }, [userId]);

  const handleCloseDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!closingRequest || !vendorId.trim() || !userId) return;
    setSubmitting(true);
    try {
      // 1. Update request status
      await api.requests.update(closingRequest.id, {
        status: 'closed',
        assignedVendorId: vendorId.trim()
      });

      // 2. Submit Review
      await api.reviews.create({
        vendorId: vendorId.trim(),
        userId: userId,
        requestId: closingRequest.id,
        rating: rating,
        comment: comment
      });

      alert('Deal closed and review submitted successfully!');
      setClosingRequest(null);
      setVendorId('');
      setRating(5);
      setComment('');
    } catch (error) {
      console.error('Error closing deal:', error);
      alert('Failed to close deal.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-600" size={24} /></div>;
  }

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6 mt-6 relative min-h-[400px]">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 text-lg">My Requests</h3>
      </div>
      
      {requests.length === 0 ? (
        <p className="text-sm text-slate-500">You haven't posted any requests yet.</p>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req.id} className="border border-slate-100 rounded-2xl p-4 bg-slate-50">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100 px-2.5 py-1 rounded-full">
                  {req.category}
                </span>
                <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  req.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                }`}>
                  {req.status}
                </span>
              </div>
              <p className="text-sm text-slate-900 font-medium mb-3">{req.description}</p>
              
              {req.status === 'open' && (
                <button
                  onClick={() => setClosingRequest(req)}
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5"
                >
                  <CheckCircle size={16} />
                  Mark as Completed
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={onPostRequest}
        className="fixed bottom-24 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-2xl shadow-indigo-300 hover:bg-indigo-700 transition-all hover:scale-110 active:scale-95 z-30"
        title="Post New Request"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>

      {closingRequest && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-2">Close Deal & Review</h3>
            <p className="text-sm text-slate-500 mb-6">Who completed this request for you? Leave them a review to help others.</p>
            
            <form onSubmit={handleCloseDeal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vendor ID</label>
                <input
                  required
                  type="text"
                  value={vendorId}
                  onChange={e => setVendorId(e.target.value)}
                  placeholder="Paste the vendor's ID here"
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <p className="text-xs text-slate-500 mt-1">You can find this on their profile or in your chat.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-2 rounded-full transition-colors ${rating >= star ? 'text-amber-400' : 'text-slate-300 hover:text-amber-200'}`}
                    >
                      <Star size={28} fill={rating >= star ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Comment (Optional)</label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="How was their service?"
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setClosingRequest(null)}
                  className="flex-1 py-3 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !vendorId.trim()}
                  className="flex-1 py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 flex justify-center items-center"
                >
                  {submitting ? <Loader2 size={20} className="animate-spin" /> : 'Submit Review'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
