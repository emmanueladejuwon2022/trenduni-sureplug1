import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Loader2, MapPin, Send, Zap, ChevronLeft, Lightbulb, AlertCircle, TrendingUp } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { api } from '../services/api';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SUGGESTIONS = [
  "Fix my laptop screen by tomorrow",
  "Tailor a suit for my dinner on Friday",
  "Laundry pickup for 15kg of clothes",
  "Tutorial for MAT101 derivatives"
];

export default function PostRequest({ onPostComplete, userId }: { onPostComplete: () => void, userId: string }) {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedResult, setParsedResult] = useState<{ category: string, urgency: string, description: string, title: string } | null>(null);

  const handleProcessQuery = async () => {
    if (!query.trim()) return;
    setIsProcessing(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Parse this user request into a structured marketplace demand: "${query}"`,
        config: {
          systemInstruction: "You are the campus marketplace concierge. Extract a catchy title, appropriate category (Food, Laundry, Logistics, Tutoring, Tech, Fashion, or General), urgency ('Urgent', 'Today', or 'Flexible'), and a clean description. Ensure the title is punchy and professional.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              category: { type: Type.STRING },
              urgency: { type: Type.STRING, enum: ["Urgent", "Today", "Flexible"] },
              description: { type: Type.STRING }
            },
            required: ["title", "category", "urgency", "description"]
          }
        }
      });

      const text = response.text || "";
      const result = JSON.parse(text.trim());
      setParsedResult(result);
    } catch (error) {
      console.error("AI Processing failed:", error);
      alert("Something went wrong. Please describe your request more clearly.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async () => {
    if (!parsedResult || !userId) return;
    
    setIsProcessing(true);
    try {
      await api.requests.create({
        ...parsedResult,
        userId: userId,
        status: 'open',
        createdAt: new Date().toISOString()
      });
      onPostComplete();
    } catch (error) {
      console.error("Failed to post request:", error);
      alert("Failed to post request.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto space-y-8 py-4">
      <AnimatePresence mode="wait">
        {!parsedResult ? (
          <motion.div 
            key="input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                What's on your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">mind?</span>
              </h1>
              <p className="text-slate-500 font-medium">Describe your need naturally. Our AI handles the logistics.</p>
            </div>

            <div className="space-y-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., I need a logistics person to move some boxes from Jaja Hall to Honors Hall right now..."
                  className="relative w-full h-48 p-6 bg-white border border-slate-100 rounded-3xl focus:ring-0 focus:outline-none text-slate-900 placeholder-slate-400 font-medium text-lg shadow-sm"
                />
                
                <div className="absolute bottom-6 right-6 flex items-center gap-2">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
                    <Sparkles size={12} className="animate-pulse" />
                    AI Concierge
                  </div>
                </div>
              </div>

              {/* Quick Suggestions */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Lightbulb size={14} /> Try these
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(s)}
                      className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-full text-sm font-semibold text-slate-600 hover:bg-white hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleProcessQuery}
                disabled={!query.trim() || isProcessing}
                className="w-full relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
                <div className="relative w-full bg-slate-900 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all active:scale-[0.98]">
                  {isProcessing ? (
                    <>
                      <Loader2 size={24} className="animate-spin text-indigo-400" />
                      <span className="animate-pulse">Analyzing demand...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={20} className="fill-indigo-400 text-indigo-400" />
                      Find Best Plugs
                    </>
                  )}
                </div>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
             <div className="flex items-center justify-between">
                <button 
                  onClick={() => setParsedResult(null)}
                  className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-600 transition group"
                >
                  <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                  Back to description
                </button>
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                  <TrendingUp size={12} /> Optimization Ready
                </div>
             </div>

             <div className="space-y-4">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">Review Your Demand</h2>
              
              {/* Preview Card - Matches Feed Design */}
              <div className={`bg-white p-8 rounded-[32px] shadow-xl border-t-4 border-slate-100 relative overflow-hidden ${
                parsedResult.urgency === 'Urgent' ? 'border-t-rose-500' : 
                parsedResult.urgency === 'Today' ? 'border-t-amber-500' : 'border-t-emerald-500'
              }`}>
                {/* Background Decor */}
                <div className="absolute right-0 top-0 opacity-[0.03] scale-150 transform translate-x-1/4 -translate-y-1/4">
                  <Zap size={200} strokeWidth={1} />
                </div>

                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg active:scale-95 transition">
                    {parsedResult.category}
                  </span>
                  <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${
                    parsedResult.urgency === 'Urgent' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                    parsedResult.urgency === 'Today' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    'bg-emerald-50 text-emerald-600 border-emerald-100'
                  }`}>
                    {parsedResult.urgency}
                  </div>
                </div>

                <h3 className="text-3xl font-black text-slate-900 mb-4 leading-tight">
                  {parsedResult.title}
                </h3>
                
                <p className="text-lg text-slate-500 font-medium leading-relaxed mb-8 border-l-4 border-slate-100 pl-4 py-1 italic">
                  "{parsedResult.description}"
                </p>

                <div className="grid grid-cols-2 gap-4">
                   <div className="flex items-center gap-3 text-slate-400 bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                      <MapPin size={20} className="text-slate-300" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Location</span>
                        <span className="text-sm font-bold text-slate-700">UNILAG Campus</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 text-slate-400 bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                      <Sparkles size={20} className="text-amber-400" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Visibility</span>
                        <span className="text-sm font-bold text-slate-700">450+ Active Plugs</span>
                      </div>
                   </div>
                </div>
              </div>
             </div>

             <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3 text-amber-800">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm font-medium leading-relaxed">
                  Posting this will notify verified vendors in the <span className="font-bold">{parsedResult.category}</span> category. Response times are usually under 15 minutes.
                </p>
             </div>

             <button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 text-lg group active:scale-[0.98]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={24} className="animate-spin text-indigo-400" />
                    <span>Broadcasting...</span>
                  </>
                ) : (
                  <>
                    <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    Broadcast Demand
                  </>
                )}
              </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

