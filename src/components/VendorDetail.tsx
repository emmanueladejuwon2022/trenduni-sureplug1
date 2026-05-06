import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, MapPin, Star, MessageSquare, BadgeCheck, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import Escrow from './Escrow';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: any;
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface VendorDetailProps {
  vendor: {
    id: string;
    category: string;
    description: string;
    contact: string;
    isVerified?: boolean;
    services?: any[]; // Could be string or Service object
  };
  onBack: () => void;
  onMessage: (vendorId: string) => void;
}

export default function VendorDetail({ vendor, onBack, onMessage, userId }: VendorDetailProps & { userId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [fullProfile, setFullProfile] = useState<any>(null);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.vendors.get(vendor.id);
        setFullProfile(data);
      } catch (error) {
        console.error("Error fetching vendor profile:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    const fetchReviews = async () => {
      try {
        // We'll need to define a reviews API or use a general one
        // For now, let's assume we can fetch them via a generic endpoint filter
        const fetchedReviews = [] as Review[]; // Placeholder for now
        setReviews(fetchedReviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchProfile();
    fetchReviews();

    // Track profile view
    const trackView = async () => {
      if (!userId || userId === vendor.id) return;
      try {
        // Placeholder for view tracking
      } catch (error) {
        console.error("Error tracking profile view:", error);
      }
    };
    trackView();
  }, [vendor.id, userId]);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
    : 'New';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col h-full bg-slate-50"
    >
      <div className="bg-white/90 backdrop-blur-xl border-b border-slate-100 px-6 py-5 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-500 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-100">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-slate-900">Vendor Profile</h2>
      </div>

      <div className="p-6 space-y-6 pb-24">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
          <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-6">
            <span className="text-indigo-600 font-bold text-3xl">
              {vendor.category.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-2xl font-bold text-slate-900">{vendor.category}</h1>
            {vendor.isVerified && <BadgeCheck size={24} className="text-blue-500" />}
          </div>
          <div className="flex items-center justify-center gap-1 text-amber-400 mb-4">
            <Star size={16} fill="currentColor" />
            <span className="text-sm font-medium text-slate-600">
              {averageRating} {reviews.length > 0 && `(${reviews.length} reviews)`}
            </span>
          </div>
          <p className="text-slate-600 mb-6">{vendor.description}</p>
          
          {fullProfile?.services && fullProfile.services.length > 0 && (
            <div className="space-y-3 mb-6 text-left">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Services & Pricing</p>
              {fullProfile.services.map((service: Service) => (
                <div key={service.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{service.name}</p>
                    {service.description && <p className="text-[10px] text-slate-500">{service.description}</p>}
                  </div>
                  <span className="text-sm font-black text-indigo-600">₦{service.price.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
          
          {vendor.id !== userId && (
            <div className="space-y-3">
              <button 
                onClick={() => onMessage(vendor.id)}
                className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 py-4 rounded-2xl font-bold hover:bg-indigo-100 transition-all border border-indigo-100"
              >
                <MessageSquare size={20} />
                Message Vendor
              </button>
              
              <div className="pt-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 text-center">Secure Payment</p>
                <Escrow 
                  userId={userId}
                  vendorId={vendor.id} 
                  requestId="direct-payment" 
                  onSuccess={() => alert("Payment secured in escrow!")} 
                />
                <p className="text-[10px] text-slate-400 mt-2 text-center">
                  Funds are held securely and only released when you confirm delivery.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-900 mb-4">Details</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-slate-600">
              <MapPin size={18} className="text-indigo-500" />
              <span>UNILAG Campus</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <span className="font-medium text-slate-900">Contact:</span>
              <span>{vendor.contact}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-900 mb-4">Portfolio</h3>
          {loadingProfile ? (
            <div className="flex justify-center py-4"><Loader2 className="animate-spin text-indigo-600" size={24} /></div>
          ) : !fullProfile?.portfolio || fullProfile.portfolio.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No portfolio items added yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {fullProfile.portfolio.map((item: PortfolioItem) => (
                <div key={item.id} className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                  <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    className="h-24 w-full object-cover transition-transform group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="p-2">
                    <h4 className="text-[10px] font-bold text-slate-900 truncate">{item.title}</h4>
                    <p className="text-[8px] text-slate-500 line-clamp-1">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-900 mb-4">Verified Reviews</h3>
          {loadingReviews ? (
            <div className="flex justify-center py-4"><Loader2 className="animate-spin text-indigo-600" size={24} /></div>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No reviews yet. Be the first to work with them!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-1 text-amber-400 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />
                    ))}
                  </div>
                  {review.comment && <p className="text-sm text-slate-700 mt-2">{review.comment}</p>}
                  <p className="text-xs text-slate-400 mt-2">
                    {review.createdAt?.toDate().toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
