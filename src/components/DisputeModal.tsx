import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, Loader2, Send, CheckCircle2, Zap, Info, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  escrowId: string;
  amount: number;
  otherUserId: string;
  userId: string;
}

export default function DisputeModal({ isOpen, onClose, escrowId, amount, otherUserId, userId }: DisputeModalProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !reason || !description) return;

    setLoading(true);
    try {
      await api.disputes.create({
        escrowId,
        amount: amount.toString(),
        reportedBy: userId,
        otherUserId,
        reason,
        description,
        status: 'pending'
      });
      setSuccess(true);
      setTimeout(onClose, 2000);
    } catch (error) {
      console.error('Error reporting dispute:', error);
    } finally {
      setLoading(false);
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
            initial={{ opacity: 0, scale: 0.95, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 40 }}
            className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl relative z-10 border border-white"
          >
            {success ? (
               <div className="text-center py-10">
                  <div className="w-20 h-20 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                     <CheckCircle2 size={40} className="text-emerald-500" strokeWidth={3} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Dispute Lodged</h3>
                  <p className="text-slate-500 text-sm font-medium">An admin will review this transaction and resolve it within 24 hours.</p>
               </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-inner">
                       <AlertTriangle size={28} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">Report Issue</h3>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Escrow Security Vault</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-all">
                    <X size={20} strokeWidth={3} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Reason for Dispute</label>
                    <div className="relative">
                       <select 
                        required
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full p-4 pr-10 rounded-2xl border-2 border-slate-50 bg-slate-50 font-bold text-slate-900 outline-none focus:border-rose-500/20 focus:bg-white focus:ring-4 focus:ring-rose-500/5 transition-all text-sm appearance-none"
                      >
                        <option value="">Select a reason...</option>
                        <option value="Service not delivered">Service not delivered</option>
                        <option value="Poor quality of service">Poor quality of service</option>
                        <option value="Vendor unresponsive">Vendor unresponsive</option>
                        <option value="Other">Other</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                         <Zap size={16} fill="currentColor" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Describe what happened</label>
                    <textarea
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Be specific about the problem..."
                      className="w-full p-5 rounded-2xl border-2 border-slate-50 bg-slate-50 font-bold text-slate-900 outline-none focus:border-rose-500/20 focus:bg-white focus:ring-4 focus:ring-rose-500/5 transition-all text-sm min-h-[140px] resize-none placeholder:text-slate-300"
                    />
                  </div>

                  <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100/50 flex gap-3">
                    <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-800 font-bold leading-relaxed">
                      Reporting this dispute <span className="font-black underline">instantly freezes</span> the ₦{amount.toLocaleString()} in the escrow vault.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !reason || !description}
                    className="w-full bg-rose-600 text-white py-5 rounded-[24px] font-black shadow-2xl shadow-rose-600/20 hover:bg-rose-700 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={24} className="animate-spin" /> : <ShieldCheck size={24} strokeWidth={3} />}
                    <span>Submit & Freeze Funds</span>
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
