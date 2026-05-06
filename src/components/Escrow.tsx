import React, { useState } from 'react';
import { api } from '../services/api';
import { Loader2, ShieldCheck } from 'lucide-react';

interface EscrowProps {
  userId: string;
  vendorId: string;
  requestId: string;
  amount?: number;
  onSuccess: () => void;
}

export default function Escrow({ userId, vendorId, requestId, amount: initialAmount, onSuccess }: EscrowProps) {
  const [loading, setLoading] = useState(false);
  const [customAmount, setCustomAmount] = useState(initialAmount?.toString() || '');

  const handleCreateEscrow = async () => {
    if (!userId) return;
    
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    
    setLoading(true);
    try {
      // 1. Check balance
      const userData = await api.users.get(userId) as any;
      const balance = parseFloat(userData.walletBalance || "0");
      
      if (balance < amount) {
        alert("Insufficient balance.");
        setLoading(false);
        return;
      }

      // 2. Create escrow record (backend should handle balance deduction)
      await api.escrows.create({
        buyerId: userId,
        vendorId,
        participants: [userId, vendorId],
        requestId,
        amount: amount.toString(),
        status: 'held'
      });

      // 3. Record transaction
      await api.wallet.createTransaction({
        userId,
        amount: amount.toString(),
        type: 'debit',
        description: `Escrow payment for ${requestId}`
      });

      alert("Escrow created successfully!");
      onSuccess();
    } catch (error) {
      console.error("Failed to create escrow", error);
      alert("Failed to create escrow.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {!initialAmount && (
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₦</span>
          <input
            type="number"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Enter amount to secure"
            className="w-full pl-8 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-900"
          />
        </div>
      )}
      <button 
        onClick={handleCreateEscrow}
        disabled={loading || (!initialAmount && !customAmount)}
        className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-4 rounded-2xl font-semibold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all disabled:opacity-50"
      >
        {loading ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
        {initialAmount ? `Secure ₦${initialAmount.toLocaleString()}` : 'Secure Payment (Escrow)'}
      </button>
    </div>
  );
}
