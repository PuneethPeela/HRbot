import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Bot, Lock } from 'lucide-react';
import axios from 'axios';
import { auth, signInWithEmailAndPassword, onAuthStateChanged } from './firebase';
import ChatWindow from './components/ChatWindow';
import Sidebar from './components/Sidebar';
import AdminPanel from './components/AdminPanel';

function App() {
  const [view, setView] = useState('chat'); // 'chat' or 'admin'
  const [tickets, setTickets] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [user, setUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Authentication Listener & Axios Interceptor
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const token = await currentUser.getIdToken();
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        axios.defaults.headers.common['Authorization'] = `Bearer mock_token_for_testing`;
      }
    });
    return unsubscribe;
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      setAuthError('');
    } catch (err) {
      setAuthError('Invalid credentials or testing mode active. Please check your config.');
      setUser({ email: loginEmail, uid: "mock_user" });
    }
  };

  if (!user || !acceptedTerms) {
    return (
      <div className="relative min-h-screen bg-brand-dark flex flex-col items-center justify-center p-4 overflow-hidden font-display">
        {/* Animated Background Gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-accent rounded-full mix-blend-screen filter blur-[150px] opacity-30 animate-pulse-glow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-brand-glow rounded-full mix-blend-screen filter blur-[150px] opacity-30 animate-pulse-glow" style={{ animationDelay: '2s' }}></div>

        {/* Infinite Carousel Background Element */}
        <div className="absolute top-10 left-0 w-full overflow-hidden opacity-20 pointer-events-none">
          <div className="flex w-[200%] animate-infinite-scroll">
            {['RAG Architecture', 'Multi-Agent Routing', 'Compliance Firewall', 'Automated Escalation', 'Vector Search', 'Async FastAPI', 'Firebase Auth'].map((text, i) => (
              <div key={i} className="text-4xl font-bold text-white px-8 whitespace-nowrap">
                {text} •
              </div>
            ))}
            {['RAG Architecture', 'Multi-Agent Routing', 'Compliance Firewall', 'Automated Escalation', 'Vector Search', 'Async FastAPI', 'Firebase Auth'].map((text, i) => (
              <div key={`dup-${i}`} className="text-4xl font-bold text-white px-8 whitespace-nowrap">
                {text} •
              </div>
            ))}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-4xl w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-glass overflow-hidden flex flex-col md:flex-row z-10"
        >
          {/* Left Hero - Glassmorphism */}
          <div className="relative p-12 md:w-1/2 flex flex-col justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/20 to-brand-glow/20 mix-blend-overlay"></div>
            <motion.div animate={{ y: [-10, 10, -10] }} transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}>
              <Bot size={64} className="mb-8 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
            </motion.div>
            <h1 className="text-4xl font-bold mb-4 text-white tracking-tight">Promtal HRBot</h1>
            <p className="text-gray-300 text-lg font-light leading-relaxed mb-8">
              The next-generation, AI-native HR Helpdesk. 
              Powered by highly concurrent multi-agent architecture and rigorous compliance guardrails.
            </p>
            <div className="flex gap-4">
              <span className="px-4 py-1.5 bg-white/10 rounded-full text-xs text-white border border-white/10 backdrop-blur-md">React + Vite</span>
              <span className="px-4 py-1.5 bg-white/10 rounded-full text-xs text-white border border-white/10 backdrop-blur-md">FastAPI Async</span>
              <span className="px-4 py-1.5 bg-white/10 rounded-full text-xs text-white border border-white/10 backdrop-blur-md">Agentic AI</span>
            </div>
          </div>
          
          {/* Right Login/Terms */}
          <div className="p-12 md:w-1/2 bg-white flex flex-col justify-center">
            {!user ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                  <div className="p-2 bg-brand-accent/10 rounded-lg"><Lock size={24} className="text-brand-accent"/></div> 
                  Secure Gateway
                </h2>
                {authError && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm p-3 bg-red-50 text-red-600 rounded-lg border border-red-100">
                    {authError}
                  </motion.p>
                )}
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-1 block">Employee Email</label>
                  <input type="email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} required 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mt-1 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:bg-white transition-all" 
                    placeholder="name@promtal.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600 mb-1 block">Authentication Key</label>
                  <input type="password" value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} required 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mt-1 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:bg-white transition-all" 
                    placeholder="••••••••"
                  />
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-brand-accent to-brand-glow text-white py-4 rounded-xl font-bold text-lg hover:shadow-neon hover:scale-[1.02] transition-all duration-300 mt-4">
                  Authenticate
                </button>
              </form>
            ) : (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg"><ShieldAlert className="text-orange-600" /></div>
                  Compliance Check
                </h2>
                <div className="space-y-5 text-sm text-gray-600 mb-10">
                  <p className="bg-orange-50 p-5 rounded-2xl border border-orange-200 text-orange-900 shadow-sm">
                    <strong className="block mb-1 text-orange-950">Strict Liability Disclaimer:</strong> 
                    HRBot operates as an automated routing and policy retrieval agent. It does not provide legally binding advice.
                  </p>
                  <p className="px-2">
                    All telemetry is strictly monitored. Queries matching harassment, legal disputes, or termination policies are routed to human operators via Webhooks within 120ms.
                  </p>
                </div>
                <button 
                  onClick={() => setAcceptedTerms(true)}
                  className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-black hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  Acknowledge & Initialize
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">
      <Sidebar view={view} setView={setView} />
      <main className="flex-1 flex flex-col h-full bg-white relative shadow-2xl rounded-l-3xl z-10 overflow-hidden">
        {view === 'chat' ? (
          <ChatWindow />
        ) : (
          <AdminPanel tickets={tickets} setTickets={setTickets} policies={policies} setPolicies={setPolicies} />
        )}
      </main>
    </div>
  );
}

export default App;
