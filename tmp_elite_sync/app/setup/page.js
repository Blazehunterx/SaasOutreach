'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Download, Terminal, Shield, CheckCircle2, ArrowRight, Loader2, Database, Power } from 'lucide-react';

export default function SetupPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [handshakeDetected, setHandshakeDetected] = useState(false);

  useEffect(() => {
    // Listen for the Handshake Pulse from the local connector
    const channel = supabase
      .channel('handshake_monitor')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, payload => {
        if (payload.new.handshake_established) {
          setHandshakeDetected(true);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const nextStep = () => {
    if (step === 3 && handshakeDetected) {
      window.location.href = '/dashboard';
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 selection:bg-blue-500/30">
      <div className="max-w-xl w-full space-y-12">
        
        {/* 🧭 Progress Indicator */}
        <div className="flex items-center justify-between px-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                step >= s ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 text-white/20'
              }`}>
                {s}
              </div>
              {s < 3 && <div className={`w-12 h-[1px] ${step > s ? 'bg-blue-600' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        {/* 🪄 Content Hub */}
        <div className="bg-[#111] border border-white/10 rounded-[32px] p-10 space-y-10 relative overflow-hidden">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Download */}
            {step === 1 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-8 relative z-10"
              >
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                  <Download className="text-blue-500" size={32} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tighter mb-4">Download the Nucleus</h1>
                  <p className="text-white/40 leading-relaxed">
                    To start your 7-day trial, you must download the **Founderflow Command Bridge.** This links your local machine to our cloud.
                  </p>
                </div>
                <a 
                  href="/Founderflow_Launcher.bat" download
                  className="w-full bg-white text-black font-bold py-6 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                >
                  Download Setup Hub (.bat)
                  <ArrowRight size={18} />
                </a>
              </motion.div>
            )}

            {/* Step 2: Handshake */}
            {step === 2 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-8 relative z-10"
              >
                <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/20">
                  <Terminal className="text-orange-500" size={32} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tighter mb-4">Initialize Handshake</h1>
                  <p className="text-white/40 leading-relaxed font-mono text-xs p-4 bg-black/40 rounded-xl border border-white/5">
                    1. Double-click "Founderflow_Launcher.bat"<br/>
                    2. Login with your Portal credentials in the terminal<br/>
                    3. Stay in Step 2 while the Nexus connects.
                  </p>
                </div>
                <button 
                  onClick={nextStep}
                  className="w-full bg-orange-500 text-white font-bold py-6 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Confirm Handshake Start
                  <CheckCircle2 size={18} />
                </button>
              </motion.div>
            )}

            {/* Step 3: Global Link */}
            {step === 3 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-8 relative z-10 text-center"
              >
                <div className="w-24 h-24 mx-auto relative flex items-center justify-center">
                   <div className={`absolute inset-0 border-2 rounded-full border-blue-500/20 ${!handshakeDetected && 'animate-ping'}`} />
                   <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                     handshakeDetected ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'
                   }`}>
                     {handshakeDetected ? <CheckCircle2 size={32} /> : <Database size={32} />}
                   </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tighter mb-4">
                    {handshakeDetected ? 'Nexus Established' : 'Awaiting Cloud Handshake...'}
                  </h1>
                  <p className="text-white/40 leading-relaxed">
                    {handshakeDetected 
                      ? 'Your local outreach engine is now physically linked to the Founderflow Cloud. You are ready for acquisition.' 
                      : 'Establishing a secure AES-256 tunnel between your local hardware and our satellite nexus.'}
                  </p>
                </div>
                
                {handshakeDetected && (
                   <button 
                   onClick={() => window.location.href = '/dashboard'}
                   className="w-full bg-white text-black font-bold py-6 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
                 >
                   Enter Command Hub
                   <Zap size={18} />
                 </button>
                )}
              </motion.div>
            )}

          </AnimatePresence>
          <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.03]">
             <Zap size={200} fill="currentColor" />
          </div>
        </div>

        <p className="text-[10px] text-center uppercase tracking-[0.3em] font-bold text-white/20">
          Founderflow Elite Security Framework v4.0
        </p>
      </div>
    </div>
  );
}
