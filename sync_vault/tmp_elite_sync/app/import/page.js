'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Upload, Link as LinkIcon, FileJson, Plus, CheckCircle, Database, AlertCircle } from 'lucide-react';

export default function ImportPage() {
  const [manualUrl, setManualUrl] = useState('');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleManualAdd = () => {
    if (!manualUrl) return;
    const platform = manualUrl.includes('linkedin') ? 'linkedin' : (manualUrl.includes('instagram') ? 'ig' : 'x');
    setLeads([...leads, { url: manualUrl, platform, status: 'QUEUED' }]);
    setManualUrl('');
  };

  const processImport = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const dbLeads = leads.map(l => ({
      user_id: user.id,
      linkedin_url: l.platform === 'linkedin' ? l.url : null,
      ig_handle: l.platform === 'ig' ? l.url : null,
      status: 'NEW'
    }));

    const { error } = await supabase.from('leads').insert(dbLeads);
    if (!error) {
      setSuccess(true);
      setLeads([]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* 🧭 Navigation */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Database size={18} className="text-white" />
            </div>
            <span className="font-bold tracking-tighter text-xl">Lead Injection Port</span>
          </div>
          <button onClick={() => window.location.href = '/dashboard'} className="text-xs uppercase font-bold tracking-widest text-white/40 hover:text-white transition-all">
            Return to Hub
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* 📥 Input Hub */}
          <div className="space-y-8">
            <header>
              <h1 className="text-4xl font-bold tracking-tighter mb-4">Feed the Beast</h1>
              <p className="text-white/40 text-lg leading-relaxed">Inject discovery targets manually or via mass-import hardware.</p>
            </header>

            {/* Manual Injection */}
            <div className="bg-[#111] border border-white/10 rounded-3xl p-8 space-y-6">
              <h3 className="font-bold flex items-center gap-3">
                <LinkIcon size={18} className="text-blue-500" />
                Manual URL Injection
              </h3>
              <div className="flex gap-4">
                <input 
                  type="url" 
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/founder..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-all text-sm"
                />
                <button 
                  onClick={handleManualAdd}
                  className="bg-white text-black px-6 rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {/* CSV/File Import Placeholder */}
            <div className="bg-[#111] border border-dashed border-white/10 rounded-3xl p-12 text-center group hover:border-blue-500/50 transition-all cursor-pointer">
              <Upload size={40} className="mx-auto text-white/10 mb-6 group-hover:text-blue-500 group-hover:scale-110 transition-all" />
              <h3 className="font-bold mb-2">Drag & Drop Lead Nexus</h3>
              <p className="text-xs text-white/20 uppercase tracking-widest">Supports CSV, JSON, and XLSX Intelligence Sheets</p>
            </div>
          </div>

          {/* 📑 Inspection Queue */}
          <div className="space-y-6">
            <div className="bg-[#111] border border-white/10 rounded-3xl p-8 min-h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                <h3 className="font-bold text-white/40 uppercase text-xs tracking-widest">Injection Queue ({leads.length})</h3>
                {leads.length > 0 && (
                  <button onClick={() => setLeads([])} className="text-[10px] text-red-500 hover:underline uppercase font-bold">Clear Queue</button>
                )}
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                {leads.map((l, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i} 
                    className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between"
                  >
                    <p className="text-xs truncate max-w-[200px] text-white/80 font-mono italic">{l.url}</p>
                    <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-1 rounded font-bold uppercase">{l.platform}</span>
                  </motion.div>
                ))}
                {leads.length === 0 && (
                  <div className="flex flex-col items-center justify-center flex-1 opacity-20 gap-4">
                    <FileJson size={40} />
                    <p className="text-xs uppercase tracking-tighter">Queue Empty: No targets unmasked</p>
                  </div>
                )}
              </div>

              {leads.length > 0 && (
                <button 
                  onClick={processImport}
                  className="w-full bg-blue-500 text-white font-bold py-5 rounded-2xl mt-8 hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                >
                  {loading ? 'Initializing Injection...' : 'Launch Injection to Nexus'}
                </button>
              )}

              {success && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 mt-8 flex items-center gap-4"
                >
                  <CheckCircle className="text-green-500" size={20} />
                  <p className="text-xs text-green-500 font-bold uppercase tracking-widest">Targets Synchronized with Cloud Registry!</p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
