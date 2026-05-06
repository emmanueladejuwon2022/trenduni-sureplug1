import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, ShieldCheck, History, Loader2, ArrowDown, ArrowUp, Zap, CreditCard, Activity, TrendingUp, Lock } from 'lucide-react';
import { api } from '../services/api';

interface Transaction {
  id: string;
  amount: number | string;
  type: string;
  createdAt: any;
  description?: string;
}

interface Escrow {
  id: string;
  amount: number | string;
  status: 'held' | 'released' | 'refunded' | 'disputed';
  createdAt: any;
}

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000];

export default function Wallet({ userId }: { userId: string }) {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [funding, setFunding] = useState(false);
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [escrows, setEscrows] = useState<Escrow[]>([]);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let unmounted = false;

    // Profile sync
    const unsubUser = api.users.subscribe(userId, (me: any) => {
      if (unmounted) return;
      if (me) setBalance(parseFloat(me.walletBalance || "0"));
    });

    let txLoaded = false;
    let escrowsLoaded = false;

    const checkLoaded = () => {
      if (txLoaded && escrowsLoaded && !unmounted) {
        setLoading(false);
      }
    };

    const unsubTx = api.wallet.subscribeTransactions(userId, data => {
      if (unmounted) return;
      setTransactions(data);
      txLoaded = true;
      checkLoaded();
    });

    const unsubEscrows = api.escrows.subscribe(userId, data => {
      if (unmounted) return;
      setEscrows(data);
      escrowsLoaded = true;
      checkLoaded();
    });

    const to = setTimeout(() => {
      if (!unmounted && loading) setLoading(false);
    }, 4000);

    return () => {
      unmounted = true;
      unsubUser();
      unsubTx();
      unsubEscrows();
      clearTimeout(to);
    };
  }, [userId]);

  const handleFundWallet = async (presetAmount?: number) => {
    const fundAmount = presetAmount || parseFloat(amount);
    if (!userId || isNaN(fundAmount) || fundAmount <= 0) return;

    setFunding(true);
    try {
      await api.wallet.createTransaction({
        userId,
        amount: fundAmount,
        type: 'credit',
        description: 'Instant Wallet Top-up'
      });
      setAmount('');
    } catch (error) {
      console.error(error);
    } finally {
      setFunding(false);
    }
  };

  const activeEscrowTotal = escrows
    .filter(e => e.status === 'held')
    .reduce((sum, e) => sum + parseFloat(e.amount as string), 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing Ledger...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto space-y-8 pb-12"
    >
      <div className="space-y-1 px-1">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Finance <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Hub.</span></h2>
        <p className="text-sm font-medium text-slate-500">Secure transactions verified by campus network.</p>
      </div>

      {/* Main Balance Card */}
      <div className="relative group perspective-1000">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[32px] blur-xl opacity-20 group-hover:opacity-30 transition duration-500"></div>
        <div className="relative bg-slate-900 text-white rounded-[32px] p-8 shadow-2xl overflow-hidden border border-white/10">
           {/* Decorative Elements */}
           <div className="absolute right-0 top-0 w-48 h-48 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
           <div className="absolute left-8 bottom-8 opacity-5">
              <WalletIcon size={180} strokeWidth={1} />
           </div>

           <div className="relative z-10 flex flex-col gap-8">
              <div className="flex items-center justify-between">
                 <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-[3px] text-indigo-300/80">Available Liquid Balance</p>
                    <h3 className="text-5xl font-black tracking-tighter">₦{balance.toLocaleString()}</h3>
                 </div>
                 <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-inner">
                    <CreditCard size={28} className="text-indigo-300" />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white/5 backdrop-blur-sm p-4 rounded-[22px] border border-white/5 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-black uppercase tracking-widest text-[9px]">
                       <TrendingUp size={10} /> Escrow Protected
                    </div>
                    <p className="text-xl font-bold">₦{activeEscrowTotal.toLocaleString()}</p>
                 </div>
                 <div className="bg-white/5 backdrop-blur-sm p-4 rounded-[22px] border border-white/5 space-y-1">
                    <div className="flex items-center gap-1.5 text-indigo-300 font-black uppercase tracking-widest text-[9px]">
                       <Zap size={10} /> Tier 1 Account
                    </div>
                    <p className="text-xl font-bold">Verified</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Quick Funding Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
             <ArrowDownLeft size={16} /> Instant Funding
          </h3>
          <div className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
            Safe Payment Gate
          </div>
        </div>

        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-6">
           <div className="relative">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">₦</div>
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-slate-50 border-none rounded-2xl py-6 pl-14 pr-6 text-2xl font-black text-slate-900 placeholder:text-slate-200 focus:ring-4 focus:ring-indigo-100 transition-all"
              />
           </div>

           <div className="grid grid-cols-4 gap-2">
              {QUICK_AMOUNTS.map(a => (
                <button
                  key={a}
                  onClick={() => handleFundWallet(a)}
                  className="py-3 bg-white border border-slate-100 rounded-xl text-xs font-black text-slate-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-95 shadow-sm"
                >
                  +{a/1000}k
                </button>
              ))}
           </div>

           <button 
              onClick={() => handleFundWallet()}
              disabled={funding || !amount}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-slate-200 border-b-4 border-slate-800 flex items-center justify-center gap-3 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50"
            >
              {funding ? <Loader2 size={24} className="animate-spin text-white/50" /> : <ShieldCheck size={20} className="fill-indigo-400 text-indigo-400" />}
              Fund via PayCampus
            </button>
        </div>
      </div>

      {/* Activity Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
             <History size={16} /> Ledger History
          </h3>
          <button className="text-xs font-bold text-indigo-600 hover:underline">Full Statement</button>
        </div>
        
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {transactions.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-12 text-center bg-white rounded-[32px] border-2 border-dashed border-slate-100"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="text-slate-200" size={24} />
                </div>
                <p className="text-slate-500 font-bold">No Activity Recorded</p>
                <p className="text-xs text-slate-400 mt-1">Start trading to build your credit score.</p>
              </motion.div>
            ) : (
              transactions.map((tx, i) => (
                <motion.div 
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white p-5 rounded-[24px] border border-slate-100 flex items-center justify-between group hover:shadow-lg hover:shadow-slate-100 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                       tx.type === 'credit' 
                        ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' 
                        : 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white'
                    }`}>
                      {tx.type === 'credit' ? <ArrowDown strokeWidth={2.5} size={20} /> : <ArrowUp strokeWidth={2.5} size={20} />}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-sm tracking-tight">{tx.description || (tx.type === 'credit' ? 'Wallet Funding' : 'Escrow Payment')}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(tx.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-lg tracking-tight ${tx.type === 'credit' ? 'text-emerald-500' : 'text-slate-900'}`}>
                      {tx.type === 'credit' ? '+' : '-'}₦{Number(tx.amount).toLocaleString()}
                    </p>
                    <div className="flex items-center justify-end gap-1 text-[9px] font-black uppercase text-slate-300 tracking-tighter">
                       <Lock size={8} /> ENCRYPTED
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

