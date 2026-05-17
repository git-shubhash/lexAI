import React from 'react';
import { Menu, Search } from 'lucide-react';
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
      className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-3 md:py-5 transition-all"
      style={{
        background: 'rgba(var(--bg-app-rgb), 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* Left Section: Menu for Mobile */}
      <div className="md:hidden flex items-center gap-2">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg transition-colors hover:bg-[var(--bg-surface-hover)]"
          style={{ color: 'var(--text-muted)' }}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Middle Section: Title */}
      <div className="flex-1 text-center md:text-left">
        <h2 className="text-lg md:text-2xl font-bold tracking-tight truncate" style={{ color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
          {pageInfo.title}
        </h2>
        <p className="hidden md:block text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
          {pageInfo.subtitle}
        </p>
      </div>

      {/* Right Section: Search/Actions */}
      <div className="flex items-center gap-2 md:gap-4">
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
        
        {/* Mobile Search Button */}
        <button className="md:hidden p-2 rounded-lg" style={{ color: 'var(--text-muted)' }}>
          <Search size={20} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
