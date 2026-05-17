import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, Upload, FileText, MessageSquare,
  GitCompare, History, Settings, Scale, X, ChevronDown, Pin
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { getHistory } from '../services/storage';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Home },
  { path: '/upload', label: 'Upload Center', icon: Upload },
  { path: '/analysis', label: 'Analysis', icon: FileText },
  { path: '/chat', label: 'AI Assistant', icon: MessageSquare },
  { path: '/compare', label: 'Comparison', icon: GitCompare },
  { path: '/history', label: 'History', icon: History },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar: React.FC = () => {
  const { 
    sidebarOpen, setSidebarOpen, currentDocument, 
    setCurrentDocument, setCurrentSummary, setDocumentText,
    userName 
  } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [history, setHistory] = React.useState<any[]>([]);

  // Generate initials from name
  const getInitials = (name: string | null) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length === 1) return name.slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  React.useEffect(() => {
    const fetchHistory = () => {
      const data = getHistory();
      setHistory(data.slice(0, 15)); // Show top 15 recents
    };
    fetchHistory();
    // Refresh history periodically or on specific events
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-md transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] md:w-[260px] transform flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        style={{ background: 'var(--bg-sidebar, var(--bg-surface))', borderRight: '1px solid var(--border-subtle)' }}
      >
        {/* Header with Close Button for Mobile */}
        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20" style={{ background: 'var(--brand-main)' }}>
              <Scale size={20} strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
              LexAI
            </h1>
          </div>
          <button
            className="md:hidden p-2 rounded-full hover:bg-[var(--bg-surface-hover)] transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="px-4 pb-4 space-y-1">
          {navItems.filter(i => !['/history', '/settings'].includes(i.path)).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));

            return (
              <NavLink key={item.path} to={item.path} onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}>
                <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${isActive
                  ? 'font-bold'
                  : 'font-medium opacity-80 hover:opacity-100 hover:translate-x-1'
                  }`}
                  style={{
                    background: isActive ? 'var(--brand-light)' : 'transparent',
                    color: isActive ? 'var(--brand-main)' : 'var(--text-muted)'
                  }}>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-sm">{item.label}</span>
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* Recents Section */}
        <div className="flex-1 overflow-y-auto px-4 mt-2 scrollbar-hide">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-3">
            <span>Recent Documents</span>
            <ChevronDown size={14} />
          </div>
          <div className="space-y-1">
            {history.map((item) => (
              <button 
                key={item.id} 
                onClick={() => {
                  setCurrentDocument({
                    id: item.id,
                    name: item.filename,
                    uploadedAt: item.uploadedAt,
                    summary: item.summary,
                    text: item.text,
                    size: 0, 
                    type: 'application/pdf'
                  });
                  setCurrentSummary(item.summary);
                  setDocumentText(item.text);
                  navigate('/analysis');
                  if (window.innerWidth < 768) setSidebarOpen(false);
                }} 
                className="block w-full group"
              >
                <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
                  currentDocument?.id === item.id 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200'
                }`}>
                  <span className="text-sm truncate pr-2">{item.filename}</span>
                  {currentDocument?.id === item.id && <Pin size={12} className="text-slate-400 rotate-45" />}
                </div>
              </button>
            ))}
            {history.length === 0 && (
              <p className="px-4 py-2 text-xs text-slate-500 italic">No recent analyses</p>
            )}
          </div>
        </div>

        {/* Profile Section */}
        <div className="p-5 mt-auto border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 text-blue-600 dark:text-blue-400 font-bold text-sm flex-shrink-0 shadow-sm">
                {getInitials(userName)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate uppercase" style={{ color: 'var(--text-main)' }}>{userName || 'User'}</p>
                <p className="text-[10px] uppercase font-black tracking-widest" style={{ color: 'var(--brand-main)' }}>Pro Plan</p>
              </div>
            </div>
            <NavLink to="/settings" onClick={() => window.innerWidth < 768 && setSidebarOpen(false)} className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors flex-shrink-0">
              <Settings size={20} />
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
