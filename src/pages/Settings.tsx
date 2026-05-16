import React, { useState } from 'react';
import {
  CheckCircle, User, Monitor, Database, Info, ExternalLink
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { clearHistory } from '../services/storage';
import { clearServerUploads } from '../services/api';

const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <button
    onClick={onChange}
    className={`relative w-10 h-6 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
  >
    <span
      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`}
    />
  </button>
);

const Settings: React.FC = () => {
  const { userName } = useApp();
  const [activeTab, setActiveTab] = useState<'general' | 'personalization' | 'data' | 'about'>('general');
  const [cleared, setCleared] = useState(false);

  const handleClearHistory = () => {
    clearHistory();
    clearServerUploads().catch(err => console.error('Failed to clear server uploads:', err));
    setCleared(true);
    setTimeout(() => setCleared(false), 2000);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Monitor },
    { id: 'personalization', label: 'Personalization', icon: User },
    { id: 'data', label: 'Data controls', icon: Database },
    { id: 'about', label: 'About', icon: Info },
  ] as const;

  return (
    <div className="w-[calc(100%+2rem)] md:w-[calc(100%+4rem)] h-[calc(100vh-88px)] -m-4 md:-m-8 flex bg-white dark:bg-[#0b0b0b] animate-slide-up">
      
      {/* Sidebar */}
      <div className="w-64 border-r border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] p-4 flex flex-col">
        <div className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-10">
        <div className="w-full">
          <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
            {tabs.find(t => t.id === activeTab)?.label}
          </h2>

          <div className="space-y-10">
            {activeTab === 'general' && (
              <>


                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Auto-Analyze</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Automatically start AI analysis after upload.</p>
                  </div>
                  <Toggle checked={true} onChange={() => {}} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Notifications</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Show alerts when document analysis finishes.</p>
                  </div>
                  <Toggle checked={true} onChange={() => {}} />
                </div>
              </>
            )}

            {activeTab === 'personalization' && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {userName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Active Profile</p>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{userName || 'User'}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Enterprise Pro License</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                   <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">Professional Identity</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Your name as it appears in document reports.</p>
                      </div>
                      <button className="text-sm font-bold text-blue-600 hover:underline">Edit</button>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Chat History & Training</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Save new chats to your history and improve LexAI models.</p>
                  </div>
                  <Toggle checked={true} onChange={() => {}} />
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-white/5">
                  <p className="text-sm font-bold text-red-600 dark:text-red-400 mb-4">Danger Zone</p>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                    <div>
                      <p className="font-semibold text-red-900 dark:text-red-200">Clear all chats</p>
                      <p className="text-xs text-red-700/60 dark:text-red-400/60">This action cannot be undone.</p>
                    </div>
                    <button
                      onClick={handleClearHistory}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        cleared ? 'bg-green-500 text-white' : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      {cleared ? 'Cleared!' : 'Clear History'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'about' && (
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-900 dark:text-white">
                    <Scale size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">LexAI Enterprise</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Version 1.0.0 (Build 2026.05)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {[
                    { label: 'Privacy Policy', icon: ExternalLink },
                    { label: 'Terms of Use', icon: ExternalLink },
                    { label: 'System Status', icon: CheckCircle, green: true },
                  ].map(item => (
                    <button key={item.label} className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                      {item.icon && <item.icon size={16} className={item.green ? 'text-green-500' : 'text-slate-400'} />}
                    </button>
                  ))}
                </div>

                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  Powered by Groq Inference Engine and Llama 3.3. All document processing is ephemeral and high-security. LexAI does not store your legal documents after the session ends.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple Scale icon since it's used in the About section
const Scale: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    <path d="M7 21h10" />
    <path d="M12 3v18" />
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
  </svg>
);

export default Settings;
