import { 
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, 
  query, where, orderBy, serverTimestamp, deleteDoc, onSnapshot, increment
} from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { db, auth } from '../lib/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      providerInfo: auth.currentUser?.providerData?.map(p => ({ providerId: p.providerId, email: p.email })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const api = {
  auth: {
    loginWithGoogle: async () => {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user exists in our db, if not create
      let userDoc;
      const pathForGet = `users/${result.user.uid}`;
      try {
        userDoc = await getDoc(doc(db, 'users', result.user.uid));
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, pathForGet);
      }
      
      if (!userDoc || !userDoc.exists()) {
        try {
          await setDoc(doc(db, 'users', result.user.uid), {
            email: result.user.email,
            name: result.user.displayName,
            role: 'user', // default
            walletBalance: 0,
            createdAt: new Date().toISOString()
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, pathForGet);
        }
      }
      
      return { 
        token: await result.user.getIdToken(),
        user: {
          id: result.user.uid,
          email: result.user.email,
          name: result.user.displayName,
          role: userDoc && userDoc.exists() ? userDoc.data().role : 'user'
        }
      };
    },
    logout: async () => {
      await signOut(auth);
    }
  },
  users: {
    get: async (id: string) => {
      if (!id || id === 'Unknown') return null;
      try {
        const snap = await getDoc(doc(db, 'users', id));
        if (!snap.exists()) return null;
        return { id: snap.id, ...snap.data() };
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${id}`);
      }
    },
    create: async (data: any) => {
      // Handled in auth usually, but if needed via admin
    },
    update: async (id: string, data: any) => {
      try {
        await updateDoc(doc(db, 'users', id), data);
        return { id, ...data };
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${id}`);
      }
    },
    subscribe: (id: string, callback: (data: any) => void) => {
      return onSnapshot(doc(db, 'users', id), snap => {
        if (snap.exists()) {
          callback({ id: snap.id, ...snap.data() });
        }
      }, err => handleFirestoreError(err, OperationType.GET, `users/${id}`));
    },
  },
  requests: {
    list: async () => {
      try {
        const snap = await getDocs(collection(db, 'requests'));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'requests');
      }
      return [];
    },
    subscribe: (callback: (data: any[]) => void) => {
      return onSnapshot(collection(db, 'requests'), (snap) => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, 'requests');
      });
    },
    create: async (data: any) => {
      try {
        const ref = await addDoc(collection(db, 'requests'), {
          ...data,
          createdAt: new Date().toISOString()
        });
        return { id: ref.id, ...data };
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'requests');
      }
    },
    update: async (id: string, data: any) => {
      try {
        await updateDoc(doc(db, 'requests', id), {
          ...data,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `requests/${id}`);
      }
    },
  },
  vendors: {
    list: async () => {
      try {
        const snap = await getDocs(collection(db, 'vendors'));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'vendors');
      }
      return [];
    },
    subscribe: (callback: (data: any[]) => void) => {
      return onSnapshot(collection(db, 'vendors'), (snap) => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, 'vendors');
      });
    },
    get: async (id: string) => {
      try {
        const snap = await getDoc(doc(db, 'vendors', id));
        if (!snap.exists()) return {};
        return { id: snap.id, ...snap.data() };
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `vendors/${id}`);
      }
      return {};
    },
    update: async (id: string, data: any) => {
      try {
        await updateDoc(doc(db, 'vendors', id), {
          ...data,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `vendors/${id}`);
      }
    },
    createOrUpdate: async (id: string, data: any) => {
      try {
        await setDoc(doc(db, 'vendors', id), {
          ...data,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `vendors/${id}`);
      }
    },
  },
  wallet: {
    getTransactions: async (userId: string) => {
      try {
        const q = query(collection(db, 'transactions'), where('userId', '==', userId));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'transactions');
      }
      return [];
    },
    subscribeTransactions: (userId: string, callback: (data: any[]) => void) => {
      const q = query(collection(db, 'transactions'), where('userId', '==', userId));
      return onSnapshot(q, snap => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, err => handleFirestoreError(err, OperationType.LIST, 'transactions'));
    },
    createTransaction: async (data: any) => {
      try {
        const amount = parseFloat(data.amount);
        const factor = data.type === 'credit' ? 1 : -1;
        const change = amount * factor;

        // 1. Create Transaction Document
        const ref = await addDoc(collection(db, 'transactions'), {
          ...data,
          createdAt: new Date().toISOString()
        });

        // 2. Update User Wallet Balance Atomically
        await updateDoc(doc(db, 'users', data.userId), {
          walletBalance: increment(change)
        });

        return { id: ref.id, ...data };
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'transactions');
      }
    },
    withdraw: async (data: any) => {
      try {
        const ref = await addDoc(collection(db, 'withdrawals'), {
          ...data,
          status: 'pending',
          createdAt: new Date().toISOString()
        });
        return { id: ref.id, ...data };
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'withdrawals');
      }
    },
  },
  chats: {
    list: async (userId: string) => {
      try {
        // To be simpler, read all and filter in frontend (not ideal but works for small scale)
        // Or query where participants array-contains userId:
        const q = query(collection(db, 'chats'), where('participants', 'array-contains', userId));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'chats');
      }
      return [];
    },
    subscribe: (userId: string, callback: (data: any[]) => void) => {
      const q = query(collection(db, 'chats'), where('participants', 'array-contains', userId));
      return onSnapshot(q, snap => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, err => handleFirestoreError(err, OperationType.LIST, 'chats'));
    },
    create: async (data: any) => {
      try {
        const ref = await addDoc(collection(db, 'chats'), {
          ...data,
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        });
        return { id: ref.id, ...data };
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'chats');
      }
    },
    markAsRead: async (chatId: string, userId: string) => {
      try {
        await updateDoc(doc(db, 'chats', chatId), {
          [`lastReadAt.${userId}`]: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `chats/${chatId}`);
      }
    },
    messages: async (chatId: string) => {
      try {
        const q = query(collection(db, 'messages'), where('chatId', '==', chatId), orderBy('createdAt', 'asc'));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'messages');
      }
      return [];
    },
    subscribeMessages: (chatId: string, callback: (data: any[]) => void) => {
      const q = query(collection(db, 'messages'), where('chatId', '==', chatId), orderBy('createdAt', 'asc'));
      return onSnapshot(q, snap => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, err => handleFirestoreError(err, OperationType.LIST, 'messages'));
    },
    sendMessage: async (data: any) => {
      try {
        // Atomic: 1. Send Message
        const now = new Date().toISOString();
        const ref = await addDoc(collection(db, 'messages'), {
          ...data,
          createdAt: now
        });
        
        const previewText = data.text.length > 100 ? data.text.substring(0, 100) + '...' : data.text;
        
        // 2. Update Chat metadata
        await updateDoc(doc(db, 'chats', data.chatId), {
          lastMessage: previewText,
          updatedAt: now,
          [`lastReadAt.${data.senderId}`]: now
        });

        return { id: ref.id, ...data };
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'messages');
      }
    },
  },
  notifications: {
    list: async (userId: string) => {
      try {
        const q = query(collection(db, 'notifications'), where('userId', '==', userId));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'notifications');
      }
      return [];
    },
    subscribe: (userId: string, callback: (data: any[]) => void) => {
      const q = query(collection(db, 'notifications'), where('userId', '==', userId));
      return onSnapshot(q, snap => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, err => handleFirestoreError(err, OperationType.LIST, 'notifications'));
    },
    markAsRead: async (id: string) => {
      try {
        await updateDoc(doc(db, 'notifications', id), { read: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `notifications/${id}`);
      }
    },
  },
  disputes: {
    create: async (data: any) => {
      try {
        const ref = await addDoc(collection(db, 'disputes'), {
          ...data,
          createdAt: new Date().toISOString()
        });
        return { id: ref.id, ...data };
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'disputes');
      }
    }
  },
  escrows: {
    list: async (userId: string) => {
      try {
        const q = query(collection(db, 'escrows'), where('participants', 'array-contains', userId));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'escrows');
      }
      return [];
    },
    subscribe: (userId: string, callback: (data: any[]) => void) => {
      const q = query(collection(db, 'escrows'), where('participants', 'array-contains', userId));
      return onSnapshot(q, snap => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, err => handleFirestoreError(err, OperationType.LIST, 'escrows'));
    },
    create: async (data: any) => {
      try {
        const ref = await addDoc(collection(db, 'escrows'), {
          ...data,
          createdAt: new Date().toISOString()
        });
        return { id: ref.id, ...data };
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'escrows');
      }
    },
    update: async (id: string, data: any) => {
      try {
        await updateDoc(doc(db, 'escrows', id), data);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `escrows/${id}`);
      }
    },
    updateStatus: async (id: string, status: string) => {
      try {
        await updateDoc(doc(db, 'escrows', id), { status, updatedAt: new Date().toISOString() });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `escrows/${id}`);
      }
    },
  },
  admin: {
    listUsers: async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'users');
      }
      return [];
    },
    subscribeUsers: (callback: (data: any[]) => void) => {
      return onSnapshot(collection(db, 'users'), snap => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, err => handleFirestoreError(err, OperationType.LIST, 'users'));
    },
    updateUser: async (id: string, data: any) => {
      try {
        await updateDoc(doc(db, 'users', id), data);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${id}`);
      }
    },
    listVendors: async () => {
      try {
        const snap = await getDocs(collection(db, 'vendors'));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'vendors');
      }
      return [];
    },
    subscribeVendors: (callback: (data: any[]) => void) => {
      return onSnapshot(collection(db, 'vendors'), snap => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, err => handleFirestoreError(err, OperationType.LIST, 'vendors'));
    },
    updateVendor: async (id: string, data: any) => {
      try {
        await updateDoc(doc(db, 'vendors', id), data);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `vendors/${id}`);
      }
    },
    listEscrows: async () => {
      try {
        const snap = await getDocs(collection(db, 'escrows'));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'escrows');
      }
      return [];
    },
    subscribeEscrows: (callback: (data: any[]) => void) => {
      return onSnapshot(collection(db, 'escrows'), snap => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, err => handleFirestoreError(err, OperationType.LIST, 'escrows'));
    },
    listDisputes: async () => {
      try {
        const snap = await getDocs(collection(db, 'disputes'));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'disputes');
      }
      return [];
    },
    subscribeDisputes: (callback: (data: any[]) => void) => {
      return onSnapshot(collection(db, 'disputes'), snap => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, err => handleFirestoreError(err, OperationType.LIST, 'disputes'));
    },
    resolveDispute: async (id: string, action: string) => {
      // Just pseudo implementation for now since it's admin
      try {
        await updateDoc(doc(db, 'disputes', id), { status: 'resolved', resolution: action });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `disputes/${id}`);
      }
    },
    listWithdrawals: async () => {
      try {
        const snap = await getDocs(collection(db, 'withdrawals'));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'withdrawals');
      }
      return [];
    },
    subscribeWithdrawals: (callback: (data: any[]) => void) => {
      return onSnapshot(collection(db, 'withdrawals'), snap => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, err => handleFirestoreError(err, OperationType.LIST, 'withdrawals'));
    },
    processWithdrawal: async (id: string, action: string) => {
      try {
        await updateDoc(doc(db, 'withdrawals', id), { status: action === 'approve' ? 'approved' : 'rejected' });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `withdrawals/${id}`);
      }
    },
  },
  reviews: {
    create: async (data: any) => {
      try {
        const ref = await addDoc(collection(db, 'reviews'), {
          ...data,
          createdAt: new Date().toISOString()
        });
        return { id: ref.id, ...data };
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'reviews');
      }
    },
    list: async (vendorId: string) => {
      try {
        const q = query(collection(db, 'reviews'), where('vendorId', '==', vendorId));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, 'reviews');
      }
      return [];
    },
  }
};
