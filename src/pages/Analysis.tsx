import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  FileText, Shield, AlertTriangle, Clock, DollarSign,
  Lock, Scale, XCircle, GitMerge, ChevronDown, ChevronUp, Upload, CheckCircle, 
  AlertCircle, Info, Zap
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { exportAnalysis } from '../services/api';



const clauseIcons: Record<string, React.ReactNode> = {
  confidentiality: <Lock size={18} />,
  liability: <AlertTriangle size={18} />,
  payment: <DollarSign size={18} />,
  arbitration: <Scale size={18} />,
  termination: <XCircle size={18} />,
  non_compete: <GitMerge size={18} />,
  indemnification: <Shield size={18} />,
  governing_law: <FileText size={18} />,
};

const ClauseCard: React.FC<{ name: string; text: string }> = ({ name, text }) => {
  const [expanded, setExpanded] = useState(false);
  const label = name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="rounded-xl overflow-hidden border transition-all" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--brand-light)', color: 'var(--brand-main)' }}>
            {clauseIcons[name] || <FileText size={18} />}
          </div>
          <span className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>{label}</span>
        </div>
        <div className="p-2 rounded-full" style={{ background: 'var(--bg-app)' }}>
            {expanded ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t pt-4" style={{ borderColor: 'var(--border-subtle)' }}>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{text}</p>
        </div>
      )}
    </div>
  );
};

