import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Eye, Store, Save, Loader2, BadgeCheck } from 'lucide-react';
import { api } from '../services/api';

interface Service {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
}

interface VendorProfile {
  vendorId: string;
  category: string;
  description: string;
  contact: string;
  services?: Service[];
  portfolio?: PortfolioItem[];
  isVerified?: boolean;
}

export default function VendorProfileManagement({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [viewCount, setViewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');

  const [newPortfolioTitle, setNewPortfolioTitle] = useState('');
  const [newPortfolioDesc, setNewPortfolioDesc] = useState('');
  const [newPortfolioImage, setNewPortfolioImage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const vendorData = await api.vendors.get(userId) as any;
        const services = Array.isArray(vendorData.services) 
          ? vendorData.services.map((s: any) => typeof s === 'string' ? { id: Math.random().toString(36).substring(2, 11), name: s, price: 0 } : s)
          : [];
        const portfolio = Array.isArray(vendorData.portfolio) ? vendorData.portfolio : [];
        setProfile({ ...vendorData, services, portfolio } as VendorProfile);
      } catch (err) {
        console.error("Error fetching vendor profile:", err);
        setProfile({
          vendorId: userId,
          category: '',
          description: '',
          contact: '',
          services: [],
          portfolio: []
        });
      }
      setLoading(false);
    };

    const fetchViews = async () => {
      if (!userId) return;
      try {
        // Placeholder for profile views
        setViewCount(0);
      } catch (error) {
        console.error("Error fetching views:", error);
      }
    };

    fetchProfile();
    fetchViews();
  }, [userId]);

  const addService = () => {
    if (!newServiceName.trim() || !profile) return;
    const services = profile.services || [];
    const service: Service = {
      id: Math.random().toString(36).substr(2, 9),
      name: newServiceName.trim(),
      price: parseFloat(newServicePrice) || 0,
      description: newServiceDesc.trim()
    };
    setProfile({ ...profile, services: [...services, service] });
    setNewServiceName('');
    setNewServicePrice('');
    setNewServiceDesc('');
    setShowAddForm(false);
  };

  const addPortfolioItem = () => {
    if (!newPortfolioTitle.trim() || !profile) return;
    const portfolio = profile.portfolio || [];
    const item: PortfolioItem = {
      id: Math.random().toString(36).substr(2, 9),
      title: newPortfolioTitle.trim(),
      description: newPortfolioDesc.trim(),
      imageUrl: newPortfolioImage.trim() || `https://picsum.photos/seed/${newPortfolioTitle}/400/300`
    };
    setProfile({ ...profile, portfolio: [...portfolio, item] });
    setNewPortfolioTitle('');
    setNewPortfolioDesc('');
    setNewPortfolioImage('');
    setShowPortfolioForm(false);
  };

  const removeService = (id: string) => {
    if (!profile) return;
    setProfile({
      ...profile,
      services: (profile.services || []).filter(s => s.id !== id)
    });
  };

  const removePortfolioItem = (id: string) => {
    if (!profile) return;
    setProfile({
      ...profile,
      portfolio: (profile.portfolio || []).filter(p => p.id !== id)
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !userId) return;

    if (!profile.category.trim()) {
      alert('Category is required.');
      return;
    }

    setSaving(true);
    try {
      await api.vendors.update(userId, {
        category: profile.category,
        description: profile.description,
        contact: profile.contact,
        services: profile.services || [],
        portfolio: profile.portfolio || []
      });
      alert('Vendor profile updated!');
    } catch (error) {
      console.error('Error updating vendor profile:', error);
      alert('Failed to update vendor profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Store className="text-indigo-600" size={24} />
          <div>
            <h3 className="font-semibold text-slate-900">Manage Vendor Profile</h3>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
              <Eye size={12} className="text-indigo-500" />
              {viewCount} Profile Views
            </div>
          </div>
        </div>
        {profile?.isVerified && (
          <div className="flex items-center gap-1 text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            <BadgeCheck size={16} />
            Verified Vendor
          </div>
        )}
      </div>

      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <input
            required
            type="text"
            value={profile?.category || ''}
            onChange={(e) => setProfile(prev => prev ? {...prev, category: e.target.value} : null)}
            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="e.g., Printing, Food, Tech"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            value={profile?.description || ''}
            onChange={(e) => setProfile(prev => prev ? {...prev, description: e.target.value} : null)}
            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            rows={3}
            placeholder="Describe your services..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Contact</label>
          <input
            type="text"
            value={profile?.contact || ''}
            onChange={(e) => setProfile(prev => prev ? {...prev, contact: e.target.value} : null)}
            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Phone number or WhatsApp link"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-slate-700">Services & Products</label>
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              {showAddForm ? 'Cancel' : '+ Add New'}
            </button>
          </div>

          {showAddForm && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 mb-4"
            >
              <input
                type="text"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Service/Product Name"
              />
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₦</span>
                  <input
                    type="number"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Price"
                  />
                </div>
              </div>
              <textarea
                value={newServiceDesc}
                onChange={(e) => setNewServiceDesc(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Brief description (optional)"
                rows={2}
              />
              <button
                type="button"
                onClick={addService}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors"
              >
                Save Service
              </button>
            </motion.div>
          )}

          <div className="space-y-3">
            {profile?.services?.map(service => (
              <div 
                key={service.id} 
                className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between group"
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{service.name}</h4>
                  <p className="text-xs text-indigo-600 font-bold mt-0.5">₦{service.price.toLocaleString()}</p>
                  {service.description && (
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{service.description}</p>
                  )}
                </div>
                <button 
                  type="button" 
                  onClick={() => removeService(service.id)}
                  className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                >
                  &times;
                </button>
              </div>
            ))}
            {(!profile?.services || profile.services.length === 0) && !showAddForm && (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-400">No services added yet.</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-slate-700">Portfolio & Gallery</label>
            <button
              type="button"
              onClick={() => setShowPortfolioForm(!showPortfolioForm)}
              className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              {showPortfolioForm ? 'Cancel' : '+ Add Work'}
            </button>
          </div>

          {showPortfolioForm && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 mb-4"
            >
              <input
                type="text"
                value={newPortfolioTitle}
                onChange={(e) => setNewPortfolioTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Project Title"
              />
              <textarea
                value={newPortfolioDesc}
                onChange={(e) => setNewPortfolioDesc(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Project description"
                rows={2}
              />
              <input
                type="text"
                value={newPortfolioImage}
                onChange={(e) => setNewPortfolioImage(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Image URL (optional)"
              />
              <button
                type="button"
                onClick={addPortfolioItem}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors"
              >
                Add to Portfolio
              </button>
            </motion.div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {profile?.portfolio?.map(item => (
              <div 
                key={item.id} 
                className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden group relative"
              >
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-24 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="p-2">
                  <h4 className="font-bold text-slate-900 text-[10px] truncate">{item.title}</h4>
                </div>
                <button 
                  type="button" 
                  onClick={() => removePortfolioItem(item.id)}
                  className="absolute top-1 right-1 p-1 bg-white/80 backdrop-blur-sm rounded-full text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  &times;
                </button>
              </div>
            ))}
            {(!profile?.portfolio || profile.portfolio.length === 0) && !showPortfolioForm && (
              <div className="col-span-2 text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-400">No portfolio items yet.</p>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          {saving ? 'Saving...' : 'Save Vendor Profile'}
        </button>
      </form>
    </motion.div>
  );
}
