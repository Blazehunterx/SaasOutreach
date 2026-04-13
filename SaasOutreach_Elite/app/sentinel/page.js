'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Search, Filter, Linkedin, Instagram, ExternalLink, ShieldCheck, Zap, ArrowLeft, BarChart2 } from 'lucide-react';

export default function SentinelPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const { data } = await supabase.from('leads').select('*').order('discovered_at', { ascending: false });
    setLeads(data || []);
    setLoading(false);
  };

  const filteredLeads = leads.filter(l => 
    l.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    l.company?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* 🧭 Navigation */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button onClick={() => window.location.href = '/dashboard'} className="flex items-center gap-2 text-white/40 hover:text-white transition-all group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-all" />
            <span className="text-xs font-bold uppercase tracking-widest">Back to Hub</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BarChart2 size={18} className="text-white" />
            </div>
            <span className="font-bold tracking-tighter text-xl text-blue-500">Web Sentinel</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] bg-white/5 px-3 py-1 border border-white/10 rounded-full text-white/40 font-bold tracking-widest uppercase">Nexus: Connected</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* 🚀 Header */}
        <header className="mb-12 flex flex-col md:flex-row items-end justify-between gap-8">
          <div className="flex-1">
            <h1 className="text-5xl font-bold tracking-tighter mb-4">Discovery Intelligence</h1>
            <p className="text-white/40 text-lg">Real-time surveillance of high-ticket founders & acquisition targets.</p>
          </div>
          
          <div className="w-full md:w-96 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input 
              type="text" 
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-all text-sm"
            />
          </div>
        </header>

        {/* 📊 Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
            <p className="text-[10px] uppercase text-white/30 font-bold mb-2">Total Harvested</p>
            <p className="text-3xl font-bold">{leads.length}</p>
          </div>
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
            <p className="text-[10px] uppercase text-white/30 font-bold mb-2">Discovery Velocity</p>
            <p className="text-3xl font-bold text-blue-500">Active</p>
          </div>
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
            <p className="text-[10px] uppercase text-white/30 font-bold mb-2">Security Mesh</p>
            <p className="text-3xl font-bold text-green-500">Shield On</p>
          </div>
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
            <p className="text-[10px] uppercase text-white/30 font-bold mb-2">Premium Status</p>
            <p className="text-3xl font-bold">Elite</p>
          </div>
        </div>

        {/* 📑 Leads Table */}
        <div className="bg-[#111] border border-white/10 rounded-3xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-white/40 font-bold">Founder / Lead</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-white/40 font-bold">Acquisition Target</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-white/40 font-bold">Outreach Hubs</th>
                <th className="px-8 py-6 text-[10px] uppercase tracking-widest text-white/40 font-bold text-right">Discovered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLeads.map((l, index) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={l.id} 
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/20 group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-all">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-white/90">{l.full_name || 'Autonomous Detection'}</p>
                        <p className="text-xs text-white/30 truncate max-w-[150px]">{l.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="inline-block px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-xs font-bold text-white/60">
                      {l.company || 'Founder / CEO'}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <a href={l.linkedin_url} target="_blank" className="p-2 bg-[#0077B5]/10 text-[#0077B5] rounded-lg hover:bg-[#0077B5]/20 transition-all">
                        <Linkedin size={16} />
                      </a>
                      <span className="p-2 bg-[#E4405F]/10 text-[#E4405F] rounded-lg">
                        <Instagram size={16} />
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <p className="text-xs font-bold text-white/40">{new Date(l.discovered_at).toLocaleDateString()}</p>
                    <p className="text-[10px] text-white/20 uppercase tracking-widest">Nexus Verified</p>
                  </td>
                </motion.tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <Zap size={48} />
                      <p className="font-mono text-xs tracking-widest uppercase">AWAITING_QUANTUM_HARVEST</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
