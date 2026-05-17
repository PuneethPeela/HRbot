import { useState } from 'react';
import ChatWindow from './components/ChatWindow';
import Sidebar from './components/Sidebar';
import AdminPanel from './components/AdminPanel';
import { ShieldAlert, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

function App() {
  const [view, setView] = useState('landing'); // 'landing', 'chat' or 'admin'
  const [tickets, setTickets] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
        >
          <div className="bg-hr-900 text-white p-12 md:w-1/2 flex flex-col justify-center">
            <h1 className="text-4xl font-bold mb-6 leading-tight">HR teams spend 40% of their time answering repetitive queries.</h1>
            <p className="text-hr-100 text-lg mb-8">
              Promtal HRBot solves this by providing instant, accurate answers directly from company policies, escalating only when necessary.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3"><CheckCircle className="text-hr-500" /> <span className="text-sm">Instant RAG-powered responses</span></div>
              <div className="flex items-center gap-3"><CheckCircle className="text-hr-500" /> <span className="text-sm">Confidence-based escalation</span></div>
              <div className="flex items-center gap-3"><CheckCircle className="text-hr-500" /> <span className="text-sm">Secure, tenant-isolated knowledge base</span></div>
            </div>
          </div>
          <div className="p-12 md:w-1/2 flex flex-col justify-center bg-white">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Welcome to Promtal HR</h2>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <div className="flex gap-3 mb-2">
                <ShieldAlert className="text-yellow-600 flex-shrink-0" size={20} />
                <h3 className="font-semibold text-yellow-800 text-sm">Legal & Safety Disclaimer</h3>
              </div>
              <p className="text-xs text-yellow-700 leading-relaxed">
                HRBot is an AI assistant designed to provide general guidance based on uploaded company policies. 
                <strong> It does not provide legal advice.</strong> For sensitive issues, legal matters, or official grievances, 
                please consult the HR department or an employment lawyer directly. Your queries are logged for quality and escalation purposes.
              </p>
            </div>

            <label className="flex items-center gap-3 mb-8 cursor-pointer">
              <input 
                type="checkbox" 
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-hr-600 focus:ring-hr-500"
              />
              <span className="text-sm text-gray-600">I have read and understand the legal and safety disclaimer.</span>
            </label>

            <button 
              disabled={!acceptedTerms}
              onClick={() => setView('chat')}
              className="w-full bg-hr-600 hover:bg-hr-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors shadow-lg"
            >
              Enter HR Helpdesk
            </button>
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