const Analysis: React.FC = () => {
  const { currentDocument, currentSummary } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'summary' | 'clauses' | 'risks' | 'simplified'>('summary');
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: 'txt' | 'docx' | 'pdf') => {
    if (!currentSummary || !currentDocument) return;
    setExporting(true);
    try {
      await exportAnalysis(format, { summary: currentSummary }, currentDocument.name.split('.')[0]);
    } finally {
      setExporting(false);
    }
  };

  if (!currentDocument || !currentSummary) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center animate-slide-up">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: 'var(--bg-surface-hover)', color: 'var(--text-muted)' }}>
          <FileText size={40} />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>No document analyzed</h2>
        <p className="mb-8 max-w-md" style={{ color: 'var(--text-muted)' }}>
          Upload a legal document to see AI-powered risk analysis and insights here.
        </p>
        <button
          onClick={() => navigate('/upload')}
          className="btn-primary px-6 py-3 flex items-center gap-2"
        >
          <Upload size={18} />
          Upload Document
        </button>
      </div>
    );
  }

  const summary = currentSummary;
  const tabs = ['summary', 'clauses', 'risks', 'simplified'] as const;
  const tabLabels = { summary: 'Executive Summary', clauses: 'Key Clauses', risks: 'Risk Analysis', simplified: 'Plain English' };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-slide-up pb-12">
      {/* Document Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-strong)', color: 'var(--brand-main)' }}>
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>{currentDocument.name}</h1>

          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <span className={`px-4 py-1.5 rounded-md text-sm font-bold uppercase tracking-widest badge-${summary.overall_risk_score || 'medium'}`}>
             {summary.overall_risk_score || 'MEDIUM'} RISK
          </span>

          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border-strong)' }}>
            {(['txt', 'docx', 'pdf'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => handleExport(fmt)}
                disabled={exporting}
                className="px-4 py-2 text-sm font-bold uppercase tracking-wider border-r last:border-r-0 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                style={{ background: 'var(--bg-surface)', color: 'var(--text-main)', borderColor: 'var(--border-strong)' }}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: 'Key Points', val: summary.key_legal_points?.length || 0, icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
          { label: 'Obligations', val: summary.obligations?.length || 0, icon: AlertCircle, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
          { label: 'Risks Found', val: summary.legal_risks?.length || 0, icon: Shield, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
          { label: 'Clauses',     val: Object.values(summary.clauses || {}).filter(Boolean).length, icon: FileText, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="premium-card p-6 flex flex-col items-center justify-center text-center">
               <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${s.bg} ${s.color}`}>
                  <Icon size={20} />
               </div>
               <p className="text-3xl font-black mb-1" style={{ color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>{s.val}</p>
               <p className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-xl border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
               activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pt-2">
         {/* Summary Tab */}
         {activeTab === 'summary' && (
            <div className="space-y-6">
               <div className="premium-card p-8 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30">
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-blue-900 dark:text-blue-100">
                     <Info size={20} className="text-blue-600 dark:text-blue-400" /> Executive Summary
                  </h3>
                  <p className="text-blue-800 dark:text-blue-200 text-lg leading-relaxed">{summary.short_summary}</p>
               </div>

               <div className="premium-card p-8">
                  <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--text-main)' }}>Detailed Analysis</h3>
                  <p className="leading-relaxed" style={{ color: 'var(--text-muted)' }}>{summary.detailed_summary}</p>
               </div>

               <div className="grid md:grid-cols-2 gap-6">
                  {summary.key_legal_points?.length > 0 && (
                     <div className="premium-card p-6 border-t-4 border-t-emerald-500">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                           <CheckCircle size={20} className="text-emerald-500" /> Key Legal Points
                        </h3>
                        <ul className="space-y-3">
                           {summary.key_legal_points.map((pt, i) => (
                              <li key={i} className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                                 <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                                 <span className="mt-1">{pt}</span>
                              </li>
                           ))}
                        </ul>
                     </div>
                  )}

                  {summary.obligations?.length > 0 && (
                     <div className="premium-card p-6 border-t-4 border-t-amber-500">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                           <AlertCircle size={20} className="text-amber-500" /> Obligations
                        </h3>
                        <ul className="space-y-3">
                           {summary.obligations.map((ob, i) => (
                              <li key={i} className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                                 <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">!</span>
                                 <span className="mt-1">{ob}</span>
                              </li>
                           ))}
                        </ul>
                     </div>
                  )}
               </div>

               {(summary.important_deadlines?.length > 0 || summary.penalties?.length > 0) && (
                  <div className="grid md:grid-cols-2 gap-6">
                     {summary.important_deadlines?.length > 0 && (
                        <div className="premium-card p-6">
                           <h3 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                              <Clock size={20} style={{ color: 'var(--brand-main)' }} /> Important Deadlines
                           </h3>
                           <ul className="space-y-2">
                              {summary.important_deadlines.map((d, i) => (
                                 <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-muted)' }}>
                                    <span className="text-blue-500 font-bold mt-0.5">•</span> {d}
                                 </li>
                              ))}
                           </ul>
                        </div>
                     )}
                     {summary.penalties?.length > 0 && (
                        <div className="premium-card p-6">
                           <h3 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                              <XCircle size={20} className="text-red-500" /> Penalties
                           </h3>
                           <ul className="space-y-2">
                              {summary.penalties.map((p, i) => (
                                 <li key={i} className="text-sm flex items-start gap-2 text-red-600 dark:text-red-400 font-medium">
                                    <span className="text-red-500 font-bold mt-0.5">•</span> {p}
                                 </li>
                              ))}
                           </ul>
                        </div>
                     )}
                  </div>
               )}
            </div>
         )}

         {/* Clauses Tab */}
         {activeTab === 'clauses' && (
            <div className="space-y-4">
               {Object.entries(summary.clauses || {}).filter(([, v]) => v).map(([name, text]) => (
                  <ClauseCard key={name} name={name} text={text as string} />
               ))}
               {Object.values(summary.clauses || {}).every((v) => !v) && (
                  <div className="text-center py-16 premium-card">
                     <FileText size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-700" />
                     <p className="text-lg font-medium" style={{ color: 'var(--text-muted)' }}>No specific clauses were extracted.</p>
                  </div>
               )}
            </div>
         )}

         {/* Risk Analysis Tab */}
         {activeTab === 'risks' && (
            <div className="space-y-4">
               {summary.legal_risks?.map((risk, i) => (
                  <div key={i} className={`p-6 rounded-2xl border-l-4 ${
                     risk.level === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/10' :
                     risk.level === 'medium' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/10' :
                     'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10'
                  }`}>
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                        <h4 className="font-bold text-lg" style={{ color: 'var(--text-main)' }}>{risk.risk}</h4>
                        <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider badge-${risk.level}`}>
                           {risk.level} RISK
                        </span>
                     </div>
                     <p className="text-sm md:text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>{risk.explanation}</p>
                  </div>
               ))}
               {(!summary.legal_risks || summary.legal_risks.length === 0) && (
                  <div className="text-center py-16 premium-card text-emerald-600 dark:text-emerald-400">
                     <CheckCircle size={48} className="mx-auto mb-4" />
                     <p className="text-xl font-bold">No significant risks detected.</p>
                  </div>
               )}
            </div>
         )}

         {/* Plain English Tab */}
         {activeTab === 'simplified' && (
            <div className="premium-card p-8 prose-legal max-w-none">
               <div className="flex items-center gap-3 mb-6 pb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
                     <Zap size={20} />
                  </div>
                  <h3 className="font-bold text-xl" style={{ color: 'var(--text-main)' }}>Plain English Explanation</h3>
               </div>
               <div className="text-lg leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                     {summary.simplified_explanation || summary.short_summary}
                  </ReactMarkdown>
               </div>
            </div>
         )}
      </div>
    </div>
  );
};

export default Analysis;
