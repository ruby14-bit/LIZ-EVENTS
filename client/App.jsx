import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { 
  Sparkles, Calendar, Users, Utensils, ArrowRight, X, Check, AlertTriangle, 
  Send, LayoutDashboard, MessageSquare, CreditCard, LogIn, UserPlus, 
  Edit3, Trash2, Plus, Smartphone, Loader2, MapPin, Mail, Phone,
  ChevronDown, ChevronUp, CheckCircle2, Circle, Clock // <-- ADD CLOCK HERE
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
// NEW: Import initialized services (auth, db) from your separate firebase.js file
import { auth, db } from './firebase'; 

// KEEP: Import Firebase Authentication methods
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';

// KEEP: Import Firebase Firestore methods
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  deleteDoc,
  serverTimestamp,
  updateDoc,
  limit
} from 'firebase/firestore'; 

// --- HELPER: TOAST NOTIFICATION ---
const Toast = ({ message, type, onClose }) => {
  const bgColor = type === 'success' ? 'bg-green-600/90' : 'bg-red-600/90';
  const icon = type === 'success' ? <Check size={16} className="text-green-300"/> : <AlertTriangle size={16} className="text-red-300"/>;

  useEffect(() => {
    const timer = setTimeout(() => onClose(), 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 ${bgColor} backdrop-blur-xl border border-white/10 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-500`}>
      {icon}
      <span className="text-xs font-bold uppercase tracking-widest">{message}</span>
      <button onClick={onClose} className="ml-2 text-gray-300 hover:text-white"><X size={12}/></button>
    </div>
  );
};

// --- COMPONENT: AUTH SCREEN (Login/Sign Up) ---
const AuthScreen = ({ onLogin, onSignup, onBack }) => {
  const [isLogin, setIsLogin] = useState(true); 
  const [role, setRole] = useState('client'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); 
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password || password.length < 6) {
      setError("Please enter a valid email and a password of at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
        if (isLogin) {
            await onLogin(email, password, role);
        } else {
            await onSignup(email, password, role);
        }
    } catch (err) {
        // Friendly error messages
        let msg = err.message;
        if(msg.includes('auth/invalid-credential')) msg = "Incorrect email or password.";
        if(msg.includes('auth/email-already-in-use')) msg = "Email already registered.";
        setError(msg);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative z-30 animate-in fade-in duration-700">
      <button onClick={onBack} className="absolute top-8 left-8 text-white/50 hover:text-[#FF69B4] flex items-center gap-2 transition-colors uppercase tracking-widest text-xs font-bold">
        <ArrowRight size={16} className="rotate-180" /> Return Home
      </button>

      <div className="w-full max-w-md bg-[#151520]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl">
        {error && (
            <div className="bg-red-500/10 text-red-400 border border-red-500/30 p-4 rounded-xl mb-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle size={14}/> {error}
            </div>
        )}

        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif text-white mb-2">{isLogin ? 'Welcome Back' : 'Join LIZ'}</h2>
          <p className="text-gray-400 text-sm font-light">
            {isLogin ? 'Log in to manage your events' : 'Create an account to verify your inquiry'}
          </p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-white/5 p-1 rounded-full mb-8">
          <button onClick={() => setRole('client')} className={`flex-1 py-2 rounded-full text-xs uppercase tracking-widest font-bold transition-all ${role === 'client' ? 'bg-[#FF69B4] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Client</button>
          <button onClick={() => setRole('admin')} className={`flex-1 py-2 rounded-full text-xs uppercase tracking-widest font-bold transition-all ${role === 'admin' ? 'bg-[#FFD700] text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}>Owner</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent border-b border-white/20 text-lg py-2 text-white focus:border-[#FF69B4] outline-none transition-colors" required />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent border-b border-white/20 text-lg py-2 text-white focus:border-[#FF69B4] outline-none transition-colors" required />
          </div>
          <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-2 ${role === 'client' ? 'bg-[#FF69B4] text-white' : 'bg-[#FFD700] text-black'}`}>
            {loading ? <Loader2 className="animate-spin" size={16}/> : (isLogin ? 'Enter Portal' : 'Create Account')}
          </button>
        </form>
        
        <div className="mt-8 text-center">
            <button onClick={() => { setIsLogin(!isLogin); setError(null); }} className="text-gray-400 hover:text-[#FF69B4] text-sm transition-colors">
                {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
            </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: EVENT INQUIRY FORM (Internal) ---
const InquiryForm = ({ onSubmit, userEmail }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ type: '', date: '', vibe: '', guests: 50, name: '' });
  
    const handleFinish = () => onSubmit(formData);
  
    return (
      <div className="bg-[#151520]/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 animate-in fade-in slide-in-from-bottom-8">
        <h3 className="text-2xl font-serif text-white mb-6">Create New Inquiry</h3>
        
        {step === 1 && (
            <div className="space-y-6">
                <label className="text-xs uppercase text-gray-500">Event Type</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {['Wedding', 'Corporate', 'Birthday', 'Social', 'Holiday', 'Other'].map(type => (
                        <button key={type} onClick={() => setFormData({...formData, type})} className={`p-4 rounded-xl border ${formData.type === type ? 'border-[#FF69B4] bg-[#FF69B4]/10 text-white' : 'border-white/10 text-gray-400 hover:bg-white/5'}`}>
                            {type}
                        </button>
                    ))}
                </div>
                <div className="flex justify-end"><button onClick={() => setStep(2)} disabled={!formData.type} className="px-6 py-3 bg-[#FF69B4] text-white rounded-xl text-xs font-bold uppercase disabled:opacity-50">Next</button></div>
            </div>
        )}

        {step === 2 && (
            <div className="space-y-6">
                <div>
                    <label className="text-xs uppercase text-gray-500">Event Date</label>
                    <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white mt-2"/>
                </div>
                <div>
                    <label className="text-xs uppercase text-gray-500">Guest Count: {formData.guests}</label>
                    <input type="range" min="10" max="500" value={formData.guests} onChange={e => setFormData({...formData, guests: e.target.value})} className="w-full mt-2 accent-[#FF69B4]"/>
                </div>
                <div className="flex justify-between">
                    <button onClick={() => setStep(1)} className="text-gray-500 text-xs uppercase">Back</button>
                    <button onClick={() => setStep(3)} disabled={!formData.date} className="px-6 py-3 bg-[#FF69B4] text-white rounded-xl text-xs font-bold uppercase disabled:opacity-50">Next</button>
                </div>
            </div>
        )}

        {step === 3 && (
            <div className="space-y-6">
                <div>
                    <label className="text-xs uppercase text-gray-500">Event Name</label>
                    <input type="text" placeholder="e.g. John's 30th Birthday" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white mt-2"/>
                </div>
                <div className="bg-white/5 p-4 rounded-xl text-sm text-gray-300">
                    <p><strong>Type:</strong> {formData.type}</p>
                    <p><strong>Date:</strong> {formData.date}</p>
                    <p><strong>Guests:</strong> {formData.guests}</p>
                    <p><strong>Email:</strong> {userEmail}</p>
                </div>
                <div className="flex justify-between">
                    <button onClick={() => setStep(2)} className="text-gray-500 text-xs uppercase">Back</button>
                    <button onClick={handleFinish} disabled={!formData.name} className="px-8 py-3 bg-[#FFD700] text-black rounded-xl text-xs font-bold uppercase disabled:opacity-50">Submit Inquiry</button>
                </div>
            </div>
        )}
      </div>
    );
};

// --- COMPONENT: CLIENT PORTAL ---
const ClientPortal = ({ onBack, user }) => { 
  const [activeTab, setActiveTab] = useState('status'); 
  const [myEvent, setMyEvent] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  
  // Chat State
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Payment State
  const [paymentStep, setPaymentStep] = useState('invoice'); 
  const [phoneNumber, setPhoneNumber] = useState('');

  // 1. FETCH EVENT & CHAT
  useEffect(() => {
    if(!user) return;

    // Fetch Event (Limit to most recent)
    const eventQuery = query(collection(db, 'events'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(1));
    const unsubEvent = onSnapshot(eventQuery, (snapshot) => {
      if (!snapshot.empty) {
        setMyEvent({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      } else {
        setMyEvent(null);
      }
      setLoadingEvent(false);
    });

    // Fetch Messages
    // FIX: Using a simple query. Ensure indexes are built in Firestore if prompted.
    const chatQuery = query(collection(db, 'messages'), where('chatId', '==', user.uid), orderBy('createdAt', 'asc'));
    const unsubChat = onSnapshot(chatQuery, (snapshot) => {
        setChatMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubEvent(); unsubChat(); }
  }, [user]);

  // Auto-scroll chat
  useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, activeTab]);

  // 2. ACTIONS
  const handleSubmitInquiry = async (data) => {
      try {
          await addDoc(collection(db, 'events'), {
              ...data,
              userId: user.uid,
              userEmail: user.email, // Save email for Owner to see
              status: 'New Inquiry',
              paymentStatus: 'Pending',
              createdAt: serverTimestamp()
          });
          // State will update via snapshot
      } catch (e) {
          alert("Error submitting: " + e.message);
      }
  };

  const handleSendMessage = async () => {
      if(!newMessage.trim()) return;
      const msg = newMessage;
      setNewMessage(''); 
      
      await addDoc(collection(db, 'messages'), {
          text: msg,
          senderId: user.uid,
          senderName: user.email.split('@')[0], // FIX: Save name for Owner Portal
          chatId: user.uid, 
          senderRole: 'client',
          createdAt: serverTimestamp()
      });
  };

  const handleMpesaPay = async () => {
    if (!myEvent?.quoteAmount) return;

    // Basic Validation (Remove non-digits)
    let formatted = phoneNumber.replace(/\D/g, ''); 

    // FIX: M-PESA REQUIRES 254 FORMAT. Convert 07... to 2547...
    if (formatted.startsWith('0') && formatted.length === 10) {
        formatted = '254' + formatted.substring(1);
    } else if (formatted.startsWith('7') && formatted.length === 9) {
        // Handles cases where user only types 712345678
        formatted = '254' + formatted; 
    }
    
    // Updated Validation Check for 254 format (12 digits)
    if (formatted.length !== 12 || !formatted.startsWith('254')) {
        alert("Please enter a valid M-Pesa number, starting with 0 or 254.");
        return;
    }

    setPaymentStep('processing');
    
    try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    // DEBUG: Log exactly what we are sending
    const payload = { 
        phone: formatted,         // Common backend expectation
        phoneNumber: formatted,   // Backup expectation
        amount: parseInt(myEvent.quoteAmount), // Ensure it is an Integer (no decimals/strings)
        eventId: myEvent.id 
    };
    console.log("Sending Payload:", payload);

    const response = await fetch(`${API_URL}/api/mpesa/stkpush`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
        
        // --- CRITICAL FIX: Only read the response body ONCE, regardless of status ---
        const data = await response.json().catch(e => {
            console.error("Failed to parse response JSON.", e);
            return { details: { message: `Request failed with status ${response.status} but response body was empty.` } };
        });
        // --- END CRITICAL FIX ---
        
        // App.jsx: The corrected error handling block
        if(response.ok) {
            setPaymentStep('success'); 
        } else {
            // The 'data' object read above is used here. NO SECOND read is needed.
            let errorMsg = "Could not initiate payment. Check backend/config.";
            
            if (data.details) {
                // If details is a string (e.g., network error from the backend catch block)
                if (typeof data.details === 'string') {
                    errorMsg = data.details;
                } 
                // If details is a Safaricom JSON object (contains errorMessage or message)
                else if (data.details.errorMessage) {
                    errorMsg = data.details.errorMessage; // Safaricom's specific error
                } else if (data.details.message) {
                    errorMsg = data.details.message;
                } else {
                    errorMsg = JSON.stringify(data.details); // Show the whole JSON if structure is unknown
                }
            } else if (data.error) {
                errorMsg = data.error; // Fallback for simple errors
            }
            
            alert("M-Pesa Error: " + errorMsg);
            setPaymentStep('mpesa-input');
        }
    } catch (error) {
        console.error(error);
        alert("Network Error: Ensure your backend server is running.");
        setPaymentStep('mpesa-input');
    }
};

  // --- RENDER HELPERS ---
  const getProgressStep = (status) => {
      const steps = ['New Inquiry', 'Planning', 'Confirmed', 'In Progress', 'Completed'];
      // Map status to index. If status is "Approved", we map it to "Confirmed"
      if(status === 'Approved') return 2; 
      if(status === 'Declined') return 0;
      return steps.indexOf(status) === -1 ? 0 : steps.indexOf(status);
  };

  if(loadingEvent) return <div className="h-screen flex items-center justify-center text-white"><Loader2 className="animate-spin"/></div>;

  // IF NO EVENT, SHOW INQUIRY FORM
  if(!myEvent) {
      return (
          <div className="min-h-screen pt-24 px-6 relative z-20">
              <div className="max-w-4xl mx-auto">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-serif text-white">Welcome, <span className="text-[#FF69B4]">{user.email.split('@')[0]}</span></h2>
                    <button onClick={onBack} className="text-xs uppercase text-gray-500 hover:text-white">Log Out</button>
                  </div>
                  <InquiryForm onSubmit={handleSubmitInquiry} userEmail={user.email} />
              </div>
          </div>
      );
  }

  // IF EVENT EXISTS, SHOW DASHBOARD
  const currentStep = getProgressStep(myEvent.status);
  const steps = ['Received', 'Planning', 'Confirmed', 'In Progress', 'Completed'];

  return (
    <div className="min-h-screen pt-24 px-6 pb-12 relative z-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
       <div className="max-w-6xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-serif text-white">Hello, <span className="text-[#FF69B4]">{user.email.split('@')[0]}</span></h2>
          <p className="text-gray-400 text-sm tracking-widest uppercase mt-1">
             Event: {myEvent.name} • {myEvent.date}
          </p>
        </div>
        <button onClick={onBack} className="px-6 py-2 border border-white/10 rounded-full hover:bg-white/5 text-xs uppercase tracking-widest transition-colors">Log Out</button>
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
        {/* SIDEBAR */}
        <div className="md:col-span-1">
          <div className="bg-[#151520]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-4 sticky top-24">
             {[
                 {id: 'status', icon: Clock, label: 'Timeline'},
                 {id: 'chat', icon: MessageSquare, label: 'Chat'},
                 {id: 'invoice', icon: CreditCard, label: 'Payments'},
             ].map(tab => (
                 <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all mb-2 ${activeTab === tab.id ? 'bg-[#FF69B4] text-white shadow-lg' : 'text-gray-400 hover:bg-white/5'}`}>
                    <tab.icon size={18}/>
                    <span className="text-xs font-bold uppercase tracking-widest">{tab.label}</span>
                 </button>
             ))}
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="md:col-span-3">
          
          {/* TAB: TIMELINE */}
          {activeTab === 'status' && (
            <div className="bg-[#151520]/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-2xl font-serif text-white mb-8">Event Progress</h3>
              
              {/* STATUS STEPPER */}
              <div className="relative flex justify-between items-center mb-12">
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -z-10"></div>
                  <div className="absolute top-1/2 left-0 h-1 bg-[#FF69B4] -z-10 transition-all duration-1000" style={{width: `${(currentStep / (steps.length - 1)) * 100}%`}}></div>
                  
                  {steps.map((step, idx) => {
                      const isCompleted = idx <= currentStep;
                      return (
                          <div key={idx} className="flex flex-col items-center gap-2 bg-[#151520] p-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${isCompleted ? 'bg-[#FF69B4] border-[#FF69B4] text-white' : 'bg-[#151520] border-gray-600 text-gray-600'}`}>
                                  {isCompleted ? <Check size={14}/> : <Circle size={14}/>}
                              </div>
                              <span className={`text-[10px] uppercase font-bold tracking-widest ${isCompleted ? 'text-white' : 'text-gray-600'}`}>{step}</span>
                          </div>
                      )
                  })}
              </div>

              <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                 <h4 className="text-lg text-white font-medium mb-2">Current Status: {myEvent.status}</h4>
                 <p className="text-gray-400 text-sm">
                     {myEvent.status === 'New Inquiry' && "We have received your details. Liz is reviewing them."}
                     {myEvent.status === 'Approved' && "Great news! Your event is approved. Please proceed to payment."}
                     {myEvent.status === 'Completed' && "It was a pleasure serving you!"}
                 </p>
              </div>
            </div>
          )}

          {/* TAB: CHAT */}
          {activeTab === 'chat' && (
            <div className="bg-[#151520]/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] h-[600px] flex flex-col overflow-hidden animate-in fade-in">
              <div className="p-6 border-b border-white/10 bg-white/5 flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-[#FFD700] flex items-center justify-center text-black font-bold">L</div>
                 <div>
                    <h4 className="text-white font-medium">Liz (Owner)</h4>
                    <p className="text-[10px] text-green-400 uppercase tracking-widest flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/> Online</p>
                 </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar bg-black/20">
                {chatMessages.length === 0 && <div className="text-center text-gray-500 text-xs mt-10">No messages yet. Say hello!</div>}
                {chatMessages.map(msg => {
                    const isMe = msg.senderRole === 'client';
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] p-4 rounded-2xl text-sm relative ${isMe ? 'bg-[#FF69B4] text-white rounded-tr-none' : 'bg-[#2a2a35] text-white rounded-tl-none'}`}>
                                {msg.text}
                                <span className="text-[9px] opacity-60 block mt-1 text-right">
                                    {msg.createdAt?.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 bg-white/5 border-t border-white/10">
                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="relative">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..." 
                    className="w-full bg-[#0f0f1a] border border-white/10 rounded-full py-4 pl-6 pr-14 text-white focus:outline-none focus:border-[#FF69B4] transition-colors"
                  />
                  <button type="submit" className="absolute right-2 top-2 p-2 bg-[#FF69B4] text-white rounded-full hover:scale-105 transition-transform">
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB: PAYMENT */}
          {activeTab === 'invoice' && (
            <div className="bg-[#151520]/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 animate-in fade-in">
              <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-8">
                 <div>
                   <h2 className="text-2xl font-serif text-white">Invoice</h2>
                   <p className="text-gray-400 text-xs uppercase tracking-widest mt-1">Ref: {myEvent.id.slice(0,8).toUpperCase()}</p>
                 </div>
                 <div className="text-right">
                   <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                   <p className="text-4xl font-serif text-[#FFD700]">
                       {myEvent.quoteAmount ? `KES ${parseInt(myEvent.quoteAmount).toLocaleString()}` : 'Pending Quote'}
                   </p>
                 </div>
              </div>
              
              {/* LOGIC: Show different states based on paymentStatus */}
              {myEvent.paymentStatus === 'Completed' ? (
                 <div className="bg-green-500/10 border border-green-500/30 p-8 rounded-3xl text-center flex flex-col items-center animate-in zoom-in">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                        <Check size={32} className="text-white"/>
                    </div>
                    <h3 className="text-2xl font-serif text-white">Payment Received</h3>
                    <p className="text-green-400 text-sm mt-2 uppercase tracking-widest">Transaction Complete</p>
                    <div className="mt-6 p-4 bg-black/20 rounded-xl w-full max-w-sm">
                        <div className="flex justify-between text-xs text-gray-400 mb-2"><span>Receipt No:</span> <span className="text-white">{myEvent.mpesaReceipt || 'N/A'}</span></div>
                        <div className="flex justify-between text-xs text-gray-400"><span>Date:</span> <span className="text-white">{myEvent.paidAt ? myEvent.paidAt.toDate().toLocaleDateString() : 'Just now'}</span></div>
                    </div>
                 </div>
              ) : (
                <div className="max-w-md mx-auto">
                    {paymentStep === 'invoice' && (
                        <>
                            <div className="bg-[#FF69B4]/5 border border-[#FF69B4]/20 p-6 rounded-2xl mb-6">
                                <p className="text-sm text-gray-300 mb-2">To confirm your reservation, please settle the deposit via M-Pesa.</p>
                                {!myEvent.quoteAmount && (
                                    <div className="flex items-center gap-2 text-[#FFD700] text-xs font-bold uppercase mt-2">
                                        <Loader2 size={12} className="animate-spin"/> Waiting for Owner Quote
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={() => setPaymentStep('mpesa-input')} 
                                disabled={!myEvent.quoteAmount}
                                className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 transition-all 
                                    ${!myEvent.quoteAmount 
                                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                                        : 'bg-[#25D366] text-white hover:bg-[#20bd5a]'}`}
                            >
                                <Smartphone size={16}/> Pay with M-Pesa
                            </button>
                        </>
                    )}

                    {paymentStep === 'mpesa-input' && (
                        <div className="text-center animate-in zoom-in">
                           <h3 className="text-xl text-white font-medium mb-6">Enter M-Pesa Number</h3>
                           <input type="tel" placeholder="0712 345 678" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full bg-[#1a1a24] border border-white/20 rounded-xl py-4 px-6 text-center text-2xl text-white tracking-widest mb-6 focus:border-[#25D366] outline-none" autoFocus />
                           <button onClick={handleMpesaPay} className="w-full py-4 bg-[#25D366] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:brightness-110 shadow-[0_0_20px_rgba(37,211,102,0.3)]">
                               Send Prompt (KES {myEvent.quoteAmount})
                           </button>
                           <button onClick={() => setPaymentStep('invoice')} className="mt-6 text-gray-500 text-xs uppercase hover:text-white">Cancel</button>
                        </div>
                    )}

                    {paymentStep === 'processing' && (
                        <div className="text-center py-10 animate-in fade-in">
                            <Loader2 className="animate-spin text-[#25D366] mx-auto mb-6" size={40}/>
                            <h3 className="text-white text-lg">Check your phone</h3>
                            <p className="text-gray-400 text-sm mt-2">Enter your M-Pesa PIN to complete payment.</p>
                        </div>
                    )}
                    
                    {paymentStep === 'success' && (
                         <div className="text-center py-10 animate-in fade-in">
                            <CheckCircle2 className="text-[#25D366] mx-auto mb-6" size={40}/>
                            <h3 className="text-white text-lg">Request Sent</h3>
                            <p className="text-gray-400 text-sm mt-2">Waiting for confirmation...</p>
                            <p className="text-[10px] text-gray-600 mt-6 uppercase tracking-widest animate-pulse">Do not close this window</p>
                        </div>
                    )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: OWNER PORTAL ---
const OwnerPortal = ({ onBack, user }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Real Data State
  const [inquiries, setInquiries] = useState([]);
  
  // Chat State
  const [conversations, setConversations] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [adminMessage, setAdminMessage] = useState('');
  const messagesEndRef = useRef(null);

  // 1. DATA FETCHING
  useEffect(() => {
     // Fetch Events
     const unsubInq = onSnapshot(query(collection(db, 'events'), orderBy('createdAt', 'desc')), (snap) => {
         setInquiries(snap.docs.map(d => ({id: d.id, ...d.data()})));
     });

     // Fetch Messages & Group Conversations
     const unsubMsgs = onSnapshot(query(collection(db, 'messages'), orderBy('createdAt', 'desc')), (snap) => {
        const groups = new Map();
        snap.docs.forEach(doc => {
            const data = doc.data();
            const cid = data.chatId;
            if(!cid) return;
            
            // We want the LATEST message for the list preview
            if(!groups.has(cid)) {
                groups.set(cid, { 
                    chatId: cid, 
                    lastMessage: data.text, 
                    // FIX: Capture sender name so it shows in the list
                    clientName: data.senderRole === 'client' ? data.senderName : (groups.get(cid)?.clientName || 'Unknown'),
                    timestamp: data.createdAt 
                });
            } else if (data.senderRole === 'client' && !groups.get(cid).clientName) {
                // Backfill name if we missed it
                 groups.get(cid).clientName = data.senderName;
            }
        });
        setConversations(Array.from(groups.values()));
     });

     return () => { unsubInq(); unsubMsgs(); };
  }, []);

  // 2. SELECTED CHAT FETCHING
  useEffect(() => {
      if(!selectedChatId) return;
      const q = query(collection(db, 'messages'), where('chatId', '==', selectedChatId), orderBy('createdAt', 'asc'));
      const unsub = onSnapshot(q, (snap) => {
          setChatMessages(snap.docs.map(d => ({id: d.id, ...d.data()})));
      });
      return () => unsub();
  }, [selectedChatId]);

  // Scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleAdminReply = async () => {
      if(!adminMessage.trim() || !selectedChatId) return;
      await addDoc(collection(db, 'messages'), {
          text: adminMessage,
          senderId: user.uid,
          chatId: selectedChatId,
          senderRole: 'admin',
          createdAt: serverTimestamp()
      });
      setAdminMessage('');
  };

  const handleUpdateStatus = async (id, status, currentQuote) => {
      let updates = { status };
      if (status === 'Approved' && (!currentQuote || currentQuote === 0)) {
          const amount = prompt("Enter Quote Amount (KES):", "1000");
          if(amount && !isNaN(amount)) updates.quoteAmount = parseInt(amount);
          else return;
      }
      await updateDoc(doc(db, 'events', id), updates);
  };

  const handleSetQuote = async (id) => {
      const amount = prompt("Enter Quote Amount (KES):");
      if(amount && !isNaN(amount)) await updateDoc(doc(db, 'events', id), { quoteAmount: parseInt(amount) });
  };

  const handleDelete = async (col, id) => {
      if(confirm('Delete this item?')) await deleteDoc(doc(db, col, id));
  };

  return (
    <div className="min-h-screen bg-[#0f0f1a] text-white pt-24 px-6 pb-12 relative z-20 animate-in fade-in duration-500">
       <div className="max-w-7xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-serif text-white">Dashboard</h2>
          <p className="text-gray-400 text-sm tracking-widest uppercase mt-1">LIZ Events Admin</p>
        </div>
        <button onClick={onBack} className="px-6 py-2 border border-white/10 rounded-full hover:bg-white/5 text-xs uppercase tracking-widest transition-colors">Log Out</button>
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-8">
        {/* SIDEBAR */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#151520]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-4">
            {['dashboard', 'events', 'messages'].map(tab => (
                 <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full text-left p-4 rounded-xl mb-2 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-[#FFD700] text-black' : 'text-gray-400 hover:bg-white/5'}`}>
                    {tab}
                 </button>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div className="lg:col-span-3">
          
          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="grid md:grid-cols-3 gap-6 animate-in fade-in">
                <div className="bg-[#151520]/60 border border-white/10 p-8 rounded-3xl">
                  <h3 className="text-4xl font-serif text-[#FF69B4]">{inquiries.length}</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mt-2">Total Events</p>
                </div>
                <div className="bg-[#151520]/60 border border-white/10 p-8 rounded-3xl">
                  <h3 className="text-4xl font-serif text-[#FFD700]">
                      {inquiries.filter(i => i.paymentStatus === 'Completed').length}
                  </h3>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mt-2">Paid Events</p>
                </div>
            </div>
          )}

           {/* TAB: EVENTS TABLE */}
           {activeTab === 'events' && (
            <div className="bg-[#151520]/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 overflow-x-auto animate-in fade-in">
                <table className="w-full text-left">
                    <thead className="text-gray-500 text-[10px] uppercase tracking-widest border-b border-white/10">
                        <tr>
                            <th className="pb-4">Client / Event</th>
                            <th className="pb-4">Date</th>
                            <th className="pb-4">Quote</th> 
                            <th className="pb-4">Payment</th> 
                            <th className="pb-4">Status</th>
                            <th className="pb-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {inquiries.map(inq => (
                            <tr key={inq.id} className="group hover:bg-white/5 transition-colors">
                                <td className="py-4">
                                    <div className="font-bold text-white">{inq.name}</div>
                                    <div className="text-xs text-gray-400">{inq.userEmail}</div>
                                </td>
                                <td className="py-4 text-gray-400">{inq.date}</td>
                                <td className="py-4">
                                    <button onClick={() => handleSetQuote(inq.id)} className="flex items-center gap-1 text-[#FFD700] hover:underline">
                                        {inq.quoteAmount ? `KES ${inq.quoteAmount}` : 'Set Price'} <Edit3 size={12}/>
                                    </button>
                                </td>
                                <td className="py-4">
                                    {/* FIX: Payment Status Badge */}
                                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold border ${inq.paymentStatus === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}>
                                        {inq.paymentStatus || 'Pending'}
                                    </span>
                                </td>
                                <td className="py-4">
                                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold border ${inq.status === 'Approved' ? 'text-blue-400 border-blue-400/20' : 'text-gray-400 border-gray-400/20'}`}>
                                        {inq.status}
                                    </span>
                                </td>
                                <td className="py-4 text-right flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleUpdateStatus(inq.id, 'Approved', inq.quoteAmount)} className="text-green-400 p-2 hover:bg-white/5 rounded"><Check size={16}/></button>
                                    <button onClick={() => handleUpdateStatus(inq.id, 'Declined', inq.quoteAmount)} className="text-red-400 p-2 hover:bg-white/5 rounded"><X size={16}/></button>
                                    <button onClick={() => handleDelete('events', inq.id)} className="text-gray-500 p-2 hover:bg-white/5 rounded"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {inquiries.length === 0 && <div className="text-center py-10 text-gray-500">No active inquiries.</div>}
            </div>
          )}

          {/* TAB: MESSAGES */}
          {activeTab === 'messages' && (
            <div className="grid md:grid-cols-3 gap-6 h-[600px] animate-in fade-in">
                {/* Conversations List */}
                <div className="col-span-1 bg-[#151520]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-4 overflow-y-auto custom-scrollbar">
                    <h4 className="text-xs uppercase text-gray-500 mb-4 font-bold">Inbox</h4>
                    {conversations.map(c => (
                        <button key={c.chatId} onClick={() => setSelectedChatId(c.chatId)} className={`w-full text-left p-4 rounded-xl mb-2 transition-all ${selectedChatId === c.chatId ? 'bg-[#FFD700] text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}>
                            {/* FIX: Shows Client Name */}
                            <div className="font-bold text-sm">{c.clientName || 'Unknown Client'}</div>
                            <div className="text-xs opacity-70 truncate">{c.lastMessage}</div>
                        </button>
                    ))}
                    {conversations.length === 0 && <p className="text-gray-500 text-xs">No messages yet.</p>}
                </div>
                
                {/* Chat Window */}
                <div className="col-span-2 bg-[#151520]/60 backdrop-blur-xl border border-white/10 rounded-3xl flex flex-col overflow-hidden">
                    {selectedChatId ? (
                        <>
                            <div className="p-4 bg-white/5 border-b border-white/10 font-bold text-sm">
                                Chatting with Client
                            </div>
                            <div className="flex-1 p-6 overflow-y-auto space-y-3 flex flex-col custom-scrollbar bg-black/20">
                                {chatMessages.map(msg => (
                                    <div key={msg.id} className={`max-w-[75%] p-3 rounded-xl text-sm ${msg.senderRole === 'admin' ? 'bg-[#FFD700] text-black self-end rounded-tr-none' : 'bg-[#2a2a35] text-white self-start rounded-tl-none'}`}>
                                        {msg.text}
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="p-4 bg-white/5 flex gap-2">
                                <input type="text" value={adminMessage} onChange={e => setAdminMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdminReply()} className="flex-1 bg-black/20 border border-white/10 rounded-full px-4 py-3 text-white outline-none focus:border-[#FFD700]" placeholder="Type a reply..." />
                                <button onClick={handleAdminReply} className="p-3 bg-[#FFD700] text-black rounded-full hover:scale-105 transition-transform"><Send size={18}/></button>
                            </div>
                        </>
                    ) : (
                        <div className="m-auto text-gray-500 text-sm">Select a client to view messages</div>
                    )}
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: HOME PAGE (Revised) ---
const HomePage = ({ setView }) => {
  return (
    <div className="min-h-screen relative z-10">
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0f0f1a]/80 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-serif tracking-[0.2em] text-white">LIZ</div>
          <button onClick={() => setView('auth')} className="px-6 py-2 bg-white text-black rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-[#FF69B4] hover:text-white transition-colors flex items-center gap-2">
             Sign In / Log In <LogIn size={14}/>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="pt-40 pb-20 text-center max-w-5xl mx-auto px-6">
        <h1 className="text-5xl md:text-8xl font-serif font-medium leading-tight mb-8">
          <span className="text-[#FF69B4]">Exquisite</span> Events.<br/><span className="text-white">Seamless</span> Planning.
        </h1>
        <p className="text-lg text-gray-400 font-light max-w-2xl mx-auto mb-10 leading-relaxed">
          From intimate gatherings to grand celebrations, we curate unforgettable experiences. Log in to start planning your perfect day.
        </p>
      </div>

      {/* Company Info Section (Mini-Site) */}
      <div className="max-w-7xl mx-auto px-6 pb-20 grid md:grid-cols-3 gap-8">
          <div className="bg-[#151520]/50 backdrop-blur border border-white/10 p-8 rounded-3xl hover:border-[#FF69B4]/50 transition-colors">
              <div className="w-12 h-12 bg-[#FF69B4]/20 rounded-full flex items-center justify-center text-[#FF69B4] mb-6"><Users size={24}/></div>
              <h3 className="text-xl font-serif text-white mb-3">About Us</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                  LIZ Events is a premier event management agency dedicated to transforming visions into reality. With over 10 years of experience, we specialize in creating bespoke environments that reflect your unique style.
              </p>
          </div>
          <div className="bg-[#151520]/50 backdrop-blur border border-white/10 p-8 rounded-3xl hover:border-[#FFD700]/50 transition-colors">
              <div className="w-12 h-12 bg-[#FFD700]/20 rounded-full flex items-center justify-center text-[#FFD700] mb-6"><Utensils size={24}/></div>
              <h3 className="text-xl font-serif text-white mb-3">Our Services</h3>
              <ul className="text-gray-400 text-sm space-y-2">
                  <li className="flex items-center gap-2"><CheckCircle2 size={12}/> Full-Service Catering</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={12}/> Venue Decor & Design</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={12}/> Corporate & Private Events</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={12}/> Logistics Management</li>
              </ul>
          </div>
          <div className="bg-[#151520]/50 backdrop-blur border border-white/10 p-8 rounded-3xl hover:border-blue-400/50 transition-colors">
              <div className="w-12 h-12 bg-blue-400/20 rounded-full flex items-center justify-center text-blue-400 mb-6"><MapPin size={24}/></div>
              <h3 className="text-xl font-serif text-white mb-3">Contact & Mission</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  "To deliver perfection in every detail."
              </p>
              <div className="space-y-2 text-sm text-gray-300">
                  <p className="flex items-center gap-2"><Phone size={14}/> +254 712 345 678</p>
                  <p className="flex items-center gap-2"><Mail size={14}/> hello@lizevents.co.ke</p>
              </div>
          </div>
      </div>
    </div>
  );
};

// --- COMPONENT: APP ROOT ---
const App = () => {
  const [view, setView] = useState('home'); 
  const [user, setUser] = useState(null); 
  const [userRole, setUserRole] = useState(null); 
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            const role = userDoc.exists() ? userDoc.data().role : 'client';
            setUserRole(role);
            setView(role === 'admin' ? 'admin' : 'client');
        } catch (e) { console.error(e); }
      } else {
        setUser(null);
        setView('home');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };
  
  const handleSignup = async (email, password, role) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", cred.user.uid), { role, email });
  };

  const handleLogout = async () => await signOut(auth);

  if (loading) return <div className="h-screen bg-[#0f0f1a] flex items-center justify-center"><Loader2 className="animate-spin text-[#FF69B4]" size={32}/></div>;

  return (
    <div className="relative min-h-screen bg-[#0f0f1a] text-white font-sans selection:bg-[#FF69B4] selection:text-white">
       <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#FF69B4]/10 to-transparent opacity-50"/>
          <Sparkles className="absolute top-20 left-10 text-white/5 animate-pulse" size={100}/>
       </div>
       
       {user ? (
          userRole === 'admin' ? <OwnerPortal onBack={handleLogout} user={user}/> : <ClientPortal onBack={handleLogout} user={user}/>
       ) : (
          view === 'auth' ? <AuthScreen onLogin={handleLogin} onSignup={handleSignup} onBack={() => setView('home')}/> : <HomePage setView={setView}/>
       )}
    </div>
  );
};

export default App;