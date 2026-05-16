import React, { useState } from 'react';
import { Scale, ArrowRight } from 'lucide-react';
import { useApp } from '../store/AppContext';

const UserOnboarding: React.FC = () => {
  const { userName, setUserName } = useApp();
  const [nameInput, setNameInput] = useState('');

  if (userName) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      setUserName(nameInput.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-500">
      <div className="w-full max-w-md p-8 rounded-3xl shadow-2xl border bg-white dark:bg-[#0b0b0b] dark:border-white/10 animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ background: 'var(--brand-main)' }}>
            <Scale size={32} strokeWidth={2.5} />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
              Welcome to LexAI
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Your intelligent legal companion. To get started, please enter your name.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="relative">
              <input
                autoFocus
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-5 py-4 rounded-2xl border outline-none transition-all focus:ring-2 focus:ring-blue-500/20 text-lg font-medium"
                style={{ 
                  background: 'var(--bg-app)', 
                  borderColor: 'var(--border-strong)',
                  color: 'var(--text-main)'
                }}
              />
            </div>
            
            <button
              type="submit"
              disabled={!nameInput.trim()}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-bold text-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
            >
              Get Started
              <ArrowRight size={20} />
            </button>
          </form>
          
          <p className="text-xs text-slate-400 dark:text-slate-500">
            By continuing, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserOnboarding;
