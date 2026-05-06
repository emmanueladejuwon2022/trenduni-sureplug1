import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import { ArrowLeft, Send, Loader2, Reply, X, ShieldCheck, CheckCircle2, RotateCcw, Phone, AlertTriangle, Store, Plus, CheckCheck, Star, Info, Wallet, MoreVertical, Zap, Verified, Calendar, Clock } from 'lucide-react';
import { api } from '../services/api';
import CallModal from './CallModal';
import DisputeModal from './DisputeModal';
import OtherUserProfileModal from './OtherUserProfileModal';
import ServicePickerModal from './ServicePickerModal';
import RatingModal from './RatingModal';

interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: any;
  type?: 'text' | 'escrow' | 'service';
  escrowId?: string;
  amount?: number;
  service?: {
    id: string;
    name: string;
    price: number;
    description?: string;
  };
  replyToId?: string;
  replyToText?: string;
  contextRequestId?: string;
  contextRequestText?: string;
}

interface Escrow {
  id: string;
  amount: number;
  status: 'held' | 'released' | 'refunded';
  requestId: string;
  buyerId: string;
  vendorId: string;
}

interface OtherUser {
  isOnline?: boolean;
  lastSeen?: any;
  photoUrl?: string;
  name?: string;
  isVendor?: boolean;
  category?: string;
  role?: string;
  contextRequestId?: string;
  contextRequestText?: string;
}

interface ChatRoomProps {
  chatId: string;
  otherUserId: string;
  contextRequest?: any;
  onBack: () => void;
  userId: string;
}

