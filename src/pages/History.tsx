import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History as HistoryIcon, FileText, Trash2, Search, Calendar, ArrowRight } from 'lucide-react';
import { getHistory, deleteHistoryItem, clearHistory } from '../services/storage';
import { useApp } from '../store/AppContext';
import type { HistoryItem } from '../types/index';

const History: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>(getHistory());
  const [search, setSearch] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const { setCurrentDocument, setDocumentText, setCurrentSummary } = useApp();
  const navigate = useNavigate();

  const filtered = history.filter((h) =>
    h.filename.toLowerCase().includes(search.toLowerCase())
  );

  const openItem = (item: HistoryItem) => {
    setCurrentDocument({
      id: item.id,
      name: item.filename,
      size: 0,
      type: '',
      uploadedAt: item.uploadedAt,
      summary: item.summary,
    });
    setDocumentText(item.text);
    setCurrentSummary(item.summary);
    navigate('/analysis');
  };

  const deleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteHistoryItem(id);
    setHistory(getHistory());
  };

  const handleClear = () => {
    if (confirmClear) {
      clearHistory();
      setHistory([]);
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-slide-up">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="heading-clean text-2xl">Document History</h1>
            <p className="text-slate-500 mt-1">Review previously analyzed contracts and agreements.</p>
         </div>
         <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border w-full md:w-64 transition-all focus-within:ring-2 focus-within:ring-blue-500/20"
               style={{ background: 'var(--bg-app)', borderColor: 'var(--border-strong)' }}>
               <Search size={16} style={{ color: 'var(--text-muted)' }} />
               <input
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               placeholder="Search by filename..."
               className="bg-transparent outline-none text-sm flex-1"
               style={{ color: 'var(--text-main)' }}
               />
            </div>
            {history.length > 0 && (
               <button
               onClick={handleClear}
               className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  confirmClear ? 'bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:border-red-800' : 'btn-secondary'
               }`}
               >
               <Trash2 size={16} />
               {confirmClear ? 'Confirm Clear' : 'Clear All'}
               </button>
            )}
         </div>
      </div>

      {/* Stats Cards */}
      {history.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Total Documents', val: history.length, color: 'text-blue-600 dark:text-blue-400' },
            { label: 'High Risk Found', val: history.filter((h) => h.summary?.overall_risk_score === 'high').length, color: 'text-red-500' },
            { label: 'Recent (7 Days)', val: history.filter((h) => {
              const d = new Date(h.uploadedAt);
              const now = new Date();
              return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
            }).length, color: 'text-emerald-500' },
          ].map((s) => (
            <div key={s.label} className="premium-card p-6 flex flex-col justify-center items-center text-center">
              <p className={`text-3xl font-black mb-1 ${s.color}`} style={{ fontFamily: 'var(--font-heading)' }}>{s.val}</p>
              <p className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Items List */}
      {filtered.length === 0 ? (
         <div className="flex flex-col items-center justify-center py-20 text-center premium-card">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: 'var(--bg-surface-hover)', color: 'var(--text-muted)' }}>
               <HistoryIcon size={40} />
            </div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>No history found</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
               {search ? 'Try adjusting your search terms.' : 'Upload and analyze documents to see them here.'}
            </p>
         </div>
      ) : (
         <div className="grid gap-4">
            {filtered.map((item) => (
               <div
               key={item.id}
               onClick={() => openItem(item)}
               className="group flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all border hover:shadow-md"
               style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}
               >
               {/* Icon */}
               <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--brand-light)', color: 'var(--brand-main)' }}>
                  <FileText size={24} />
               </div>

               {/* Info */}
               <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate mb-1" style={{ color: 'var(--text-main)' }}>{item.filename}</h3>
                  <div className="flex flex-wrap items-center gap-3">
                     <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--text-light)' }}>
                     <Calendar size={12} />
                     {new Date(item.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                     </span>
                     {item.summary?.document_type && (
                     <span className="text-xs font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider" style={{ borderColor: 'var(--border-strong)', color: 'var(--text-muted)' }}>
                        {item.summary.document_type}
                     </span>
                     )}
                     <span className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider badge-${item.summary?.overall_risk_score || 'medium'}`}>
                        {item.summary?.overall_risk_score || 'MEDIUM'} RISK
                     </span>
                  </div>
                  {item.summary?.short_summary && (
                     <p className="text-sm mt-3 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                     {item.summary.short_summary}
                     </p>
                  )}
               </div>

               {/* Actions */}
               <div className="flex items-center gap-3 flex-shrink-0 mt-4 md:mt-0">
                  <button
                     onClick={(e) => deleteItem(item.id, e)}
                     className="p-2 rounded-lg transition-colors hover:bg-red-50 text-slate-400 hover:text-red-500 dark:hover:bg-red-900/20"
                     title="Delete"
                  >
                     <Trash2 size={18} />
                  </button>
                  <div className="p-2 rounded-lg text-blue-600 bg-blue-50 dark:bg-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity">
                     <ArrowRight size={18} />
                  </div>
               </div>
               </div>
            ))}
         </div>
      )}
    </div>
  );
};

export default History;
