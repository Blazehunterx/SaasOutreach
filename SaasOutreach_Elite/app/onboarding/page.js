'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Linkedin, Instagram, Settings, Clock, ShieldCheck } from 'lucide-react';

export default function OnboardingPage() {
  const [linkedin, setLinkedin] = useState('');
  const [instagram, setInstagram] = useState('');
  const [status, setStatus] = useState('LOADING');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (profile) {
      setStatus(profile.status);
      // 🛡️ Auto-Pivot Strike: If approved, enter the nexus instantly
      if (profile.status === 'TRIAL' || profile.status === 'PERMANENT') {
        window.location.href = '/dashboard';
      }
    } else {
      setStatus('NEW');
    }
  };

  // 🧬 Absolute Lifecycle Polling: Check for approval every 5 seconds
  useEffect(() => {
    if (status === 'PENDING') {
      const interval = setInterval(checkStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const handleOnboarding = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      linkedin_url: linkedin,
      ig_handle: instagram,
      status: 'PENDING'
    });

    if (error) {
      console.error(error);
      setError(error.message);
    } else {
      setStatus('PENDING');
    }
    setLoading(false);
  };

  if (status === 'LOADING') return null;

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {status === 'NEW' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#111] border border-white/10 rounded-3xl p-10 shadow-3xl text-center">
            <h2 className="text-2xl font-bold text-white mb-6 tracking-tighter">Finalize Your Digital Identity</h2>
            <p className="text-white/40 mb-10 text-sm">Please provide your handles to initiate your 7-day Premium Trial.</p>
            
            <form onSubmit={handleOnboarding} className="space-y-6 text-left">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/40 font-semibold ml-1">LinkedIn Profile</label>
                <div className="relative">
                  <Linkedin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0077B5]" />
                  <input 
                    type="url" 
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-white/30 transition-all font-mono text-sm"
                    placeholder="https://linkedin.com/in/yourname"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-white/40 font-semibold ml-1">Instagram Handle</label>
                <div className="relative">
                  <Instagram size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#E4405F]" />
                  <input 
                    type="text" 
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-white/30 transition-all font-mono text-sm"
                    placeholder="@yourhandle"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-red-500 text-[10px] uppercase font-bold tracking-widest text-center">Database Blocked: {error}</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#0077B5] text-white font-bold py-4 rounded-xl hover:opacity-90 transition-all active:scale-[0.98] shadow-lg shadow-blue-500/10"
              >
                {loading ? 'Submitting...' : 'Initialize Trial Activation'}
              </button>
            </form>
          </motion.div>
        )}

        {status === 'PENDING' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#111] border border-white/10 rounded-3xl p-12 shadow-3xl text-center">
            <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
              <Clock size={40} className="text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4 tracking-tighter">Verification In-Progress</h2>
            <p className="text-white/40 text-sm leading-relaxed mb-8">
              Your profile is currently being vetted by the <span className="text-white">Founderflow Elite</span> team. 
              Once approved, you will find your **Secure Connector** download link here.
            </p>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-4 text-left">
              <ShieldCheck className="text-green-500" size={24} />
              <div>
                <p className="text-xs text-white/60 font-bold uppercase tracking-widest">Antigravity Hub Locked</p>
                <p className="text-[10px] text-white/30 font-mono">ENCRYPTED_ID_AWAITING_RELAY</p>
              </div>
            </div>
          </motion.div>
        )}

        {(status === 'TRIAL' || status === 'PERMANENT' || status === 'BAN') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#111] border border-white/10 rounded-3xl p-12 shadow-3xl text-center">
            <div className={`w-20 h-20 ${status !== 'BAN' ? 'bg-green-500/10' : 'bg-red-500/10'} rounded-full flex items-center justify-center mx-auto mb-8`}>
              <ShieldCheck size={40} className={status !== 'BAN' ? 'text-green-500' : 'text-red-500'} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4 tracking-tighter">
              {status !== 'BAN' ? 'Tier Fully Activated' : 'Access Restricted'}
            </h2>
            <p className="text-white/40 text-sm leading-relaxed mb-10">
              {status !== 'BAN' ? `Access Granted. Your ${status} status is now live.` : 'Your identity could not be verified by the elite sentinel.'}
            </p>
            {status !== 'BAN' && (
              <button 
                className="w-full bg-white text-black font-bold py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-200 transition-all"
                onClick={() => window.location.href = '/dashboard'}
              >
                Enter Premium Hub
                <Settings size={20} />
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