export default function ChatRoom({ chatId, otherUserId, contextRequest, onBack, userId }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [activeEscrows, setActiveEscrows] = useState<Escrow[]>([]);
  const [processingEscrow, setProcessingEscrow] = useState<string | null>(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState<{ escrowId: string, amount: number } | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showServicePicker, setShowServicePicker] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState<{ vendorId: string, requestId: string, vendorName: string } | null>(null);
  const [otherUserName, setOtherUserName] = useState('Campus Peer');
  const [chatContext, setChatContext] = useState<{ id: string, text: string } | null>(
    contextRequest ? { id: contextRequest.id, text: contextRequest.title || contextRequest.description } : null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) return;
    let unmounted = false;

    const fetchStatic = async () => {
      try {
        const otherUserProf = await api.users.get(otherUserId);
        if (unmounted) return;
        
        if (otherUserProf) {
          setOtherUser(otherUserProf as OtherUser);
          setOtherUserName((otherUserProf as any).name || 'Campus Peer');
          
          const otherP = otherUserProf as any;
          if (!contextRequest && otherP.contextRequestId && otherP.contextRequestText) {
            setChatContext({ id: otherP.contextRequestId, text: otherP.contextRequestText });
          }
        }
      } catch (err) {
        console.error("Error fetching other user profile:", err);
      }
    };
    
    fetchStatic();

    const unsubMessages = api.chats.subscribeMessages(chatId, (data) => {
      if (unmounted) return;
      setMessages(data as Message[]);
      scrollToBottom();
      setLoading(false);
      // Mark as read when new messages arrive while inside
      api.chats.markAsRead(chatId, userId);
    });

    // Mark as read on entry
    api.chats.markAsRead(chatId, userId);

    const unsubEscrows = api.admin.subscribeEscrows((data) => {
      if (unmounted) return;
      const allEscrows = data as any[];
      const chatEscrows = allEscrows.filter(e => 
        (e.buyerId === userId && e.vendorId === otherUserId) || 
        (e.buyerId === otherUserId && e.vendorId === userId)
      );
      setActiveEscrows(chatEscrows.filter(e => e.status === 'held'));
    });

    return () => {
      unmounted = true;
      unsubMessages();
      unsubEscrows();
    };
  }, [chatId, otherUserId, userId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userId) return;

    const text = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      await api.chats.sendMessage({
        chatId,
        senderId: userId,
        text,
        type: 'text',
        ...(replyingTo ? { replyToId: replyingTo.id, replyToText: replyingTo.text } : {}),
        ...(chatContext ? { contextRequestId: chatContext.id, contextRequestText: chatContext.text } : {})
      });
      setReplyingTo(null);
      scrollToBottom();
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      setSending(false);
    }
  };

  const handleSendService = async (service: any) => {
    if (!chatId || !userId) return;
    setSending(true);
    try {
      await api.chats.sendMessage({
        chatId,
        senderId: userId,
        text: `Proposed Service: ${service.name}`,
        type: 'service',
        service: {
          id: service.id,
          name: service.name,
          price: Number(service.price),
          description: service.description
        },
        ...(chatContext ? { contextRequestId: chatContext.id, contextRequestText: chatContext.text } : {})
      });
      setShowServicePicker(false);
      scrollToBottom();
    } catch (error) {
      console.error("Failed to send service offer", error);
    } finally {
      setSending(false);
    }
  };

  const handleCreateEscrow = async (amount: number) => {
    if (!userId) return;
    try {
      setProcessingEscrow('creating');
      const userData = await api.users.get(userId) as any;
      const balance = parseFloat(userData.walletBalance || "0");
      
      if (balance < amount) {
        alert("Insufficient balance. Top up your wallet.");
        setProcessingEscrow(null);
        return;
      }

      await api.escrows.create({
        buyerId: userId,
        vendorId: otherUserId,
        participants: [userId, otherUserId],
        requestId: chatContext?.id || 'chat_order',
        amount: amount.toString(),
        status: 'held'
      });

      await api.wallet.createTransaction({
        userId,
        amount: amount.toString(),
        type: 'debit',
        description: `Escrow Secured for ${otherUserName}`
      });
    } catch (error) {
       console.error(error);
    } finally {
      setProcessingEscrow(null);
    }
  };

  const handleReleaseEscrow = async (escrow: Escrow) => {
    setProcessingEscrow(escrow.id);
    try {
      await api.escrows.updateStatus(escrow.id, 'released');
      await api.wallet.createTransaction({
        userId: escrow.vendorId,
        amount: escrow.amount.toString(),
        type: 'credit',
        description: `Escrow Payout from Client`
      });
      setShowRatingModal({ vendorId: escrow.vendorId, requestId: escrow.requestId, vendorName: otherUserName });
    } catch (error) {
      console.error(error);
    } finally {
      setProcessingEscrow(null);
    }
  };

  const formatMessageTime = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const groupedMessages = useMemo(() => {
    const groups: { date: string, messages: Message[] }[] = [];
    messages.forEach(msg => {
      const date = new Date(msg.createdAt).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.date === date) {
        lastGroup.messages.push(msg);
      } else {
        groups.push({ date, messages: [msg] });
      }
    });
    return groups;
  }, [messages]);

  return (
    <div className="flex flex-col h-[100dvh] fixed inset-0 bg-white z-40 max-w-2xl mx-auto overflow-hidden font-sans border-x border-slate-100 shadow-2xl">
      <CallModal isOpen={showCallModal} onClose={() => setShowCallModal(false)} otherUserName={otherUserName} />
      {showDisputeModal && (
        <DisputeModal isOpen onClose={() => setShowDisputeModal(null)} escrowId={showDisputeModal.escrowId} amount={showDisputeModal.amount} otherUserId={otherUserId} userId={userId} />
      )}
      <OtherUserProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
        user={otherUser} 
        userName={otherUserName} 
      />
      {showRatingModal && (
        <RatingModal isOpen onClose={() => setShowRatingModal(null)} vendorId={showRatingModal.vendorId} userId={userId} requestId={showRatingModal.requestId} vendorName={showRatingModal.vendorName} />
      )}
      <ServicePickerModal
        isOpen={showServicePicker}
        onClose={() => setShowServicePicker(false)}
        vendorId={otherUserId}
        onSelect={handleSendService}
      />

      {/* Glass Sidebar-ish Header */}
      <Header 
        onBack={onBack} 
        otherUser={otherUser} 
        otherUserName={otherUserName} 
        setShowProfileModal={setShowProfileModal} 
        setShowCallModal={setShowCallModal} 
      />

      {/* Main Conversation Canvas */}
      <div className="flex-1 relative overflow-hidden flex flex-col bg-[#FDFEFE]">
        
        {/* Scrollable Feed */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24 custom-scrollbar scroll-smooth space-y-8">
          
          {/* Trade Info Layer */}
          <div className="sticky top-0 z-20 space-y-3 pt-2">
            <AnimatePresence>
              {chatContext && (
                <TradeContextCard context={chatContext} />
              )}
              {activeEscrows.map(escrow => (
                <EscrowHub 
                  key={escrow.id} 
                  escrow={escrow} 
                  userId={userId} 
                  processingEscrow={processingEscrow} 
                  handleReleaseEscrow={handleReleaseEscrow} 
                  setShowDisputeModal={setShowDisputeModal} 
                  otherUserName={otherUserName}
                />
              ))}
            </AnimatePresence>
          </div>

          {loading ? (
             <div className="flex justify-center p-20">
                <Loader2 className="animate-spin text-indigo-500" size={40} strokeWidth={1.5} />
             </div>
          ) : messages.length === 0 ? (
            <EmptyChatState otherUserName={otherUserName} />
          ) : (
            <div className="space-y-12">
              <LayoutGroup>
                {groupedMessages.map((group, gIdx) => (
                  <div key={group.date} className="space-y-6">
                    <div className="flex justify-center">
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
                         {group.date}
                       </span>
                    </div>
                    
                    <div className="space-y-2">
                      {group.messages.map((msg, mIdx) => (
                        <MessageBubble 
                          key={msg.id}
                          msg={msg} 
                          userId={userId} 
                          index={mIdx} 
                          isMe={msg.senderId === userId}
                          isSystem={msg.senderId === 'system'}
                          previousMsg={group.messages[mIdx - 1]}
                          onReply={() => setReplyingTo(msg)}
                          onAddEscrow={handleCreateEscrow}
                          processingEscrow={processingEscrow}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </LayoutGroup>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Glossy Input Dock */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-2xl border-t border-slate-100 z-30">
          <AnimatePresence>
            {replyingTo && (
              <ReplyPreview replyingTo={replyingTo} onCancel={() => setReplyingTo(null)} />
            )}
          </AnimatePresence>
          
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            {otherUser?.role === 'vendor' && otherUserId !== userId && (
              <button
                type="button"
                onClick={() => setShowServicePicker(true)}
                className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-90 shrink-0 border border-indigo-100/50"
              >
                <Plus size={24} strokeWidth={2.5} />
              </button>
            )}
            
            <div className="flex-1 relative group">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full bg-slate-100/50 py-3.5 px-6 rounded-2xl border-2 border-transparent focus:border-indigo-600/10 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 outline-none text-sm font-bold shadow-inner transition-all placeholder:text-slate-400 text-slate-800"
                disabled={sending}
              />
            </div>
            
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:bg-indigo-600 transition-all disabled:opacity-20 shadow-xl shadow-slate-200 active:scale-95 shrink-0 group relative overflow-hidden"
            >
              {sending ? (
                <Loader2 size={22} className="animate-spin text-white/50" strokeWidth={3} />
              ) : (
                <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" strokeWidth={3} />
              )}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}

function Header({ onBack, otherUser, otherUserName, setShowProfileModal, setShowCallModal }: any) {
  return (
    <div className="bg-white px-5 py-4 flex items-center justify-between border-b border-slate-50 relative z-40 shadow-sm">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 text-slate-400 hover:text-slate-900 transition-all rounded-2xl hover:bg-slate-50 active:scale-90">
          <ArrowLeft size={22} strokeWidth={2.5} />
        </button>
        <button 
          onClick={() => setShowProfileModal(true)}
          className="flex items-center gap-3 text-left group"
        >
          <div className="relative">
            <div className="w-12 h-12 rounded-[20px] bg-slate-50 border border-slate-100 shadow-sm flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
              {otherUser?.photoUrl ? (
                <img src={otherUser.photoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-slate-900 font-black text-lg">
                  {otherUserName.substring(0, 1).toUpperCase()}
                </span>
              )}
            </div>
            {otherUser?.isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-[3px] border-white shadow-sm" />
            )}
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5 leading-none mb-1">
              {otherUserName}
              {otherUser?.isVendor && <Verified size={15} className="text-blue-500 fill-blue-50" />}
            </h2>
            <div className="flex items-center gap-1.5">
               <div className={`w-1.5 h-1.5 rounded-full ${otherUser?.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
               <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none translate-y-[0.5px]">
                 {otherUser?.isOnline ? 'Active Now' : 'Last seen recently'}
               </p>
            </div>
          </div>
        </button>
      </div>
      
      <div className="flex items-center gap-2">
        <button onClick={() => setShowCallModal(true)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all active:scale-90">
          <Phone size={20} strokeWidth={2.5} />
        </button>
        <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all">
          <MoreVertical size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

function TradeContextCard({ context }: { context: any }) {
  return (
    <motion.div 
       initial={{ opacity: 0, y: -20 }}
       animate={{ opacity: 1, y: 0 }}
       exit={{ opacity: 0, scale: 0.95 }}
       className="bg-white/90 backdrop-blur-xl p-4 rounded-[28px] border border-white shadow-xl shadow-slate-200/40 flex items-center justify-between group cursor-pointer hover:shadow-indigo-100 hover:border-indigo-50 transition-all border-b-2 border-slate-50 underline-offset-4"
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-lg shadow-slate-200">
          <Zap size={20} className="fill-white" />
        </div>
        <div className="overflow-hidden">
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Demanding Topic</p>
           <p className="text-sm font-black text-slate-800 truncate leading-none">{context.text}</p>
        </div>
      </div>
      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-all">
        <Info size={16} />
      </div>
    </motion.div>
  );
}

function EscrowHub({ escrow, userId, processingEscrow, handleReleaseEscrow, setShowDisputeModal, otherUserName }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 p-6 rounded-[32px] text-white shadow-2xl shadow-indigo-200/60 border border-white/10 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
      
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/20">
              <ShieldCheck size={20} strokeWidth={2.5} />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200/80 mb-0.5">Funds Secured</p>
              <h4 className="text-2xl font-black tracking-tighter">₦{Number(escrow.amount).toLocaleString()}</h4>
           </div>
        </div>
        <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 border border-white/20">
          HELD IN ESCROW
        </div>
      </div>

      <div className="flex gap-2 relative z-10">
        {escrow.buyerId === userId ? (
          <button 
            onClick={() => handleReleaseEscrow(escrow)}
            disabled={!!processingEscrow}
            className="flex-1 bg-white text-indigo-600 py-3.5 rounded-2xl font-black text-xs hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95"
          >
            {processingEscrow === escrow.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} strokeWidth={3} />}
            Confirm & Pay {otherUserName}
          </button>
        ) : (
          <div className="flex-1 bg-white/10 backdrop-blur-md py-3 rounded-2xl text-center border border-white/10">
            <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest flex items-center justify-center gap-2">
               <Clock size={12} />
               Waiting for release...
            </p>
          </div>
        )}
        
        <button 
          onClick={() => setShowDisputeModal({ escrowId: escrow.id, amount: Number(escrow.amount) })}
          className="w-14 bg-rose-500/20 text-white rounded-2xl hover:bg-rose-500 transition-all flex items-center justify-center border border-white/10"
        >
          <AlertTriangle size={20} />
        </button>
      </div>
    </motion.div>
  );
}

function EmptyChatState({ otherUserName }: { otherUserName: string }) {
  return (
    <div className="text-center py-24 px-10">
      <div className="relative inline-block mb-8">
        <div className="w-20 h-20 bg-indigo-50 border-4 border-white rounded-[32px] flex items-center justify-center mx-auto shadow-xl transform rotate-3">
           <Zap size={32} className="text-indigo-400 fill-indigo-100" />
        </div>
        <div className="absolute -top-2 -right-2 w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xs font-black shadow-lg shadow-slate-200 transform -rotate-12 border-2 border-white">
          Hi!
        </div>
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Meet {otherUserName}!</h3>
      <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
        Agree on the details, set the price, and use <span className="text-indigo-600 font-black">SurePlug Escrow</span> for automated security.
      </p>
    </div>
  );
}

function MessageBubble({ msg, userId, index, isMe, isSystem, previousMsg, onReply, onAddEscrow, processingEscrow }: any) {
  const isSameSender = previousMsg?.senderId === msg.senderId;
  const isSystemMsg = msg.senderId === 'system';

  if (isSystemMsg) {
    return (
      <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center py-4">
        <span className="bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-full border border-slate-200">
          {msg.text}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex ${isMe ? 'justify-end' : 'justify-start'} group mb-0.5`}
    >
      <div className={`max-w-[85%] space-y-1 relative flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
        
        <div className="flex items-center gap-2 group/bubble">
          {isMe && (
            <button 
              onClick={onReply}
              className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-indigo-500 transition-all hover:bg-slate-50 rounded-xl active:scale-90"
            >
              <Reply size={16} strokeWidth={3} />
            </button>
          )}

          <div 
            className={`px-5 py-3.5 shadow-sm relative transition-all duration-300 ${
              isMe 
                ? 'bg-slate-900 text-white rounded-[24px] rounded-br-sm' 
                : 'bg-white text-slate-800 rounded-[24px] rounded-bl-sm border border-slate-100 shadow-slate-200/20'
            }`}
          >
            {msg.contextRequestText && index === 0 && (
              <div className={`mb-4 p-3 rounded-2xl text-[11px] font-bold border-2 ${isMe ? 'bg-white/10 border-white/20 text-indigo-200' : 'bg-indigo-50/50 border-indigo-100/50 text-indigo-600'}`}>
                <div className="flex items-center gap-1.5 mb-1 opacity-70">
                   <Zap size={10} strokeWidth={3} />
                   <p className="uppercase tracking-[0.2em] text-[8px] font-black">Trade Topic</p>
                </div>
                {msg.contextRequestText}
              </div>
            )}

            {msg.replyToText && (
              <div className={`mb-3 p-3 rounded-2xl text-xs border-l-[3px] transition-all ${isMe ? 'bg-white/10 border-indigo-400 text-slate-300 hover:bg-white/20' : 'bg-slate-50 border-indigo-500 text-slate-500 hover:bg-slate-100'}`}>
                <p className="line-clamp-2 italic font-bold leading-relaxed">"{msg.replyToText}"</p>
              </div>
            )}
            
            <p className="text-[15px] font-semibold leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
            
            {msg.type === 'service' && msg.service && (
              <ServiceOfferCard msg={msg} isMe={isMe} onAddEscrow={onAddEscrow} processingEscrow={processingEscrow} />
            )}
          </div>

          {!isMe && (
            <button 
              onClick={onReply}
              className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-indigo-500 transition-all hover:bg-slate-50 rounded-xl active:scale-90"
            >
              <Reply size={16} strokeWidth={3} />
            </button>
          )}
        </div>
        
        {!isSameSender && (
          <div className={`flex items-center gap-2 px-1 mt-1 ${isMe ? 'justify-end' : ''}`}>
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest tabular-nums italic">
               {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </span>
             {isMe && (
               <div className="flex items-center gap-0.5">
                  <CheckCheck size={12} className="text-indigo-500" strokeWidth={3} />
               </div>
             )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ServiceOfferCard({ msg, isMe, onAddEscrow, processingEscrow }: any) {
  return (
    <div className={`mt-5 rounded-3xl p-5 border shadow-xl transition-all hover:scale-[1.02] ${
      isMe 
        ? 'bg-white/10 border-white/20 text-white' 
        : 'bg-white border-slate-100 text-slate-900 shadow-slate-200/50'
    }`}>
       <div className="flex items-center gap-4 mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isMe ? 'bg-white/20' : 'bg-indigo-50 text-indigo-600'}`}>
             <Store size={22} strokeWidth={2.5} />
          </div>
          <div className="overflow-hidden">
            <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>Service Proposition</p>
            <h4 className="font-black text-sm truncate uppercase tracking-tight">{msg.service.name}</h4>
          </div>
       </div>
       
       <div className={`flex items-center justify-between pt-4 border-t ${isMe ? 'border-white/10' : 'border-slate-50'}`}>
          <div className="flex flex-col">
             <span className={`text-[9px] font-black uppercase tracking-widest ${isMe ? 'text-indigo-200/50' : 'text-slate-300'}`}>FEE</span>
             <p className="text-xl font-black tracking-tighter">₦{Number(msg.service.price).toLocaleString()}</p>
          </div>
          {!isMe && (
            <button 
              onClick={() => onAddEscrow(msg.service.price)}
              disabled={!!processingEscrow}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-2xl text-[11px] font-black hover:bg-slate-900 active:scale-95 transition-all shadow-xl shadow-indigo-200"
            >
              {processingEscrow === 'creating' ? <Loader2 size={16} className="animate-spin" /> : 'SECURE DEAL'}
            </button>
          )}
          {isMe && (
            <div className="bg-white/20 px-4 py-2 rounded-2xl border border-white/10">
               <p className="text-[10px] font-black uppercase tracking-widest text-white/70">Offer Sent</p>
            </div>
          )}
       </div>
    </div>
  );
}

function ReplyPreview({ replyingTo, onCancel }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="mb-4 flex items-center justify-between bg-slate-50 p-4 rounded-[24px] border-2 border-indigo-50/50 shadow-inner"
    >
      <div className="flex items-center gap-3 overflow-hidden">
         <div className="w-1.5 h-8 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
         <div className="overflow-hidden">
           <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1">Replying to message</p>
           <p className="text-xs text-slate-500 truncate font-semibold italic">"{replyingTo.text}"</p>
         </div>
      </div>
      <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-white rounded-full transition-all shadow-sm active:scale-90">
        <X size={18} strokeWidth={3} />
      </button>
    </motion.div>
  );
}


