import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Store, ShieldCheck, Loader2, Search, BadgeCheck, AlertCircle, AlertTriangle, CreditCard, TrendingUp } from 'lucide-react';
import { api } from '../services/api';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  matricNumber?: string;
  nin?: string;
}

interface VendorProfile {
  id: string;
  category: string;
  isVerified: boolean;
  isFeatured?: boolean;
}

interface Escrow {
  id: string;
  amount: number | string;
  status: string;
  buyerId: string;
  vendorId: string;
  requestId: string;
}

interface Dispute {
  id: string;
  escrowId: string;
  amount: number | string;
  reportedBy: string;
  otherUserId: string;
  reason: string;
  description: string;
  status: 'pending' | 'resolved_refund' | 'resolved_release';
  createdAt: any;
}

interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number | string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'vendors' | 'escrows' | 'disputes' | 'withdrawals'>('users');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    let isInitialLoad = true;
    
    // Counter to turn off loading state once all subscriptions push first event
    let eventsCount = 0;
    const checkLoading = () => {
      eventsCount++;
      if (eventsCount >= 4 && isInitialLoad) {
        setLoading(false);
        isInitialLoad = false;
      }
    };

    const unsubUsers = api.admin.subscribeUsers(data => { setUsers(data as UserProfile[]); checkLoading(); });
    const unsubVendors = api.admin.subscribeVendors(data => { setVendors(data as VendorProfile[]); checkLoading(); });
    const unsubEscrows = api.admin.subscribeEscrows(data => { setEscrows(data as Escrow[]); checkLoading(); });
    const unsubWithdrawals = api.admin.subscribeWithdrawals(data => { setWithdrawals(data as WithdrawalRequest[]); checkLoading(); });
    // setTimeout fallback in case subscriptions fail due to permission
    const to = setTimeout(() => { if (isInitialLoad) setLoading(false); }, 3000);

    return () => {
      unsubUsers();
      unsubVendors();
      unsubEscrows();
      unsubWithdrawals();
      clearTimeout(to);
    };
  }, []);

  const handleVerifyUser = async (uid: string, status: boolean) => {
    try {
      await api.admin.updateUser(uid, { isVerified: status });
      setUsers(prev => prev.map(u => u.id === uid ? { ...u, isVerified: status } : u));
    } catch (error) {
      console.error("Error verifying user:", error);
    }
  };

  const handleVerifyVendor = async (vendorId: string, status: boolean) => {
    try {
      await api.admin.updateVendor(vendorId, { isVerified: status });
      setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, isVerified: status } : v));
    } catch (error) {
      console.error("Error verifying vendor:", error);
    }
  };

  const handleFeatureVendor = async (vendorId: string, status: boolean) => {
    try {
      await api.admin.updateVendor(vendorId, { isFeatured: status });
      setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, isFeatured: status } : v));
    } catch (error) {
      console.error("Error featuring vendor:", error);
    }
  };

  const handleResolveDispute = async (dispute: Dispute, action: 'refund' | 'release') => {
    try {
      await api.admin.resolveDispute(dispute.id, action);
      setDisputes(prev => prev.map(d => d.id === dispute.id ? { ...d, status: action === 'refund' ? 'resolved_refund' : 'resolved_release' } : d));
      alert(`Dispute resolved: Funds ${action === 'refund' ? 'refunded' : 'released'}.`);
    } catch (error) {
      console.error("Error resolving dispute:", error);
      alert("Failed to resolve dispute.");
    }
  };

  const handleWithdrawalAction = async (withdrawal: WithdrawalRequest, action: 'approved' | 'rejected') => {
    try {
      await api.admin.processWithdrawal(withdrawal.id, action);
      setWithdrawals(prev => prev.map(w => w.id === withdrawal.id ? { ...w, status: action } : w));
      alert(`Withdrawal request ${action}.`);
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      alert("Failed to process withdrawal.");
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVendors = vendors.filter(v => 
    v.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Console</h2>
        <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <ShieldCheck size={14} />
          System Admin
        </div>
      </div>

      <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 min-w-[80px] py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'users' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Users size={16} />
          Users
        </button>
        <button
          onClick={() => setActiveTab('vendors')}
          className={`flex-1 min-w-[80px] py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'vendors' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Store size={16} />
          Vendors
        </button>
        <button
          onClick={() => setActiveTab('escrows')}
          className={`flex-1 min-w-[80px] py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'escrows' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <AlertCircle size={16} />
          Escrows
        </button>
        <button
          onClick={() => setActiveTab('disputes')}
          className={`flex-1 min-w-[80px] py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'disputes' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle size={16} />
          Disputes
        </button>
        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`flex-1 min-w-[80px] py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'withdrawals' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <CreditCard size={16} />
          Payouts
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
        />
      </div>

      <div className="space-y-4">
        {activeTab === 'users' && filteredUsers.map(user => (
          <div key={user.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900">{user.name || 'No Name'}</h3>
                {user.isVerified && <BadgeCheck size={16} className="text-blue-500" />}
              </div>
              <p className="text-xs text-slate-500">{user.email}</p>
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mt-1">{user.role}</p>
            </div>
            <button
              onClick={() => handleVerifyUser(user.id, !user.isVerified)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                user.isVerified 
                  ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' 
                  : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
              }`}
            >
              {user.isVerified ? 'Unverify' : 'Verify'}
            </button>
          </div>
        ))}

        {activeTab === 'vendors' && filteredVendors.map(vendor => (
          <div key={vendor.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900">{vendor.category}</h3>
                {vendor.isVerified && <BadgeCheck size={16} className="text-blue-500" />}
                {vendor.isFeatured && <TrendingUp size={16} className="text-indigo-600" />}
              </div>
              <p className="text-xs text-slate-500">ID: {vendor.id.substring(0, 8)}...</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleFeatureVendor(vendor.id, !vendor.isFeatured)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  vendor.isFeatured 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                    : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                }`}
              >
                {vendor.isFeatured ? 'Featured' : 'Feature'}
              </button>
              <button
                onClick={() => handleVerifyVendor(vendor.id, !vendor.isVerified)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  vendor.isVerified 
                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' 
                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                }`}
              >
                {vendor.isVerified ? 'Unverify' : 'Verify'}
              </button>
            </div>
          </div>
        ))}

        {activeTab === 'escrows' && escrows.map(escrow => (
          <div key={escrow.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Amount</p>
                <h3 className="text-xl font-black text-slate-900">₦{parseFloat(escrow.amount as string).toLocaleString()}</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                escrow.status === 'held' ? 'bg-amber-100 text-amber-700' : 
                escrow.status === 'released' ? 'bg-emerald-100 text-emerald-700' : 
                'bg-rose-100 text-rose-700'
              }`}>
                {escrow.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-50">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Buyer</p>
                <p className="text-xs font-medium text-slate-600 truncate">{escrow.buyerId}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vendor</p>
                <p className="text-xs font-medium text-slate-600 truncate">{escrow.vendorId}</p>
              </div>
            </div>
          </div>
        ))}
        
        {/* Simplified Withdrawals view for now */}
        {activeTab === 'withdrawals' && withdrawals.map(w => (
          <div key={w.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-indigo-600">₦{parseFloat(w.amount as string).toLocaleString()}</p>
                <p className="text-[10px] text-slate-500">User: {w.userId.substring(0, 8)}...</p>
              </div>
              <span className="text-[10px] font-bold bg-slate-100 px-2.5 py-1 rounded-full text-slate-600">{w.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
