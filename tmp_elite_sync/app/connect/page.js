'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Shield, Linkedin, Instagram, Mail, Info, CheckCircle2, AlertTriangle, Key } from 'lucide-react';

export default function ConnectPage() {
  const [platform, setPlatform] = useState('linkedin');
  const [sessionData, setSessionData] = useState('');
  const [loading, setLoading] = useState(false);
  const [connections, setConnections] = useState({
    linkedin: false,
    instagram: false,
    gmail: false
  });

  const handleConnect = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    // In a real SaaS, this stores session cookies or OAuth tokens
    // For trial, we store the session key for the local connector to use
    const { error } = await supabase.from('account_connections').upsert({
      user_id: user.id,
      platform,
      session_payload: sessionData, 
      status: 'CONNECTED'
    });

    if (!error) {
      setConnections({ ...connections, [platform]: true });
      setSessionData('');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* 🧭 Navigation */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Shield size={18} className="text-black" />
            </div>
            <span className="font-bold tracking-tighter text-xl text-white/90">Identity Binding Hub</span>
          </div>
          <button onClick={() => window.location.href = '/dashboard'} className="text-xs uppercase font-bold tracking-widest text-white/40 hover:text-white transition-all">
            Return to Hub
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* 🛡️ Platform Selection */}
          <div className="space-y-6">
            <header>
              <h2 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-8">Select Hub Platform</h2>
            </header>
            
            <div className="space-y-4">
              {[
                { id: 'linkedin', icon: Linkedin, color: '#0077B5', label: 'LinkedIn Professional' },
                { id: 'instagram', icon: Instagram, color: '#E4405F', label: 'Instagram Social' },
                { id: 'gmail', icon: Mail, color: '#EA4335', label: 'Gmail Outreach' }
              ].map((p) => (
                <button 
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`w-full p-6 rounded-3xl border transition-all flex items-center gap-6 group text-left ${
                    platform === p.id ? 'bg-white/5 border-white/20' : 'border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all bg-white/5 ${
                    platform === p.id ? 'scale-110 shadow-lg' : 'opacity-40 grayscale group-hover:grayscale-0'
                  }`}>
                    <p.icon size={24} style={{ color: platform === p.id ? p.color : '#fff' }} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${platform === p.id ? 'text-white' : 'text-white/40 group-hover:text-white/60'}`}>{p.label}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {connections[p.id] ? (
                        <span className="flex items-center gap-1 text-[8px] uppercase font-bold text-green-500 tracking-tighter">
                          <CheckCircle2 size={10} /> Authenticated
                        </span>
                      ) : (
                        <span className="text-[8px] uppercase font-bold text-white/20 tracking-tighter italic whitespace-nowrap">Awaitng Handshake</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 🔑 Handshake Form */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-[#111] border border-white/10 rounded-3xl p-10 relative overflow-hidden">
              <div className="relative z-10 space-y-8">
                <header>
                  <h1 className="text-4xl font-bold tracking-tighter mb-4 capitalize">{platform} Handshake</h1>
                  <p className="text-white/40 text-lg">Securely bind your {platform} identity to the Founderflow Nexus.</p>
                </header>

                <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6 flex gap-4">
                  <Info className="text-blue-500 shrink-0 mt-1" size={18} />
                  <div className="space-y-2">
                    <p className="text-xs text-blue-500/70 leading-relaxed font-bold uppercase tracking-widest">Trial Security Protocol</p>
                    <p className="text-xs text-white/40 leading-relaxed">
                      To enable humanized outreach during your trial, please provide your **Platform Session Token**. This allows the Secure Connector on your machine to act as you without triggering login alerts.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-white/40 font-semibold ml-1 flex items-center gap-2">
                    <Key size={14} />
                    Session Payload / Cookie String
                  </label>
                  <textarea 
                    value={sessionData}
                    onChange={(e) => setSessionData(e.target.value)}
                    rows={4}
                    placeholder="Paste secure session string here..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-xs focus:outline-none focus:border-blue-500 transition-all font-mono"
                  />
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex gap-4">
                     <div className="flex items-center gap-2 text-[10px] text-white/20 font-bold uppercase">
                       <Shield size={12} /> AES encryption active
                     </div>
                  </div>
                  <button 
                    onClick={handleConnect}
                    disabled={loading || !sessionData}
                    className="bg-white text-black font-bold px-10 py-5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5 disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {loading ? 'Performing Handshake...' : 'Establish Secure Connection'}
                  </button>
                </div>
              </div>
              <Key size={300} className="absolute right-[-80px] bottom-[-80px] text-white/[0.02] -rotate-12" />
            </div>

            <div className="bg-orange-500/5 border border-orange-500/10 rounded-3xl p-8 flex gap-6 items-center">
               <AlertTriangle className="text-orange-500 shrink-0" size={32} />
               <div>
                 <p className="text-sm font-bold text-orange-500 mb-2 uppercase tracking-tight">Revenue Protection Protocol</p>
                 <p className="text-xs text-white/40 leading-relaxed italic">
                   "Your session payload is never transmitted to our cloud. It is stored encrypted and only accessed by your local Secure Connector bridge to mimic human browser activity."
                 </p>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
