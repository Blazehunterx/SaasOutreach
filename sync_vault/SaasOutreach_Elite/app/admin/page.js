'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, User, Linkedin, Instagram, ExternalLink } from 'lucide-react';

export default function AdminPage() {
  const [profiles, setProfiles] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
    fetchProfiles();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
    if (profile?.is_admin) setIsAdmin(true);
    else window.location.href = '/onboarding';
    setLoading(false);
  };

  const fetchProfiles = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from('profiles')
      .select('*')
      .neq('id', user?.id) // 🛡️ Surgical Filter: Don't show the Admin to the Admin
      .order('created_at', { ascending: false });
    setProfiles(data || []);
  };

  const updateStatus = async (user, newStatus) => {
    // 🛡️ Optimistic Strike: Update the UI instantly
    const previousProfiles = [...profiles];
    setProfiles(profiles.map(p => 
      p.id === user.id ? { ...p, status: newStatus } : p
    ));

    let updates = { status: newStatus };
    if (newStatus === 'TRIAL' && !user.trial_started_at) {
      updates.trial_started_at = new Date().toISOString();
    }

    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    
    if (error) {
      // Rollback if cloud handshake fails
      setProfiles(previousProfiles);
      alert("Handshake Failure: Cloud connection rejected status change.");
    } else {
      fetchProfiles(); // Final sync with reality
    }
  };

  if (loading) return null;
  if (!isAdmin) return <div className="p-20 text-white">ACCESS DENIED</div>;

  return (
    <div className="min-h-screen bg-[#050505] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tighter">Approval Hub</h1>
            <p className="text-white/40 mt-2">Manage Trail Requests & Revenue Protection</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-full px-6 py-2">
            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">Administrator Mode</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {profiles.map((p) => (
            <motion.div 
              key={p.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#111] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div className="flex items-center gap-6 flex-1">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                  <User className="text-white/40" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{p.full_name || 'Anonymous User'}</h3>
                  <div className="flex gap-4">
                    <a href={p.linkedin_url} target="_blank" className="flex items-center gap-2 text-xs text-[#0077B5] hover:underline">
                      <Linkedin size={14} /> Profile <ExternalLink size={10} />
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-[10px] uppercase text-white/30 font-bold mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                    p.status === 'TRIAL' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                    p.status === 'PERMANENT' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                    p.status === 'PENDING' ? 'bg-white/5 border-white/10 text-white/40' :
                    'bg-red-500/10 border-red-500/20 text-red-500'
                  }`}>
                    {p.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 border-l border-white/5 pl-8">
                  {p.status !== 'TRIAL' && p.status !== 'PERMANENT' && (
                    <button 
                      onClick={() => updateStatus(p, 'TRIAL')}
                      className="px-4 py-2 bg-blue-500 text-white text-[9px] font-bold uppercase tracking-widest rounded-lg hover:bg-blue-600 transition-all"
                    >
                      Grant Trial
                    </button>
                  )}
                  {p.status !== 'PERMANENT' && (
                    <button 
                      onClick={() => updateStatus(p, 'PERMANENT')}
                      className="px-4 py-2 bg-yellow-500 text-black text-[9px] font-bold uppercase tracking-widest rounded-lg hover:bg-yellow-600 transition-all shadow-lg shadow-yellow-500/10"
                    >
                      Grant Permanent
                    </button>
                  )}
                  {p.status !== 'BAN' && (
                    <button 
                      onClick={() => updateStatus(p, 'BAN')}
                      className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all"
                    >
                      <XCircle size={14} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {profiles.length === 0 && <p className="text-center text-white/20 py-20 font-mono tracking-widest">NO_PENDING_TRAILS_DETECTED</p>}
        </div>
      </div>
    </div>
  );
}
