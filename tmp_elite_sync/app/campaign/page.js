'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { Zap, MessageSquare, Clock, Shield, Target, Plus, Save, Play, Power, AlertCircle } from 'lucide-react';

export default function CampaignPage() {
  const [template, setTemplate] = useState('Hey {name}, saw your {company} and loved the approach...');
  const [delay, setDelay] = useState(300); // Humans speed in seconds
  const [dailyLimit, setDailyLimit] = useState(50);
  const [platform, setPlatform] = useState('linkedin');
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('campaign_settings').upsert({
      user_id: user.id,
      template,
      delay_seconds: delay,
      daily_limit: dailyLimit,
      target_platform: platform
    });
    setLoading(false);
    alert("Campaign Configuration Synchronized 🛡️");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* 🧭 Navigation */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-black" />
            </div>
            <span className="font-bold tracking-tighter text-xl">Outreach Command</span>
          </div>
          <button 
            onClick={() => setIsActive(!isActive)}
            className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${
              isActive ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-white/5 text-white/40 border border-white/10'
            }`}
          >
            <Power size={14} />
            {isActive ? 'System Active' : 'System Standby'}
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* 📝 Configuration Hub */}
          <div className="lg:col-span-2 space-y-8">
            <header>
              <h1 className="text-4xl font-bold tracking-tighter mb-2 text-white/90">Campaign Hardware</h1>
              <p className="text-white/40">Customize your messaging and humanization security protocols.</p>
            </header>

            {/* Template Engine */}
            <div className="bg-[#111] border border-white/10 rounded-3xl p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-3">
                  <MessageSquare size={18} className="text-blue-500" />
                  Outreach Template
                </h3>
                <div className="flex gap-2">
                  <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-white/30">{'{name}'}</span>
                  <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-white/30">{'{company}'}</span>
                </div>
              </div>
              <textarea 
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                rows={6}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-sm focus:outline-none focus:border-blue-500 transition-all font-mono"
              />
            </div>

            {/* Platform Selection */}
            <div className="grid grid-cols-3 gap-4">
              {['linkedin', 'instagram', 'gmail'].map((p) => (
                <button 
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`p-6 rounded-2xl border transition-all text-center group ${
                    platform === p ? 'bg-blue-500 text-white border-blue-400' : 'bg-[#111] border-white/10 text-white/40 hover:border-white/20'
                  }`}
                >
                  <p className="text-xs font-bold uppercase tracking-widest">{p}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 🛡️ Humanization Sentinel */}
          <div className="space-y-6">
            <div className="bg-[#111] border border-white/10 rounded-3xl p-8">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-8 flex items-center gap-2">
                <Clock size={16} className="text-blue-500" />
                Humanization Speed
              </h3>
              
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between text-xs mb-4">
                    <span className="text-white/60">Inter-Message Delay</span>
                    <span className="text-blue-400">{delay} Seconds</span>
                  </div>
                  <input 
                    type="range" min="30" max="600" value={delay} 
                    onChange={(e) => setDelay(e.target.value)}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <p className="text-[10px] text-white/20 mt-4 leading-relaxed">
                    Higher delays significantly reduce detection risk by mimicking human typing and thinking pauses.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-4">
                    <span className="text-white/60">Daily Volume Limit</span>
                    <span className="text-blue-400">{dailyLimit} Profiles</span>
                  </div>
                  <input 
                    type="range" min="5" max="100" value={dailyLimit} 
                    onChange={(e) => setDailyLimit(e.target.value)}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/10 rounded-3xl p-6 flex gap-4">
              <Shield size={20} className="text-blue-500 shrink-0" />
              <p className="text-xs text-blue-500/70 leading-relaxed">
                <span className="font-bold text-blue-500">Safe-Mode Enabled:</span> Your settings are within the "Low-Risk" threshold for {platform.toUpperCase()} outreach.
              </p>
            </div>

            <button 
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-white text-black font-bold py-5 rounded-3xl flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all"
            >
              {loading ? 'Synchronizing...' : 'Save Configuration'}
              <Save size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
