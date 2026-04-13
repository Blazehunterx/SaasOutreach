'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Shield, MessageSquare, Clock, Users, Play, 
  Settings, Database, Linkedin, Instagram, Mail, 
  CheckCircle2, AlertTriangle, Download, Terminal, 
  Plus, Save, BarChart3, Key, Power, FileText, Upload, Target, Building2, Briefcase, Link2, MousePointer2, Globe, Search
} from 'lucide-react';

export default function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trialTime, setTrialTime] = useState({ days: 0, hours: 0, expired: false, permanent: false });
  
  // Real Stats
  const [stats, setStats] = useState({ total: 0, processing: 0, completed: 0 });
  
  // Campaign State
  const [template, setTemplate] = useState('Hey {name}, saw your {company} and loved the approach...');
  const [delay, setDelay] = useState(300);
  const [limit, setLimit] = useState(50);
  const [platform, setPlatform] = useState('linkedin');
  const [isSystemActive, setIsSystemActive] = useState(false);
  const [pdfName, setPdfName] = useState(null);
  
  // Handshake State
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  
  // Discovery Matrix State (Fleshed Out v5.0.1)
  const [targetIndustry, setTargetIndustry] = useState('');
  const [targetContext, setTargetContext] = useState('');
  const [bioKeywords, setBioKeywords] = useState('');
  const [isHarvesting, setIsHarvesting] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
    fetchRealStats();
    fetchConfig();
    
    const channel = supabase
      .channel('leads_stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        fetchRealStats();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data?.status !== 'TRIAL' && data?.status !== 'PERMANENT' && !data?.is_admin) {
      window.location.href = '/onboarding';
      return;
    }
    
    if (data.status === 'PERMANENT' || data.is_admin) {
      setTrialTime({ days: 0, hours: 0, expired: false, permanent: true });
    } else if (data.trial_started_at) {
      const started = new Date(data.trial_started_at).getTime();
      const now = new Date().getTime();
      const diff = now - started;
      const hoursRemainingRaw = 168 - (diff / (1000 * 60 * 60));
      
      if (hoursRemainingRaw <= 0) {
        // 🔥 TERMINAL STRIKE: Auto-Ban Expired Trialist
        await supabase.from('profiles').update({ status: 'BAN' }).eq('id', user.id);
        window.location.href = '/onboarding';
        return;
      }

      const days = Math.floor(hoursRemainingRaw / 24);
      const hours = Math.floor(hoursRemainingRaw % 24);
      setTrialTime({ days, hours, expired: false, permanent: false });
    }

    setProfile(data);
    setLoading(false);
  };

  const fetchRealStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: leads } = await supabase.from('leads').select('status').eq('user_id', user.id);
    if (leads) {
      setStats({
        total: leads.length,
        processing: leads.filter(l => l.status === 'PROCESSING').length,
        completed: leads.filter(l => l.status === 'COMPLETED').length
      });
    }
  };

  const fetchConfig = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: config } = await supabase.from('campaign_settings').select('*').eq('user_id', user.id).single();
    if (config) {
      if (config.template) setTemplate(config.template);
      if (config.delay_seconds) setDelay(config.delay_seconds);
      if (config.daily_limit) setLimit(config.daily_limit);
      if (config.target_platform) setPlatform(config.target_platform);
      if (config.target_industry) setTargetIndustry(config.target_industry);
      if (config.target_context) setTargetContext(config.target_context);
      if (config.bio_keywords) setBioKeywords(config.bio_keywords);
      if (config.pdf_name) setPdfName(config.pdf_name);
    }
  };

  const handleMakeConnection = async () => {
    setIsConnecting(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('campaign_settings').upsert({
      user_id: user.id,
      target_platform: platform,
      connection_pulse_at: new Date().toISOString()
    });
    setTimeout(() => setIsConnecting(false), 3000);
    alert(`Signal Sent: Launching local ${platform.toUpperCase()} browser...`);
  };

  const handleInitializeHarvest = async () => {
    setIsHarvesting(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    // 🔥 TRIGGER: Local Harvester Pulse (v5.0.1)
    await supabase.from('campaign_settings').upsert({
      user_id: user.id,
      target_industry: targetIndustry,
      target_context: targetContext,
      bio_keywords: bioKeywords,
      harvest_pulse_at: new Date().toISOString()
    });

    setTimeout(() => {
        setIsHarvesting(false);
        alert(`Discovery Hub: Unlimited Harvest Initialized for ${targetIndustry || 'All'}`);
    }, 2000);
  };

  const handleSaveConfig = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('campaign_settings').upsert({
      user_id: user.id,
      template,
      delay_seconds: delay,
      daily_limit: limit,
      target_platform: platform,
      pdf_name: pdfName,
      target_industry: targetIndustry,
      target_context: targetContext,
      bio_keywords: bioKeywords,
      updated_at: new Date().toISOString()
    });
    alert("Absolute Fulfillment Configuration Propagated 🛡️");
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30">
      {/* 🧭 Navigation */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Zap size={22} className="text-white" fill="currentColor" />
            </div>
            <div>
              <span className="font-bold tracking-tighter text-2xl block uppercase">Founderflow Elite</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold px-3 py-1 bg-white/5 rounded border border-white/10">Absolute Fulfillment v5.0.1</span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex flex-col items-end">
              <p className="text-[10px] uppercase tracking-widest text-[#0077B5] font-bold mb-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#0077B5] rounded-full animate-pulse" />
                Execution Mode: Active
              </p>
              <p className="text-xs font-mono text-white/40">
                {trialTime.permanent ? (
                  <span className="text-yellow-500 font-bold uppercase tracking-widest text-[9px]">Absolute Access: Unlimited</span>
                ) : (
                  <span className="opacity-60">{trialTime.days}D {trialTime.hours}H Remaining</span>
                )}
              </p>
            </div>
            <div className="w-10 h-10 bg-white/5 rounded-full border border-white/10 flex items-center justify-center">
              <Users size={16} className="text-white/60" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-8 py-10">
        {!isSystemActive && (
          <div className="mb-10 p-6 bg-blue-500/10 border border-blue-500/20 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center animate-pulse">
                <Terminal size={32} className="text-blue-500" />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-bold tracking-tighter">Hardware Connection Required</h2>
                <p className="text-sm text-white/40 tracking-tight">Your Outreach Engine is not detected. Download the hub to start sending.</p>
              </div>
            </div>
            <a 
              href="/Founderflow_Launcher.bat" download
              className="bg-blue-500 text-white font-bold px-8 py-4 rounded-2xl hover:bg-blue-600 transition-all flex items-center gap-3 shadow-xl shadow-blue-500/10"
            >
              Download Connection Hub <Download size={20} />
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 🕹️ Left: Identity & Discovery */}
          <div className="lg:col-span-4 space-y-8">
            {/* System Status */}
            <div className="bg-[#111] border border-white/10 rounded-3xl p-8">
               <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold font-mono">Engine Pulse</h3>
                 <button 
                  onClick={() => setIsSystemActive(!isSystemActive)}
                  className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${
                    isSystemActive ? 'bg-green-500 text-white shadow-lg' : 'bg-white/5 text-white/40 border border-white/10'
                  }`}
                 >
                   <Power size={12} />
                   {isSystemActive ? 'Engine Active' : 'Standby'}
                 </button>
               </div>
               <p className="text-2xl font-bold tracking-tighter mb-2">Discovery Node: Online</p>
               <p className="text-xs text-white/20 italic">"Local Outreach Node must be active to acknowledge commands."</p>
            </div>

            {/* Platform Sovereignty */}
            <div className="bg-[#111] border border-white/10 rounded-3xl p-8 space-y-6">
              <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold flex items-center gap-2 font-mono">
                <Shield size={14} />
                Identity Sovereignty
              </h3>
              <div className="space-y-3">
                {[
                  { id: 'linkedin', icon: Linkedin, color: '#0077B5', label: 'LinkedIn Pro' },
                  { id: 'instagram', icon: Instagram, color: '#E4405F', label: 'Instagram Social' },
                  { id: 'gmail', icon: Mail, color: '#EA4335', label: 'Gmail Outreach' }
                ].map((p) => (
                  <button 
                    key={p.id}
                    onClick={() => setPlatform(p.id)}
                    className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                      platform === p.id ? 'bg-white/5 border-white/20' : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${platform === p.id ? 'bg-white/10 text-white' : 'bg-white/5 text-white/20'}`}>
                        <p.icon size={18} fill={platform === p.id ? p.color : 'none'} />
                      </div>
                      <span className={`text-xs font-bold ${platform === p.id ? 'text-white' : 'text-white/20'}`}>{p.label}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* ⚡️ The Connection Duo */}
              <div className="grid grid-cols-2 gap-3 mt-8 pt-4 border-t border-white/5">
                <button 
                  onClick={handleMakeConnection}
                  disabled={isConnecting}
                  className="bg-blue-500 text-white font-bold py-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-blue-600 transition-all text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/10"
                >
                   <MousePointer2 size={16} />
                   {isConnecting ? 'Launching...' : 'Make connection'}
                </button>
                <button 
                  onClick={() => alert("Identity Finalized!")}
                  className="bg-white/5 border border-white/10 text-white/40 font-bold py-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-green-500 hover:text-white transition-all text-[10px] uppercase tracking-widest"
                >
                   <CheckCircle2 size={16} />
                   Finalize connection
                </button>
              </div>
            </div>

            {/* Discovery Matrix (Fleshed Out v5.0.1) */}
            <div className="bg-[#111] border border-white/10 rounded-3xl p-8 space-y-6">
              <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold flex items-center gap-2 font-mono">
                <Target size={14} className="text-blue-500" />
                Discovery Matrix (Unlimited)
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-white/20 mb-2 block ml-1 font-mono">Surgical Niche / Industry</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                    <input 
                      value={targetIndustry} onChange={(e) => setTargetIndustry(e.target.value)}
                      placeholder="e.g. E-commerce Brands"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-12 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-white/20 mb-2 block ml-1 font-mono">Market Segment / Context</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                    <input 
                      value={targetContext} onChange={(e) => setTargetContext(e.target.value)}
                      placeholder="e.g. London Agencies"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-12 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-white/20 mb-2 block ml-1 font-mono">Bio Keywords / Persona</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                    <input 
                      value={bioKeywords} onChange={(e) => setBioKeywords(e.target.value)}
                      placeholder="e.g. Founder, CEO, Direct Response"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-3 pl-12 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all"
                    />
                  </div>
                </div>

                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                   <p className="text-[9px] uppercase tracking-widest text-[#0077B5] font-bold flex items-center gap-2">
                     <span className="w-1.5 h-1.5 bg-[#0077B5] rounded-full animate-pulse" />
                     Mode: Deep Unlimited Scan
                   </p>
                </div>

                <button 
                  onClick={handleInitializeHarvest}
                  disabled={isHarvesting}
                  className="w-full bg-blue-600/10 border border-blue-600/20 text-blue-500 font-bold py-5 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl shadow-blue-500/5 mt-4 group"
                >
                  {isHarvesting ? 'Crawl Initiated...' : 'Initialize Global Harvest'}
                  <Play size={12} className={`inline-block ml-2 ${isHarvesting ? 'hidden' : 'group-hover:translate-x-1 transition-all'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* 🎯 Middle: Command (Messaging & Hardware) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-[#111] border border-white/10 rounded-3xl p-10 space-y-8 h-full">
              <header className="flex items-center justify-between border-b border-white/5 pb-8">
                <div>
                   <h2 className="text-3xl font-bold tracking-tighter">Outreach Hardware</h2>
                   <p className="text-xs text-white/30 uppercase tracking-widest font-bold mt-1 font-mono">Core Fulfillment: v5.0.1</p>
                </div>
              </header>

              {/* Template Hub */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                   <label className="text-xs font-bold text-white/40 uppercase tracking-widest font-mono">Message Template</label>
                   <div className="flex gap-2">
                     <span className="text-[9px] bg-white/5 px-2 py-1 rounded text-white/30 font-mono italic">{'{name}'}</span>
                     <span className="text-[9px] bg-white/5 px-2 py-1 rounded text-white/30 font-mono italic">{'{company}'}</span>
                   </div>
                </div>
                <textarea 
                  value={template} onChange={(e) => setTemplate(e.target.value)}
                  rows={8}
                  className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-6 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all font-mono leading-relaxed"
                />
              </div>

               {/* PDF Injection */}
               <div className="space-y-4">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest block ml-1 font-mono">Collateral Injection</label>
                  <div 
                    onClick={() => fileInputRef.current.click()}
                    className="w-full bg-white/[0.03] border border-dashed border-white/10 rounded-2xl p-6 flex items-center justify-between group cursor-pointer hover:border-blue-500/50 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/5 rounded-xl text-white/20 group-hover:text-blue-500 transition-all shadow-lg">
                        <FileText size={20} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold truncate max-w-[200px]">{pdfName || 'Attach Outreach PDF'}</p>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest">Enforced 1:1 Spec</p>
                      </div>
                    </div>
                    <Upload size={18} className="text-white/10 group-hover:text-blue-500 transition-all" />
                    <input type="file" ref={fileInputRef} className="hidden" />
                  </div>
               </div>

                {/* Fulfillment Offsets (NOW FUNCTIONAL) */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-4">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest font-mono flex items-center justify-between">
                      Inter-Delay
                      <span className="text-blue-500 font-mono italic">{delay}s</span>
                    </p>
                    <input type="range" min="30" max="900" value={delay} onChange={(e) => setDelay(e.target.value)} className="w-full h-1 bg-white/10 accent-blue-500" />
                  </div>
                   <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-4">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest font-mono flex items-center justify-between">
                      Daily Limit
                      <span className="text-green-500 font-mono italic">{limit}</span>
                    </p>
                    <input type="range" min="10" max="150" value={limit} onChange={(e) => setLimit(e.target.value)} className="w-full h-1 bg-white/10 accent-green-500" />
                  </div>
               </div>

               <button 
                onClick={handleSaveConfig}
                className="w-full bg-white text-black font-bold py-6 rounded-[24px] flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-95 transition-all shadow-2xl shadow-white/5"
               >
                 Propagate Configuration <Save size={18} />
               </button>
            </div>
          </div>

          {/* 📊 Right: Live Analytics (Hardwired) */}
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-[#111] border border-white/10 rounded-3xl p-8 space-y-10 group">
              <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold mb-4 font-mono">Discovery Metrics</h3>
              <div className="space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] uppercase text-white/30 font-bold">Total Intelligence</p>
                    <Database size={12} className="text-blue-500" />
                  </div>
                  <p className="text-5xl font-bold tracking-tighter text-white group-hover:scale-105 transition-all origin-left font-mono">{stats.total}</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] uppercase text-white/30 font-bold">In Processing</p>
                    <Zap size={12} className="text-orange-500" />
                  </div>
                  <p className="text-5xl font-bold tracking-tighter text-blue-500 font-mono">{stats.processing}</p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] uppercase text-white/30 font-bold">Absolute Success</p>
                    <Target size={12} className="text-green-500" />
                  </div>
                  <p className="text-5xl font-bold tracking-tighter text-green-500 font-mono">{stats.completed}</p>
                </div>
              </div>

               <div className="pt-8 border-t border-white/5 space-y-4">
                  <button onClick={() => window.location.href = '/import'} className="w-full p-4 bg-white/5 border border-white/10 rounded-xl flex font-bold uppercase tracking-widest text-[9px] items-center justify-center gap-3 hover:bg-white/10 transition-all shadow-lg font-mono">Manual Lead Injection <Plus size={14}/></button>
                  <button onClick={() => window.location.href = '/sentinel'} className="w-full p-4 bg-white/5 border border-white/10 rounded-xl flex font-bold uppercase tracking-widest text-[9px] items-center justify-center gap-3 hover:bg-white/10 transition-all shadow-lg font-mono">Live Sentinel Hub <BarChart3 size={14}/></button>
               </div>
            </div>

            <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
               <Download size={40} className="text-white/5 absolute right-[-10px] top-[-10px]" />
               <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold mb-6 font-mono">Fulfillment Link</h3>
               <p className="text-[10px] text-white/30 leading-relaxed mb-8 italic">"Local Outreach Node must be active to acknowledge hardware pulses."</p>
               <a 
                href="/Founderflow_Launcher.bat" download
                className="block text-center bg-blue-500 text-white py-5 rounded-2xl text-[10px] uppercase font-bold tracking-[0.2em] transition-all shadow-xl shadow-blue-500/10"
              >
                 Command Hub v5.0.1
               </a>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
