import React from 'react';
import { Menu, Search, Bell } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useLocation } from 'react-router-dom';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/':         { title: 'Dashboard',        subtitle: 'Overview of your legal workspace' },
  '/upload':   { title: 'Upload Center',    subtitle: 'Process and analyze new contracts' },
  '/analysis': { title: 'Analysis',         subtitle: 'Detailed legal insights and risks' },
  '/chat':     { title: 'AI Assistant',     subtitle: 'Chat with your document' },
  '/compare':  { title: 'Comparison Tool',  subtitle: 'Find differences between documents' },
  '/history':  { title: 'History',          subtitle: 'Your previously analyzed files' },
  '/settings': { title: 'Settings',         subtitle: 'Manage your preferences' },
};

const Navbar: React.FC = () => {
  const { sidebarOpen, setSidebarOpen } = useApp();
  const location = useLocation();
  const pageInfo = PAGE_TITLES[location.pathname] || PAGE_TITLES['/'];

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-8 py-5 transition-all"
      style={{
        background: 'rgba(var(--bg-app-rgb), 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div className="flex items-center gap-5">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden p-2 rounded-lg transition-colors"
          style={{ color: 'var(--text-muted)', background: 'var(--bg-surface)' }}
        >
          <Menu size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
            {pageInfo.title}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-strong)' }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search documents..."
            className="bg-transparent text-sm outline-none w-48"
            style={{ color: 'var(--text-main)' }}
          />
        </div>



        <button className="p-2.5 rounded-lg transition-all relative"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
