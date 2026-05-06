import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import DemandFeed from './components/DemandFeed';
import PostRequest from './components/PostRequest';
import ChatList from './components/ChatList';
import ChatRoom from './components/ChatRoom';
import VendorList from './components/VendorList';
import VendorDetail from './components/VendorDetail';
import Profile from './components/Profile';
import Wallet from './components/Wallet';
import MyRequests from './components/MyRequests';
import Notifications from './components/Notifications';
import Onboarding from './components/Onboarding';
import AdminDashboard from './components/AdminDashboard';
import { api } from './services/api';
import { auth } from './lib/firebase';
import { Loader2, ShieldAlert, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

interface Vendor {
  id: string;
  category: string;
  description: string;
  contact: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
  photoUrl?: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'feed' | 'post' | 'chat' | 'vendors' | 'profile' | 'wallet' | 'requests' | 'notifications'>('feed');
  const [currentMode, setCurrentMode] = useState<'user' | 'vendor'>('user');
  const [user, setUser] = useState<User | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<{ id: string, otherUserId: string, contextRequest?: any } | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const currentUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          role: 'user', // Temporary until profile is fetched
          name: firebaseUser.displayName || '',
          photoUrl: firebaseUser.photoURL || ''
        };
        setUser(currentUser);
        
        try {
          const userData = await api.users.get(firebaseUser.uid) as any;
          if (userData && (userData.phoneNumber || firebaseUser.email === 'emmanueladejuwon2021@gmail.com')) {
            setHasProfile(true);
            const role = userData.role || (firebaseUser.email === 'emmanueladejuwon2021@gmail.com' ? 'admin' : 'user');
            setUserRole(role);
            if (role === 'vendor') {
              setCurrentMode('vendor');
            }
          } else {
             // User document not fully populated, meaning they haven't completed onboarding
             setHasProfile(false);
          }
        } catch (err: any) {
          console.error("Failed to fetch profile:", err);
          // If error is related to missing document, we need onboarding
          setHasProfile(false);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setHasProfile(null);
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.auth.loginWithGoogle();
      // onAuthStateChanged will handle the rest
    } catch (error: any) {
      console.error("Auth failed:", error);
      alert(error.message || "Authentication failed. Please try again.");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await api.auth.logout();
  };

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    if (tab !== 'chat') {
      setActiveChat(null);
    }
    if (tab !== 'vendors') {
      setSelectedVendor(null);
    }
  };

  const handleStartChat = async (chatId: string | null, otherUserId: string, contextRequest?: any) => {
    if (!user) return;
    
    let targetChatId = chatId;
    
    if (!targetChatId || targetChatId === 'new-chat') {
      try {
        const myChats = await api.chats.list(user.id) as any[];
        const existingChat = myChats.find((c: any) => c.participants.includes(otherUserId));
        
        if (existingChat) {
          targetChatId = existingChat.id;
        } else {
          const newChat = await api.chats.create({
            participants: [user.id, otherUserId],
            ...(contextRequest ? {
              contextRequestId: contextRequest.id,
              contextRequestText: contextRequest.title || contextRequest.description
            } : {})
          }) as any;
          targetChatId = newChat.id;
        }
      } catch (err) {
        console.error("Failed to set up the chat:", err);
        alert("Oops! We couldn't start the chat. Please try again.");
        return;
      }
    }
    
    if (targetChatId) {
      setActiveChat({ id: targetChatId, otherUserId, contextRequest });
      setActiveTab('chat');
    }
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden font-sans">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 inset-0 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
              rotate: [0, 90, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[10%] -right-[5%] w-[80%] h-[80%] bg-indigo-500 blur-[150px] rounded-full" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.05, 0.1, 0.05],
              rotate: [0, -90, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[10%] -left-[5%] w-[80%] h-[80%] bg-purple-500 blur-[150px] rounded-full" 
          />
        </div>

        <div className="max-w-md w-full px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-16"
          >
            <motion.div 
              whileHover={{ rotate: 5, scale: 1.05 }}
              className="w-24 h-24 bg-slate-900 rounded-[32px] mx-auto mb-10 flex items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[34px] blur opacity-20"></div>
              <ShoppingBag className="w-12 h-12 text-white relative z-10" />
            </motion.div>
            
            <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-4">
              Sure<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Plug.</span>
            </h1>
            <p className="text-slate-500 text-lg font-medium max-w-[280px] mx-auto leading-tight">
              The exclusive campus hub for reliable services.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            <button 
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative w-full bg-white border border-slate-100 text-slate-900 py-5 px-6 rounded-2xl font-black shadow-xl hover:shadow-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-4">
                {loading ? (
                  <Loader2 className="animate-spin text-indigo-600 w-6 h-6" />
                ) : (
                  <>
                    <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="" />
                    Continue with UNILAG Email
                  </>
                )}
              </div>
            </button>

            <div className="flex items-center gap-4 py-2">
              <div className="h-px bg-slate-100 flex-1"></div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Campus Secure</span>
              <div className="h-px bg-slate-100 flex-1"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
               <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black text-slate-900">4k+</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Students</span>
               </div>
               <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black text-slate-900">100+</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Live Plugs</span>
               </div>
            </div>
          </motion.div>

          <footer className="mt-20 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[2px] mb-4">Powered by SurePlug Ecosystem</p>
            <div className="flex items-center justify-center gap-6 text-[11px] font-bold text-slate-400">
               <span className="hover:text-slate-900 cursor-pointer transition-colors">Privacy</span>
               <span className="hover:text-slate-900 cursor-pointer transition-colors">Terms</span>
               <span className="hover:text-slate-900 cursor-pointer transition-colors">Safety</span>
            </div>
          </footer>
        </div>
      </div>
    );
  }


  if (userRole === 'admin' && activeTab === 'admin') {
    return (
      <Layout 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        userRole="admin"
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        unreadCount={unreadCount}
        notificationCount={notificationCount}
        onLogout={handleLogout}
      >
        <AdminDashboard />
      </Layout>
    );
  }

  if (hasProfile === false && user) {
    return <Onboarding onComplete={() => setHasProfile(true)} user={user} />;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={handleTabChange} 
      userRole={userRole} 
      currentMode={currentMode} 
      onModeChange={setCurrentMode}
      unreadCount={unreadCount}
      notificationCount={notificationCount}
      onLogout={handleLogout}
    >
      {activeTab === 'feed' && <DemandFeed userId={user?.id || ''} onStartChat={handleStartChat} onSelectVendor={setSelectedVendor} />}
      {activeTab === 'post' && <PostRequest userId={user?.id || ''} onPostComplete={() => handleTabChange('feed')} />}
      {activeTab === 'vendors' && !selectedVendor && (
        <VendorList onSelectVendor={setSelectedVendor} />
      )}
      {activeTab === 'vendors' && selectedVendor && (
        <VendorDetail 
          vendor={selectedVendor} 
          userId={user?.id || ''}
          onBack={() => setSelectedVendor(null)}
          onMessage={(vendorId) => handleStartChat(null, vendorId)}
        />
      )}
      {activeTab === 'chat' && !activeChat && (
        <ChatList userId={user?.id || ''} onSelectChat={(id, otherUserId) => setActiveChat({ id, otherUserId })} />
      )}
      {activeTab === 'chat' && activeChat && (
        <ChatRoom 
          chatId={activeChat.id} 
          otherUserId={activeChat.otherUserId} 
          contextRequest={activeChat.contextRequest}
          onBack={() => setActiveChat(null)} 
          userId={user?.id || ''}
        />
      )}
      {activeTab === 'wallet' && <Wallet userId={user?.id || ''} />}
      {activeTab === 'requests' && <MyRequests userId={user?.id || ''} onPostRequest={() => handleTabChange('post')} onSearch={() => handleTabChange('feed')} />}
      {activeTab === 'notifications' && <Notifications userId={user?.id || ''} />}
      {activeTab === 'profile' && <Profile currentMode={currentMode} onModeChange={setCurrentMode} onTabChange={handleTabChange} userId={user?.id || ''} />}
    </Layout>
  );
}
